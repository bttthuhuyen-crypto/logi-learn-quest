import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

interface PayoutRequest {
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
}

interface CreatePayoutParams {
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_branch?: string;
}

export const usePayoutRequests = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const {
    data: payoutRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payout-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PayoutRequest[];
    },
    enabled: !!user?.id,
  });

  const createPayoutMutation = useMutation({
    mutationFn: async (params: CreatePayoutParams) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payout_requests')
        .insert({
          user_id: user.id,
          amount: params.amount,
          bank_name: params.bank_name,
          bank_account_number: params.bank_account_number,
          bank_account_name: params.bank_account_name,
          bank_branch: params.bank_branch || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PayoutRequest;
    },
    onSuccess: () => {
      toast.success(t.admin.settingsSaved);
      queryClient.invalidateQueries({ queryKey: ['payout-requests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['affiliate-balance', user?.id] });
    },
    onError: (error) => {
      console.error('Error creating payout request:', error);
      toast.error(t.errors.somethingWentWrong);
    },
  });

  // Stats
  const stats = {
    totalRequested: payoutRequests?.reduce((sum, p) => sum + p.amount, 0) || 0,
    pending: payoutRequests?.filter(p => p.status === 'pending').length || 0,
    completed: payoutRequests?.filter(p => p.status === 'completed').length || 0,
  };

  return {
    payoutRequests: payoutRequests || [],
    stats,
    isLoading,
    error,
    refetch,
    createPayout: createPayoutMutation.mutateAsync,
    isCreating: createPayoutMutation.isPending,
  };
};
