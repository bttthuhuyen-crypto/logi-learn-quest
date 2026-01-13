import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/i18n/LanguageContext';
import { useReportUser } from '@/hooks/useReportUser';
import { Database } from '@/integrations/supabase/types';

type ReportReason = Database['public']['Enums']['report_reason'];

interface ReportUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const REPORT_REASONS: { value: ReportReason; labelVi: string; labelEn: string }[] = [
  { value: 'spam', labelVi: 'Spam', labelEn: 'Spam' },
  { value: 'harassment', labelVi: 'Quấy rối', labelEn: 'Harassment' },
  { value: 'inappropriate', labelVi: 'Nội dung không phù hợp', labelEn: 'Inappropriate content' },
  { value: 'scam', labelVi: 'Lừa đảo', labelEn: 'Scam' },
  { value: 'impersonation', labelVi: 'Mạo danh', labelEn: 'Impersonation' },
  { value: 'other', labelVi: 'Khác', labelEn: 'Other' },
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  open,
  onOpenChange,
  userId,
  userName,
}) => {
  const { language } = useLanguage();
  const { reportUser } = useReportUser();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    await reportUser.mutateAsync({
      reportedUserId: userId,
      reason,
      description: description.trim() || undefined,
    });
    onOpenChange(false);
    setReason('spam');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'vi' ? `Báo cáo ${userName}` : `Report ${userName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              {language === 'vi' ? 'Lý do báo cáo' : 'Report reason'}
            </Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {language === 'vi' ? r.labelVi : r.labelEn}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-2 block">
              {language === 'vi' ? 'Mô tả chi tiết (tùy chọn)' : 'Additional details (optional)'}
            </Label>
            <Textarea
              id="description"
              placeholder={
                language === 'vi'
                  ? 'Cung cấp thêm thông tin về vấn đề...'
                  : 'Provide more details about the issue...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reportUser.isPending}
            variant="destructive"
          >
            {reportUser.isPending
              ? language === 'vi'
                ? 'Đang gửi...'
                : 'Sending...'
              : language === 'vi'
              ? 'Gửi báo cáo'
              : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
