import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Smartphone, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { settings, isLoading, updateSetting, isUpdating } = useNotificationSettings();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  const SettingRow = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t.notificationSettings.title}</h1>
          </div>
        </div>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              {t.notificationSettings.emailSection}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow label={t.notificationSettings.emailDigest}>
              <Select
                value={settings?.email_digest || 'off'}
                onValueChange={(value) => updateSetting('email_digest', value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">{t.notificationSettings.off}</SelectItem>
                  <SelectItem value="daily">{t.notificationSettings.daily}</SelectItem>
                  <SelectItem value="weekly">{t.notificationSettings.weekly}</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label={t.notificationSettings.emailNotifications}>
              <Select
                value={settings?.email_notifications || 'off'}
                onValueChange={(value) => updateSetting('email_notifications', value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">{t.notificationSettings.off}</SelectItem>
                  <SelectItem value="instant">{t.notificationSettings.instant}</SelectItem>
                  <SelectItem value="daily">{t.notificationSettings.daily}</SelectItem>
                  <SelectItem value="weekly">{t.notificationSettings.weekly}</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label={t.notificationSettings.adminAnnouncements}>
              <Switch
                checked={settings?.email_admin_announcements ?? true}
                onCheckedChange={(checked) => updateSetting('email_admin_announcements', checked)}
                disabled={isUpdating}
              />
            </SettingRow>

            <SettingRow label={t.notificationSettings.eventReminders}>
              <Switch
                checked={settings?.email_event_reminders ?? true}
                onCheckedChange={(checked) => updateSetting('email_event_reminders', checked)}
                disabled={isUpdating}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              {t.notificationSettings.inAppSection}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow label={t.notificationSettings.likes}>
              <Switch
                checked={settings?.notify_likes ?? true}
                onCheckedChange={(checked) => updateSetting('notify_likes', checked)}
                disabled={isUpdating}
              />
            </SettingRow>

            <SettingRow label={t.notificationSettings.comments}>
              <Switch
                checked={settings?.notify_comments ?? true}
                onCheckedChange={(checked) => updateSetting('notify_comments', checked)}
                disabled={isUpdating}
              />
            </SettingRow>

            <SettingRow label={t.notificationSettings.mentions}>
              <Switch
                checked={settings?.notify_mentions ?? true}
                onCheckedChange={(checked) => updateSetting('notify_mentions', checked)}
                disabled={isUpdating}
              />
            </SettingRow>

            <SettingRow label={t.notificationSettings.followers}>
              <Switch
                checked={settings?.notify_followers ?? true}
                onCheckedChange={(checked) => updateSetting('notify_followers', checked)}
                disabled={isUpdating}
              />
            </SettingRow>

            <SettingRow label={t.notificationSettings.followingPosts}>
              <Switch
                checked={settings?.notify_following_posts ?? true}
                onCheckedChange={(checked) => updateSetting('notify_following_posts', checked)}
                disabled={isUpdating}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5" />
              {t.notificationSettings.pushSection}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SettingRow label={t.notificationSettings.pushEnabled}>
              <Switch
                checked={settings?.push_enabled ?? false}
                onCheckedChange={(checked) => updateSetting('push_enabled', checked)}
                disabled={isUpdating}
              />
            </SettingRow>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
