import React from 'react';
import { useAdminPostReports, useUpdatePostReportStatus } from '@/hooks/useReportPost';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type ReportStatus = Database['public']['Enums']['report_status'];

const REASON_LABELS: Record<string, { vi: string; en: string }> = {
  spam: { vi: 'Spam', en: 'Spam' },
  harassment: { vi: 'Quấy rối', en: 'Harassment' },
  inappropriate: { vi: 'Không phù hợp', en: 'Inappropriate' },
  scam: { vi: 'Lừa đảo', en: 'Scam' },
  impersonation: { vi: 'Mạo danh', en: 'Impersonation' },
  other: { vi: 'Khác', en: 'Other' },
};

const STATUS_CONFIG: Record<ReportStatus, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline'; labelVi: string; labelEn: string }> = {
  pending: { icon: <Clock className="w-3 h-3" />, variant: 'secondary', labelVi: 'Chờ xử lý', labelEn: 'Pending' },
  reviewed: { icon: <CheckCircle className="w-3 h-3" />, variant: 'default', labelVi: 'Đã xem xét', labelEn: 'Reviewed' },
  resolved: { icon: <CheckCircle className="w-3 h-3" />, variant: 'outline', labelVi: 'Đã giải quyết', labelEn: 'Resolved' },
};

export const PostReportsPanel: React.FC = () => {
  const { language } = useLanguage();
  const { data: reports, isLoading } = useAdminPostReports();
  const updateStatus = useUpdatePostReportStatus();

  const handleUpdateStatus = (reportId: string, status: ReportStatus) => {
    updateStatus.mutate({ reportId, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'vi' ? 'Không có báo cáo bài viết nào' : 'No post reports'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {language === 'vi' ? 'Báo cáo bài viết' : 'Post Reports'}
          <Badge variant="secondary">{reports.length}</Badge>
        </CardTitle>
      </CardHeader>

      {reports.map((report) => {
        const statusConfig = STATUS_CONFIG[report.status || 'pending'];
        const reasonLabel = REASON_LABELS[report.reason] || { vi: report.reason, en: report.reason };

        return (
          <Card key={report.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Reporter info */}
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={report.reporter?.avatar_url || ''} />
                    <AvatarFallback>
                      {report.reporter?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {report.reporter?.full_name || 'Unknown'}
                      </span>
                      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                        {statusConfig.icon}
                        {language === 'vi' ? statusConfig.labelVi : statusConfig.labelEn}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'vi' ? 'Lý do: ' : 'Reason: '}
                      <Badge variant="outline">
                        {language === 'vi' ? reasonLabel.vi : reasonLabel.en}
                      </Badge>
                    </p>

                    {report.post && (
                      <Link 
                        to={`/post/${report.post_id}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {report.post.title.length > 50 
                          ? report.post.title.slice(0, 50) + '...' 
                          : report.post.title}
                      </Link>
                    )}

                    {report.description && (
                      <p className="text-sm mt-2 p-2 bg-muted rounded">
                        {report.description}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(report.created_at), 'PPp', {
                        locale: language === 'vi' ? vi : enUS,
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col gap-2 justify-end">
                  {report.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {language === 'vi' ? 'Đã xem' : 'Mark Reviewed'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(report.id, 'resolved')}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {language === 'vi' ? 'Giải quyết' : 'Resolve'}
                      </Button>
                    </>
                  )}
                  {report.status === 'reviewed' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(report.id, 'resolved')}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {language === 'vi' ? 'Giải quyết' : 'Resolve'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
