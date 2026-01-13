import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculatePasswordStrength, getStrengthColor } from '@/utils/passwordStrength';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Key, Eye, EyeOff, Check, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  language: 'vi' | 'en';
}

export function ChangePasswordModal({ isOpen, onClose, currentEmail, language }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const strength = calculatePasswordStrength(newPassword);

  const t = {
    title: language === 'vi' ? 'Đổi mật khẩu' : 'Change Password',
    currentPassword: language === 'vi' ? 'Mật khẩu hiện tại' : 'Current Password',
    newPassword: language === 'vi' ? 'Mật khẩu mới' : 'New Password',
    confirmPassword: language === 'vi' ? 'Xác nhận mật khẩu mới' : 'Confirm New Password',
    strength: language === 'vi' ? 'Độ mạnh' : 'Strength',
    weak: language === 'vi' ? 'Yếu' : 'Weak',
    fair: language === 'vi' ? 'Trung bình' : 'Fair',
    good: language === 'vi' ? 'Tốt' : 'Good',
    strong: language === 'vi' ? 'Mạnh' : 'Strong',
    minLength: language === 'vi' ? 'Ít nhất 8 ký tự' : 'At least 8 characters',
    hasUppercase: language === 'vi' ? 'Có chữ hoa' : 'Has uppercase',
    hasLowercase: language === 'vi' ? 'Có chữ thường' : 'Has lowercase',
    hasNumber: language === 'vi' ? 'Có số' : 'Has number',
    hasSpecial: language === 'vi' ? 'Có ký tự đặc biệt' : 'Has special character',
    cancel: language === 'vi' ? 'Hủy' : 'Cancel',
    change: language === 'vi' ? 'Đổi mật khẩu' : 'Change Password',
    success: language === 'vi' ? 'Đã đổi mật khẩu thành công' : 'Password changed successfully',
    mismatch: language === 'vi' ? 'Mật khẩu không khớp' : 'Passwords do not match',
    wrongPassword: language === 'vi' ? 'Mật khẩu hiện tại không đúng' : 'Current password is incorrect',
    error: language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred',
  };

  const getStrengthLabel = () => {
    switch (strength.label) {
      case 'weak': return t.weak;
      case 'fair': return t.fair;
      case 'good': return t.good;
      case 'strong': return t.strong;
    }
  };

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t.mismatch);
      return;
    }

    if (strength.score < 2) {
      toast.error(language === 'vi' ? 'Mật khẩu quá yếu' : 'Password is too weak');
      return;
    }

    setIsLoading(true);
    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast.error(t.wrongPassword);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast.success(t.success);
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const CheckItem = ({ checked, label }: { checked: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {checked ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={checked ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t.currentPassword}</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t.newPassword}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {newPassword && (
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t.strength}:</span>
                  <Progress 
                    value={(strength.score + 1) * 25} 
                    className="flex-1 h-2"
                  />
                  <span className={`text-sm font-medium ${
                    strength.label === 'weak' ? 'text-destructive' :
                    strength.label === 'fair' ? 'text-yellow-500' :
                    strength.label === 'good' ? 'text-blue-500' : 'text-green-500'
                  }`}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <CheckItem checked={strength.checks.minLength} label={t.minLength} />
                  <CheckItem checked={strength.checks.hasUppercase} label={t.hasUppercase} />
                  <CheckItem checked={strength.checks.hasLowercase} label={t.hasLowercase} />
                  <CheckItem checked={strength.checks.hasNumber} label={t.hasNumber} />
                  <CheckItem checked={strength.checks.hasSpecial} label={t.hasSpecial} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.change}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
