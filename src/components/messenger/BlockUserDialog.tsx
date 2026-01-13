import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/i18n/LanguageContext';

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  isBlocked: boolean;
  onConfirm: () => void;
  isPending?: boolean;
}

export const BlockUserDialog: React.FC<BlockUserDialogProps> = ({
  open,
  onOpenChange,
  userName,
  isBlocked,
  onConfirm,
  isPending = false,
}) => {
  const { language } = useLanguage();

  const title = isBlocked
    ? language === 'vi'
      ? `Bỏ chặn ${userName}?`
      : `Unblock ${userName}?`
    : language === 'vi'
    ? `Chặn ${userName}?`
    : `Block ${userName}?`;

  const description = isBlocked
    ? language === 'vi'
      ? `${userName} sẽ có thể gửi tin nhắn cho bạn và bạn sẽ thấy các cuộc trò chuyện với họ.`
      : `${userName} will be able to send you messages and you will see conversations with them.`
    : language === 'vi'
    ? `${userName} sẽ không thể gửi tin nhắn cho bạn. Bạn cũng sẽ không nhận được tin nhắn từ họ.`
    : `${userName} won't be able to send you messages. You also won't receive messages from them.`;

  const confirmText = isBlocked
    ? language === 'vi'
      ? 'Bỏ chặn'
      : 'Unblock'
    : language === 'vi'
    ? 'Chặn'
    : 'Block';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className={!isBlocked ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isPending
              ? language === 'vi'
                ? 'Đang xử lý...'
                : 'Processing...'
              : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
