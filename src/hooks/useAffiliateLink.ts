import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AffiliateLink {
  id: string;
  user_id: string;
  referral_code: string;
  created_at: string;
}

interface AffiliateStats {
  total_clicks: number;
  total_signups: number;
  total_purchases: number;
}

export const useAffiliateLink = () => {
  const { user } = useAuth();

  const {
    data: affiliateLink,
    isLoading: isLoadingLink,
    error: linkError,
  } = useQuery({
    queryKey: ['affiliate-link', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no link exists, it might be a legacy user - create one
        if (error.code === 'PGRST116') {
          // Call RPC to generate code and insert
          const { data: newLink, error: insertError } = await supabase
            .from('affiliate_links')
            .insert({
              user_id: user.id,
              referral_code: await generateReferralCode(),
            })
            .select()
            .single();

          if (insertError) throw insertError;
          return newLink as AffiliateLink;
        }
        throw error;
      }

      return data as AffiliateLink;
    },
    enabled: !!user?.id,
  });

  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['affiliate-stats', affiliateLink?.id],
    queryFn: async () => {
      if (!affiliateLink?.id) return null;

      // Get click count
      const { count: clickCount } = await supabase
        .from('referral_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_link_id', affiliateLink.id);

      // Get referral count (successful signups)
      const { count: signupCount } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', user?.id);

      // Get purchase count (confirmed referrals)
      const { count: purchaseCount } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', user?.id)
        .in('status', ['confirmed', 'paid']);

      return {
        total_clicks: clickCount || 0,
        total_signups: signupCount || 0,
        total_purchases: purchaseCount || 0,
      } as AffiliateStats;
    },
    enabled: !!affiliateLink?.id && !!user?.id,
  });

  const getReferralUrl = () => {
    if (!affiliateLink?.referral_code) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/?ref=${affiliateLink.referral_code}`;
  };

  return {
    affiliateLink,
    referralCode: affiliateLink?.referral_code || '',
    referralUrl: getReferralUrl(),
    stats,
    isLoading: isLoadingLink || isLoadingStats,
    error: linkError,
  };
};

// Helper function to generate a referral code client-side as fallback
async function generateReferralCode(): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
