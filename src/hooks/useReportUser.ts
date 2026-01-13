import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type ReportReason = Database['public']['Enums']['report_reason'];

interface ReportUserParams {
  reportedUserId: string;
  reason: ReportReason;
  description?: string;
}

export const useReportUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reportUser = useMutation({
    mutationFn: async ({ reportedUserId, reason, description }: ReportUserParams) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_id: reportedUserId,
          reason,
          description,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reports'] });
      toast.success('Đã gửi báo cáo. Chúng tôi sẽ xem xét trong thời gian sớm nhất.');
    },
    onError: () => {
      toast.error('Không thể gửi báo cáo');
    },
  });

  return {
    reportUser,
  };
};
