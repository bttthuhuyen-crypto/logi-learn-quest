import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/i18n/LanguageContext";

interface DeleteLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteLocationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteLocationDialogProps) => {
  const { language } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {language === 'vi' ? 'Xóa vị trí khỏi bản đồ?' : 'Remove location from map?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'vi' 
              ? 'Vị trí của bạn sẽ không còn hiển thị trên bản đồ cộng đồng. Bạn có thể thêm lại bất cứ lúc nào.'
              : 'Your location will no longer be visible on the community map. You can add it back anytime.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting 
              ? (language === 'vi' ? 'Đang xóa...' : 'Deleting...') 
              : (language === 'vi' ? 'Xóa vị trí' : 'Remove Location')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
