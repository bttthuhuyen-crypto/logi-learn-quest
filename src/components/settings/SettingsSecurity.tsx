import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTwoFactor } from '@/hooks/useTwoFactor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Mail, 
  Key, 
  Shield, 
  Monitor, 
  AlertTriangle, 
  Loader2,
  CheckCircle2,
  XCircle,
  Smartphone,
  Laptop,
  Globe,
} from 'lucide-react';
import { ChangeEmailModal } from './security/ChangeEmailModal';
import { ChangePasswordModal } from './security/ChangePasswordModal';
import { TwoFactorSetupModal } from './security/TwoFactorSetupModal';
import { DeleteAccountModal } from './security/DeleteAccountModal';

// Mask email: n***a@email.com
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

// Parse user agent to get browser and OS
function parseUserAgent(ua: string): { browser: string; os: string; icon: typeof Laptop } {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let icon = Globe;

  // Detect browser
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Set icon
  if (os === 'Android' || os === 'iOS') icon = Smartphone;
  else icon = Laptop;

  return { browser, os, icon };
}

export const SettingsSecurity = () => {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  const { isEnabled: is2FAEnabled, checkMFAStatus, disable2FA } = useTwoFactor();

  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus]);

  const t = {
    title: language === 'vi' ? 'Bảo mật' : 'Security',
    // Email section
    emailTitle: language === 'vi' ? 'Email' : 'Email',
    emailDesc: language === 'vi' ? 'Email đăng nhập của bạn' : 'Your login email',
    changeEmail: language === 'vi' ? 'Thay đổi email' : 'Change Email',
    // Password section
    passwordTitle: language === 'vi' ? 'Mật khẩu' : 'Password',
    passwordDesc: language === 'vi' ? 'Bảo vệ tài khoản của bạn' : 'Protect your account',
    changePassword: language === 'vi' ? 'Đổi mật khẩu' : 'Change Password',
    lastUpdated: language === 'vi' ? 'Cập nhật lần cuối' : 'Last updated',
    daysAgo: language === 'vi' ? 'ngày trước' : 'days ago',
    // 2FA section
    twoFactorTitle: language === 'vi' ? 'Xác thực 2 bước' : 'Two-Factor Authentication',
    twoFactorDesc: language === 'vi' 
      ? 'Thêm lớp bảo mật với ứng dụng Authenticator' 
      : 'Add extra security with Authenticator app',
    enabled: language === 'vi' ? 'Đã kích hoạt' : 'Enabled',
    notEnabled: language === 'vi' ? 'Chưa kích hoạt' : 'Not enabled',
    enable2FA: language === 'vi' ? 'Kích hoạt 2FA' : 'Enable 2FA',
    disable2FA: language === 'vi' ? 'Tắt 2FA' : 'Disable 2FA',
    // Sessions section
    sessionsTitle: language === 'vi' ? 'Phiên đăng nhập' : 'Active Sessions',
    sessionsDesc: language === 'vi' ? 'Quản lý các thiết bị đã đăng nhập' : 'Manage logged-in devices',
    currentSession: language === 'vi' ? 'Hiện tại' : 'Current',
    activeNow: language === 'vi' ? 'Hoạt động bây giờ' : 'Active now',
    signOutAll: language === 'vi' ? 'Đăng xuất tất cả thiết bị khác' : 'Sign out all other devices',
    // Danger zone
    dangerZone: language === 'vi' ? 'Vùng nguy hiểm' : 'Danger Zone',
    dangerDesc: language === 'vi' ? 'Các hành động không thể hoàn tác' : 'Irreversible actions',
    deleteAccount: language === 'vi' ? 'Xóa tài khoản' : 'Delete Account',
    deleteWarning: language === 'vi' 
      ? 'Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn.' 
      : 'Deleting your account will permanently remove all your data.',
    // Messages
    signOutAllSuccess: language === 'vi' 
      ? 'Đã đăng xuất khỏi tất cả thiết bị khác' 
      : 'Signed out of all other devices',
    disable2FASuccess: language === 'vi' ? 'Đã tắt xác thực 2 bước' : '2FA disabled successfully',
    error: language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred',
  };

  const handleSignOutAllDevices = async () => {
    setIsSigningOutAll(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success(t.signOutAllSuccess);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(t.error);
    } finally {
      setIsSigningOutAll(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsDisabling2FA(true);
    try {
      await disable2FA();
      toast.success(t.disable2FASuccess);
      checkMFAStatus();
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error(t.error);
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const handleDeleteSuccess = async () => {
    await signOut();
  };

  const userEmail = user?.email || '';
  const maskedEmail = userEmail ? maskEmail(userEmail) : '';
  const { browser, os, icon: DeviceIcon } = parseUserAgent(navigator.userAgent);

  return (
    <div className="max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      {/* Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            {t.emailTitle}
          </CardTitle>
          <CardDescription>{t.emailDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm">{maskedEmail}</p>
            </div>
            <Button variant="outline" onClick={() => setChangeEmailOpen(true)}>
              {t.changeEmail}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5" />
            {t.passwordTitle}
          </CardTitle>
          <CardDescription>{t.passwordDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm">••••••••</p>
            </div>
            <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
              {t.changePassword}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            {t.twoFactorTitle}
          </CardTitle>
          <CardDescription>{t.twoFactorDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {is2FAEnabled ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">{t.enabled}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t.notEnabled}</span>
                </>
              )}
            </div>
            {is2FAEnabled ? (
              <Button 
                variant="outline" 
                onClick={handleDisable2FA}
                disabled={isDisabling2FA}
              >
                {isDisabling2FA && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.disable2FA}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setTwoFactorSetupOpen(true)}>
                {t.enable2FA}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sessions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="h-5 w-5" />
            {t.sessionsTitle}
          </CardTitle>
          <CardDescription>{t.sessionsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Session */}
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
            <DeviceIcon className="h-10 w-10 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{browser} • {os}</span>
                <Badge variant="secondary" className="text-xs">{t.currentSession}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.activeNow}</p>
            </div>
          </div>

          <Separator />

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleSignOutAllDevices}
            disabled={isSigningOutAll}
          >
            {isSigningOutAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.signOutAll}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t.dangerZone}
          </CardTitle>
          <CardDescription>{t.dangerDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t.deleteWarning}</p>
          <Button variant="destructive" onClick={() => setDeleteAccountOpen(true)}>
            {t.deleteAccount}
          </Button>
        </CardContent>
      </Card>

      {/* Modals */}
      <ChangeEmailModal
        isOpen={changeEmailOpen}
        onClose={() => setChangeEmailOpen(false)}
        currentEmail={userEmail}
        language={language}
      />
      
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        currentEmail={userEmail}
        language={language}
      />

      <TwoFactorSetupModal
        isOpen={twoFactorSetupOpen}
        onClose={() => setTwoFactorSetupOpen(false)}
        onSuccess={checkMFAStatus}
        language={language}
      />

      <DeleteAccountModal
        isOpen={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        currentEmail={userEmail}
        language={language}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
};
