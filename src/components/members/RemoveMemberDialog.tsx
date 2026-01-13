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

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  memberName,
  onConfirm,
  isLoading = false,
}: RemoveMemberDialogProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t.memberSettings.removeConfirmTitle.replace('{name}', memberName)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t.memberSettings.removeConfirmDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t.common.loading : t.memberSettings.removeFromCommunity}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
