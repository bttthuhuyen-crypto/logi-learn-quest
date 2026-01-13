import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MemberProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  position: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  level: number | null;
  points: number | null;
  created_at: string;
  role: 'owner' | 'admin' | 'moderator' | 'paid_member' | 'free_member' | null;
  presence_status: 'online' | 'away' | 'offline' | null;
  show_online_status: boolean | null;
  last_seen_at: string | null;
}

export const useMemberProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['member-profile', userId],
    queryFn: async (): Promise<MemberProfile | null> => {
      if (!userId) return null;

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Fetch role from community_members (get highest role)
      const { data: memberData } = await supabase
        .from('community_members')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: true })
        .limit(1)
        .maybeSingle();

      // Fetch presence
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('status, show_online_status, last_seen_at')
        .eq('user_id', userId)
        .maybeSingle();

      // Check if online recently (within 5 minutes)
      const isOnlineRecently = presenceData?.last_seen_at 
        ? new Date(presenceData.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000)
        : false;

      return {
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        company: profile.company,
        position: profile.position,
        website_url: profile.website_url,
        linkedin_url: profile.linkedin_url,
        facebook_url: profile.facebook_url,
        youtube_url: profile.youtube_url,
        level: profile.level,
        points: profile.points,
        created_at: profile.created_at,
        role: (memberData?.role === 'member' ? 'free_member' : memberData?.role) || null,
        presence_status: presenceData?.show_online_status && isOnlineRecently 
          ? presenceData.status 
          : 'offline',
        show_online_status: presenceData?.show_online_status ?? true,
        last_seen_at: presenceData?.last_seen_at || null,
      };
    },
    enabled: !!userId,
  });
};
