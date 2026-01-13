import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type ReportReason = Database['public']['Enums']['report_reason'];
type ReportStatus = Database['public']['Enums']['report_status'];

interface ReportPostParams {
  postId: string;
  reason: ReportReason;
  description?: string;
}

interface PostReport {
  id: string;
  reporter_id: string;
  post_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reporter?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  post?: {
    title: string;
    author_id: string;
  };
}

export const useReportPost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reportPost = useMutation({
    mutationFn: async ({ postId, reason, description }: ReportPostParams) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_reports')
        .insert({
          reporter_id: user.id,
          post_id: postId,
          reason,
          description,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reports'] });
      toast.success('Đã gửi báo cáo. Chúng tôi sẽ xem xét trong thời gian sớm nhất.');
    },
    onError: () => {
      toast.error('Không thể gửi báo cáo');
    },
  });

  return {
    reportPost,
  };
};

export const useAdminPostReports = () => {
  return useQuery({
    queryKey: ['admin-post-reports'],
    queryFn: async () => {
      // Fetch reports first
      const { data: reports, error: reportsError } = await supabase
        .from('post_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (reportsError) throw reportsError;
      if (!reports || reports.length === 0) return [] as PostReport[];
      
      // Fetch related data
      const reporterIds = [...new Set(reports.map(r => r.reporter_id))];
      const postIds = [...new Set(reports.map(r => r.post_id))];

      const [profilesResult, postsResult] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', reporterIds),
        supabase.from('posts').select('id, title, author_id').in('id', postIds)
      ]);

      const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
      const postsMap = new Map(postsResult.data?.map(p => [p.id, p]) || []);

      return reports.map(report => ({
        ...report,
        reporter: profilesMap.get(report.reporter_id),
        post: postsMap.get(report.post_id)
      })) as PostReport[];
    },
  });
};

export const useUpdatePostReportStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: ReportStatus }) => {
      const { error } = await supabase
        .from('post_reports')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-post-reports'] });
      toast.success('Đã cập nhật trạng thái báo cáo');
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái');
    },
  });
};
