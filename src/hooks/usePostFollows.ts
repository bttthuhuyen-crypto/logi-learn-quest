import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserPostFollows = (postIds: string[]) => {
  return useQuery({
    queryKey: ['post-follows', postIds],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('post_follows')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      if (error) throw error;
      return data.map(follow => follow.post_id);
    },
    enabled: postIds.length > 0,
  });
};

export const useTogglePostFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isFollowing }: { postId: string; isFollowing: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isFollowing) {
        const { error } = await supabase
          .from('post_follows')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_follows')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-follows'] });
    },
  });
};
