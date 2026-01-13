import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NearbyMember {
  user_id: string;
  distance_km: number;
  latitude: number;
  longitude: number;
  display_name: string;
}

export const useNearbyMembers = (
  lat: number | null,
  lng: number | null,
  radiusKm: number = 50,
  communityId?: string
) => {
  return useQuery({
    queryKey: ['nearby-members', lat, lng, radiusKm, communityId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_nearby_members', {
        user_lat: lat!,
        user_lng: lng!,
        radius_km: radiusKm,
        community_uuid: communityId || null,
        limit_count: 50
      });

      if (error) throw error;
      return data as NearbyMember[];
    },
    enabled: lat !== null && lng !== null,
  });
};
