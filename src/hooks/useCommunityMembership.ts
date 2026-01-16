import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MembershipStatus {
  isMember: boolean;
  isPending: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  role: string | null;
  status: string | null;
}

// Check if user has a pending membership request
async function checkPendingRequest(communityId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('membership_requests')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .maybeSingle();
  
  return !!data;
}

export function useCommunityMembership(communityId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['community-membership', communityId, user?.id],
    queryFn: async (): Promise<MembershipStatus> => {
      if (!user?.id || !communityId) {
        return {
          isMember: false,
          isPending: false,
          isAdmin: false,
          isOwner: false,
          role: null,
          status: null,
        };
      }

      const { data, error } = await supabase
        .from('community_members')
        .select('role, status')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Check for pending membership request
        const hasPendingRequest = await checkPendingRequest(communityId, user.id);
        return {
          isMember: false,
          isPending: hasPendingRequest,
          isAdmin: false,
          isOwner: false,
          role: null,
          status: null,
        };
      }

      return {
        isMember: data.status === 'active',
        isPending: false,
        isAdmin: data.role === 'admin' || data.role === 'owner',
        isOwner: data.role === 'owner',
        role: data.role,
        status: data.status,
      };
    },
    enabled: !!communityId,
  });
}
