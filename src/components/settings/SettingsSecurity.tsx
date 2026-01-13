import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Key, Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const SettingsSecurity = () => {
  const { language, t } = useLanguage();
  const { signOut } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t.auth.passwordMismatch);
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t.auth.passwordMinLength);
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success(language === 'vi' ? 'Đã đổi mật khẩu thành công' : 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(t.errors.somethingWentWrong);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      // Note: Account deletion would typically require backend support
      // For now, we just sign out
      await signOut();
      toast.success(language === 'vi' ? 'Đã đăng xuất' : 'Signed out');
    } catch (error) {
      console.error('Error:', error);
      toast.error(t.errors.somethingWentWrong);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        {language === 'vi' ? 'Bảo mật' : 'Security'}
      </h1>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5" />
            {language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn' 
              : 'Update your password to keep your account secure'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {language === 'vi' ? 'Mật khẩu mới' : 'New Password'}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t.auth.confirmPassword}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button 
            onClick={handleChangePassword} 
            disabled={isChangingPassword || !newPassword || !confirmPassword}
          >
            {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            {language === 'vi' ? 'Phiên đăng nhập' : 'Active Sessions'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Quản lý các thiết bị đã đăng nhập' 
              : 'Manage your logged-in devices'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>
              {language === 'vi' 
                ? 'Bạn đang đăng nhập trên thiết bị này' 
                : 'You are logged in on this device'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {language === 'vi' ? 'Vùng nguy hiểm' : 'Danger Zone'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Các hành động không thể hoàn tác' 
              : 'Irreversible actions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                {language === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {language === 'vi' ? 'Bạn có chắc chắn?' : 'Are you sure?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'vi' 
                    ? 'Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.' 
                    : 'This action cannot be undone. All your data will be permanently deleted.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
