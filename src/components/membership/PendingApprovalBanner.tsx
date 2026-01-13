import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Clock, XCircle, CheckCircle } from 'lucide-react';

interface PendingApprovalBannerProps {
  status: 'pending' | 'approved' | 'declined';
}

export const PendingApprovalBanner: React.FC<PendingApprovalBannerProps> = ({ status }) => {
  const { language } = useLanguage();

  if (status === 'approved') {
    return null;
  }

  if (status === 'declined') {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
        <XCircle className="h-5 w-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">
            {language === 'vi' ? 'Yêu cầu bị từ chối' : 'Request Declined'}
          </p>
          <p className="text-sm text-muted-foreground">
            {language === 'vi' 
              ? 'Yêu cầu tham gia của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm chi tiết.'
              : 'Your membership request was declined. Please contact Admin for more details.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3">
      <Clock className="h-5 w-5 text-amber-600" />
      <div>
        <p className="font-medium text-amber-700">
          {language === 'vi' ? 'Đang chờ duyệt' : 'Pending Approval'}
        </p>
        <p className="text-sm text-muted-foreground">
          {language === 'vi' 
            ? 'Yêu cầu tham gia của bạn đang được Admin xem xét. Vui lòng chờ thông báo.'
            : 'Your membership request is being reviewed by Admin. Please wait for notification.'}
        </p>
      </div>
    </div>
  );
};
