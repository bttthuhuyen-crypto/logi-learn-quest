import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getLevelName } from "@/utils/levelConfig";

export interface UserLocation {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  displayName: string | null;
  city: string | null;
  country: string | null;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  levelName: string;
  bio: string | null;
  isOnline: boolean;
}

export const useUserLocations = (communityId?: string) => {
  return useQuery({
    queryKey: ['user-locations', communityId],
    queryFn: async () => {
      // First, fetch locations with profiles
      let query = supabase
        .from('user_locations')
        .select(`
          id,
          user_id,
          latitude,
          longitude,
          display_name,
          city,
          country,
          profiles:user_id (
            full_name,
            avatar_url,
            level,
            bio
          )
        `)
        .eq('is_visible', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data: locationsData, error: locationsError } = await query;

      if (locationsError) throw locationsError;
      if (!locationsData || locationsData.length === 0) return [];

      // Fetch presence data for all users
      const userIds = locationsData.map(loc => loc.user_id);
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('user_id, status, show_online_status')
        .in('user_id', userIds);

      const presenceMap = new Map(
        presenceData?.map(p => [p.user_id, p]) || []
      );

      return locationsData.map((loc): UserLocation => {
        const profile = loc.profiles as any;
        const presence = presenceMap.get(loc.user_id);
        const level = profile?.level || 1;
        
        return {
          id: loc.id,
          userId: loc.user_id,
          latitude: loc.latitude!,
          longitude: loc.longitude!,
          displayName: loc.display_name || (loc.city && loc.country ? `${loc.city}, ${loc.country}` : loc.city || loc.country),
          city: loc.city,
          country: loc.country,
          fullName: profile?.full_name || 'Anonymous',
          avatarUrl: profile?.avatar_url || null,
          level,
          levelName: getLevelName(level),
          bio: profile?.bio || null,
          isOnline: presence?.show_online_status !== false && presence?.status === 'online',
        };
      });
    },
  });
};
