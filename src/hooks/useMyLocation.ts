import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MyLocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  display_name?: string;
  is_visible?: boolean;
}

export const useMyLocation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: myLocation, isLoading } = useQuery({
    queryKey: ['my-location', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateLocation = useMutation({
    mutationFn: async (locationData: MyLocationData) => {
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user?.id,
          ...locationData,
          last_updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-location'] });
      queryClient.invalidateQueries({ queryKey: ['user-locations'] });
      toast({
        title: "Đã cập nhật vị trí",
        description: "Vị trí của bạn đã được lưu thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật vị trí. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async (isVisible: boolean) => {
      const { error } = await supabase
        .from('user_locations')
        .update({ is_visible: isVisible })
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-location'] });
      queryClient.invalidateQueries({ queryKey: ['user-locations'] });
    },
  });

  return { 
    myLocation, 
    isLoading, 
    updateLocation, 
    toggleVisibility 
  };
};
