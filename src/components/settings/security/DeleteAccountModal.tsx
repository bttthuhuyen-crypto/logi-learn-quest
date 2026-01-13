import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  language: 'vi' | 'en';
  onDeleteSuccess: () => void;
}

export function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  currentEmail, 
  language,
  onDeleteSuccess,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const confirmPhrase = language === 'vi' ? 'XÓA TÀI KHOẢN' : 'DELETE ACCOUNT';

  const t = {
    title: language === 'vi' ? 'Xóa tài khoản' : 'Delete Account',
    warning: language === 'vi' 
      ? 'CẢNH BÁO: Hành động này KHÔNG THỂ hoàn tác!' 
      : 'WARNING: This action CANNOT be undone!',
    consequences: language === 'vi' ? 'Khi xóa tài khoản, bạn sẽ mất:' : 'When you delete your account, you will lose:',
    item1: language === 'vi' ? 'Tất cả dữ liệu hồ sơ' : 'All profile data',
    item2: language === 'vi' ? 'Lịch sử đơn hàng' : 'Order history',
    item3: language === 'vi' ? 'Tiến độ học tập' : 'Learning progress',
    item4: language === 'vi' ? 'Số dư affiliate' : 'Affiliate balance',
    typeToConfirm: language === 'vi' 
      ? `Nhập "${confirmPhrase}" để xác nhận` 
      : `Type "${confirmPhrase}" to confirm`,
    password: language === 'vi' ? 'Nhập mật khẩu' : 'Enter password',
    understand: language === 'vi' 
      ? 'Tôi hiểu rằng thao tác này không thể hoàn tác' 
      : 'I understand this cannot be undone',
    cancel: language === 'vi' ? 'Hủy' : 'Cancel',
    delete: language === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete',
    wrongPassword: language === 'vi' ? 'Mật khẩu không đúng' : 'Incorrect password',
    success: language === 'vi' ? 'Tài khoản đã được xóa' : 'Account deleted successfully',
    error: language === 'vi' ? 'Có lỗi xảy ra khi xóa tài khoản' : 'Failed to delete account',
  };

  const isValid = confirmText === confirmPhrase && password && understood;

  const handleDelete = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Verify password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password,
      });

      if (signInError) {
        toast.error(t.wrongPassword);
        return;
      }

      // Call edge function to delete account
      const { error } = await supabase.functions.invoke('delete-account', {
        body: { password },
      });

      if (error) throw error;

      toast.success(t.success);
      onDeleteSuccess();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setPassword('');
    setUnderstood(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-semibold">{t.warning}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">{t.consequences}</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>{t.item1}</li>
              <li>{t.item2}</li>
              <li>{t.item3}</li>
              <li>{t.item4}</li>
            </ul>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmText">{t.typeToConfirm}</Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmPhrase}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deletePassword">{t.password}</Label>
              <Input
                id="deletePassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="understood"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked === true)}
              />
              <label
                htmlFor="understood"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {t.understand}
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t.cancel}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={!isValid || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
