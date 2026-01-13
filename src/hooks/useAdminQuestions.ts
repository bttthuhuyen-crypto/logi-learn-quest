import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MembershipQuestion } from './useMembership';

export const useAdminQuestions = () => {
  const [questions, setQuestions] = useState<MembershipQuestion[]>([]);
  const [questionsEnabled, setQuestionsEnabled] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [loading, setLoading] = useState(true);

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
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('community_settings')
      .select('*');

    if (data) {
      const enabledSetting = data.find(s => s.key === 'membership_questions_enabled');
      const autoApproveSetting = data.find(s => s.key === 'auto_approve');
      
      setQuestionsEnabled(enabledSetting?.value === 'true' || enabledSetting?.value === true);
      setAutoApprove(autoApproveSetting?.value === 'true' || autoApproveSetting?.value === true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: boolean) => {
    const { error } = await supabase
      .from('community_settings')
      .upsert({ key, value: value.toString() }, { onConflict: 'key' });

    if (!error) {
      if (key === 'membership_questions_enabled') {
        setQuestionsEnabled(value);
      } else if (key === 'auto_approve') {
        setAutoApprove(value);
      }
    }

    return { error };
  };

  const addQuestion = async (question: Omit<MembershipQuestion, 'id'>) => {
    const { data, error } = await supabase
      .from('membership_questions')
      .insert({
        question_text: question.question_text,
        question_text_en: question.question_text_en,
        question_type: question.question_type,
        options: question.options,
        order_index: questions.length,
        is_required: question.is_required
      })
      .select()
      .single();

    if (!error && data) {
      await fetchQuestions();
    }

    return { data, error };
  };

  const updateQuestion = async (id: string, updates: Partial<MembershipQuestion>) => {
    const { error } = await supabase
      .from('membership_questions')
      .update({
        question_text: updates.question_text,
        question_text_en: updates.question_text_en,
        question_type: updates.question_type,
        options: updates.options,
        is_required: updates.is_required
      })
      .eq('id', id);

    if (!error) {
      await fetchQuestions();
    }

    return { error };
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase
      .from('membership_questions')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchQuestions();
    }

    return { error };
  };

  return {
    questions,
    questionsEnabled,
    autoApprove,
    loading,
    updateSetting,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    refetch: fetchQuestions
  };
};
