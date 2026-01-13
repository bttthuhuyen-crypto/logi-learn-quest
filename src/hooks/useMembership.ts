import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MembershipQuestion {
  id: string;
  question_text: string;
  question_text_en: string | null;
  question_type: 'text' | 'multiple_choice' | 'email';
  options: string[];
  order_index: number;
  is_required: boolean;
}

export interface MembershipRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'declined';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface MembershipAnswer {
  id: string;
  request_id: string;
  question_id: string;
  answer_text: string;
}

export const useMembership = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<MembershipQuestion[]>([]);
  const [userRequest, setUserRequest] = useState<MembershipRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionsEnabled, setQuestionsEnabled] = useState(true);

  useEffect(() => {
    fetchQuestions();
    fetchSettings();
    if (user) {
      fetchUserRequest();
    }
  }, [user]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('membership_questions')
      .select('*')
      .order('order_index');

    if (!error && data) {
      setQuestions(data.map(q => ({
        ...q,
        question_type: q.question_type as 'text' | 'multiple_choice' | 'email',
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string || '[]')
      })));
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('community_settings')
      .select('*')
      .eq('key', 'membership_questions_enabled')
      .maybeSingle();

    if (data) {
      setQuestionsEnabled(data.value === 'true' || data.value === true);
    }
  };

  const fetchUserRequest = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('membership_requests')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setUserRequest(data as MembershipRequest);
    }
  };

  const submitRequest = async (answers: { questionId: string; answer: string }[]) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Check if auto-approve is enabled
    const { data: autoApproveData } = await supabase
      .from('community_settings')
      .select('value')
      .eq('key', 'auto_approve')
      .maybeSingle();

    const autoApprove = autoApproveData?.value === 'true' || autoApproveData?.value === true;

    // Create membership request
    const { data: request, error: requestError } = await supabase
      .from('membership_requests')
      .insert({
        user_id: user.id,
        status: autoApprove ? 'approved' : 'pending'
      })
      .select()
      .single();

    if (requestError) return { error: requestError };

    // Insert answers
    const answersToInsert = answers.map(a => ({
      request_id: request.id,
      question_id: a.questionId,
      answer_text: a.answer
    }));

    const { error: answersError } = await supabase
      .from('membership_answers')
      .insert(answersToInsert);

    if (answersError) return { error: answersError };

    setUserRequest(request as MembershipRequest);
    return { error: null, autoApproved: autoApprove };
  };

  return {
    questions,
    userRequest,
    loading,
    questionsEnabled,
    submitRequest,
    refetch: fetchUserRequest
  };
};

export const useAdminMembership = () => {
  const [requests, setRequests] = useState<(MembershipRequest & { 
    profile?: { full_name: string; avatar_url: string };
    answers?: (MembershipAnswer & { question?: MembershipQuestion })[];
  })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async (status?: 'pending' | 'approved' | 'declined') => {
    setLoading(true);
    
    let query = supabase
      .from('membership_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requestsData, error } = await query;

    if (error || !requestsData) {
      setLoading(false);
      return;
    }

    // Fetch profiles and answers for each request
    const enrichedRequests = await Promise.all(
      requestsData.map(async (request) => {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', request.user_id)
          .maybeSingle();

        // Fetch answers with questions
        const { data: answers } = await supabase
          .from('membership_answers')
          .select('*')
          .eq('request_id', request.id);

        // Fetch questions for the answers
        const { data: questions } = await supabase
          .from('membership_questions')
          .select('*')
          .order('order_index');

        const enrichedAnswers: (MembershipAnswer & { question?: MembershipQuestion })[] = answers?.map(answer => {
          const questionData = questions?.find(q => q.id === answer.question_id);
          return {
            id: answer.id,
            request_id: answer.request_id,
            question_id: answer.question_id,
            answer_text: answer.answer_text,
            question: questionData ? {
              id: questionData.id,
              question_text: questionData.question_text,
              question_text_en: questionData.question_text_en,
              question_type: questionData.question_type as 'text' | 'multiple_choice' | 'email',
              options: Array.isArray(questionData.options) ? questionData.options as string[] : [],
              order_index: questionData.order_index,
              is_required: questionData.is_required
            } : undefined
          };
        }) || [];

        return {
          id: request.id,
          user_id: request.user_id,
          status: request.status as 'pending' | 'approved' | 'declined',
          reviewed_by: request.reviewed_by,
          reviewed_at: request.reviewed_at,
          created_at: request.created_at,
          profile: profile ? { full_name: profile.full_name || '', avatar_url: profile.avatar_url || '' } : undefined,
          answers: enrichedAnswers
        };
      })
    );

    setRequests(enrichedRequests);
    setLoading(false);
  };

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'declined', reviewerId: string) => {
    // Get the request to find user_id
    const request = requests.find(r => r.id === requestId);
    if (!request) {
      return { error: new Error('Request not found') };
    }

    const { error } = await supabase
      .from('membership_requests')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      return { error };
    }

    // Send notifications based on status
    if (status === 'approved') {
      // Call auto-dm-on-approval edge function
      try {
        await supabase.functions.invoke('auto-dm-on-approval', {
          body: { 
            user_id: request.user_id, 
            user_name: request.profile?.full_name || 'Thành viên'
          }
        });
      } catch (dmError) {
        console.error('Error sending auto DM:', dmError);
        // Don't fail the whole operation if DM fails
      }

      // Create membership_approved notification
      await supabase.from('notifications').insert([{
        user_id: request.user_id,
        type: 'membership_approved',
        title: 'Yêu cầu tham gia đã được duyệt',
        message: 'Chào mừng! Bạn đã được chấp nhận vào cộng đồng.',
        actor_id: reviewerId,
        is_read: false,
      }]);
    } else if (status === 'declined') {
      // Create membership_declined notification
      await supabase.from('notifications').insert([{
        user_id: request.user_id,
        type: 'membership_declined',
        title: 'Yêu cầu tham gia bị từ chối',
        message: 'Rất tiếc, yêu cầu tham gia của bạn đã bị từ chối.',
        actor_id: reviewerId,
        is_read: false,
      }]);
    }

    await fetchRequests();
    return { error: null };
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    fetchRequests,
    updateRequestStatus
  };
};
