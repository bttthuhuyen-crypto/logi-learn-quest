import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

export const useUserLocations = (communityId?: string) => {
  return useQuery({
    queryKey: ['user-locations', communityId],
    queryFn: async () => {
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
            level
          )
        `)
        .eq('is_visible', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map((loc): UserLocation => ({
        id: loc.id,
        userId: loc.user_id,
        latitude: loc.latitude!,
        longitude: loc.longitude!,
        displayName: loc.display_name,
        city: loc.city,
        country: loc.country,
        fullName: (loc.profiles as any)?.full_name || 'Anonymous',
        avatarUrl: (loc.profiles as any)?.avatar_url || null,
        level: (loc.profiles as any)?.level || 1,
      })) || [];
    },
  });
};
