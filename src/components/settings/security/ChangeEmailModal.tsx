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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertTriangle } from 'lucide-react';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  language: 'vi' | 'en';
}

export function ChangeEmailModal({ isOpen, onClose, currentEmail, language }: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    title: language === 'vi' ? 'Thay đổi email' : 'Change Email',
    currentEmail: language === 'vi' ? 'Email hiện tại' : 'Current email',
    newEmail: language === 'vi' ? 'Email mới' : 'New Email',
    password: language === 'vi' ? 'Nhập mật khẩu để xác nhận' : 'Enter password to confirm',
    warning: language === 'vi' 
      ? 'Bạn sẽ nhận được email xác nhận tại địa chỉ mới' 
      : 'You will receive a confirmation email at the new address',
    cancel: language === 'vi' ? 'Hủy' : 'Cancel',
    update: language === 'vi' ? 'Cập nhật email' : 'Update Email',
    success: language === 'vi' 
      ? 'Đã gửi email xác nhận đến địa chỉ mới' 
      : 'Confirmation email sent to new address',
    error: language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred',
  };

  const handleSubmit = async () => {
    if (!newEmail || !password) return;

    setIsLoading(true);
    try {
      // First verify password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password,
      });

      if (signInError) {
        toast.error(language === 'vi' ? 'Mật khẩu không đúng' : 'Incorrect password');
        return;
      }

      // Update email
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      toast.success(t.success);
      onClose();
      setNewEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error changing email:', error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {t.currentEmail}: <span className="font-medium">{currentEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">{t.newEmail}</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{t.warning}</AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !newEmail || !password}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.update}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
