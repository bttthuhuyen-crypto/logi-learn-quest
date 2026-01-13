import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  course_id: string | null;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'reversed';
  pending_until: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  referred_user?: {
    full_name: string | null;
  };
  course?: {
    title: string;
  } | null;
}

export const useAffiliateReferrals = () => {
  const { user } = useAuth();

  const {
    data: referrals,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['affiliate-referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get referrals with related data
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          course:courses(title)
        `)
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get referred user profiles separately
      const referralsWithProfiles = await Promise.all(
        (data || []).map(async (referral) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', referral.referred_user_id)
            .single();

          return {
            ...referral,
            referred_user: profile,
          };
        })
      );

      return referralsWithProfiles as Referral[];
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const stats = {
    total: referrals?.length || 0,
    pending: referrals?.filter(r => r.status === 'pending').length || 0,
    confirmed: referrals?.filter(r => r.status === 'confirmed').length || 0,
    paid: referrals?.filter(r => r.status === 'paid').length || 0,
    reversed: referrals?.filter(r => r.status === 'reversed').length || 0,
  };

  return {
    referrals: referrals || [],
    stats,
    isLoading,
    error,
    refetch,
  };
};
