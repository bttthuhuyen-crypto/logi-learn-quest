import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  post_title: string;
  like_count: number;
}

export function useMemberComments(userId: string, page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ["member-comments", userId, page],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          like_count,
          post_id,
          posts!inner(id, title)
        `, { count: "exact" })
        .eq("author_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const comments: Comment[] = (data || []).map((item: any) => ({
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        post_id: item.post_id,
        post_title: item.posts?.title || "Untitled",
        like_count: item.like_count,
      }));

      return {
        comments,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    enabled: !!userId,
  });
}
