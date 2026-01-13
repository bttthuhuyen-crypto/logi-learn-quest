import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

interface PayoutRequestWithProfile {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_branch: string | null;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  processed_by: string | null;
  processed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useAdminPayoutRequests = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const {
    data: payoutRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-payout-requests'],
    queryFn: async () => {
      // Fetch payout requests
      const { data: requests, error: requestsError } = await supabase
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch profiles for user_ids
      const userIds = [...new Set(requests?.map(r => r.user_id) || [])];
      
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Map profiles to requests
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      
      return (requests || []).map(request => ({
        ...request,
        profile: profileMap.get(request.user_id) || null,
      })) as PayoutRequestWithProfile[];
    },
    enabled: !!user?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      rejectionReason 
    }: { 
      requestId: string; 
      status: 'processing' | 'completed' | 'rejected';
      rejectionReason?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const updateData: Record<string, unknown> = {
        status,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('payout_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // If completed, update the affiliate balance
      if (status === 'completed') {
        const request = payoutRequests?.find(r => r.id === requestId);
        if (request) {
          // Fetch current balance and update
          const { data: currentBalance } = await supabase
            .from('affiliate_balances')
            .select('available_amount, total_withdrawn')
            .eq('user_id', request.user_id)
            .maybeSingle();

          if (currentBalance) {
            await supabase
              .from('affiliate_balances')
              .update({
                available_amount: Math.max(0, currentBalance.available_amount - request.amount),
                total_withdrawn: currentBalance.total_withdrawn + request.amount,
              })
              .eq('user_id', request.user_id);
          }
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      const statusMessages: Record<string, string> = {
        processing: t.status.processing,
        completed: t.status.completed,
        rejected: t.status.rejected,
      };
      toast.success(statusMessages[variables.status] || t.admin.settingsSaved);
      queryClient.invalidateQueries({ queryKey: ['admin-payout-requests'] });
    },
    onError: (error) => {
      console.error('Error updating payout status:', error);
      toast.error(t.errors.somethingWentWrong);
    },
  });

  // Stats
  const stats = {
    total: payoutRequests?.length || 0,
    pending: payoutRequests?.filter(p => p.status === 'pending').length || 0,
    processing: payoutRequests?.filter(p => p.status === 'processing').length || 0,
    completed: payoutRequests?.filter(p => p.status === 'completed').length || 0,
    rejected: payoutRequests?.filter(p => p.status === 'rejected').length || 0,
    totalAmount: payoutRequests?.reduce((sum, p) => sum + p.amount, 0) || 0,
    pendingAmount: payoutRequests?.filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + p.amount, 0) || 0,
  };

  return {
    payoutRequests: payoutRequests || [],
    stats,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
};
