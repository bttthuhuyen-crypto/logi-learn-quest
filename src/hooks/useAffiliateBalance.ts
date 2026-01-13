import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AffiliateBalance {
  id: string;
  user_id: string;
  total_earned: number;
  pending_amount: number;
  available_amount: number;
  total_withdrawn: number;
  updated_at: string;
}

export const useAffiliateBalance = () => {
  const { user } = useAuth();

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['affiliate-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('affiliate_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no balance exists, create one
        if (error.code === 'PGRST116') {
          const { data: newBalance, error: insertError } = await supabase
            .from('affiliate_balances')
            .insert({ user_id: user.id })
            .select()
            .single();

          if (insertError) throw insertError;
          return newBalance as AffiliateBalance;
        }
        throw error;
      }

      return data as AffiliateBalance;
    },
    enabled: !!user?.id,
  });

  return {
    balance,
    totalEarned: balance?.total_earned || 0,
    pendingAmount: balance?.pending_amount || 0,
    availableAmount: balance?.available_amount || 0,
    totalWithdrawn: balance?.total_withdrawn || 0,
    isLoading,
    error,
    refetch,
  };
};
