import { useLanguage } from '@/i18n/LanguageContext';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { usePresence } from '@/contexts/PresenceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, BellOff, Save, Eye } from 'lucide-react';

export const SettingsNotifications = () => {
  const { t } = useLanguage();
  const { settings, isLoading, updateSetting, disableAllNotifications, isUpdating } = useNotificationSettings();
  const { showOnlineStatus, toggleVisibility, isUpdating: isUpdatingPresence } = usePresence();

  if (isLoading) {
    return (
      <div className="max-w-3xl p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
    <div className="max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">{t.notificationSettings.title}</h1>

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

          <SettingRow label={t.notificationSettings.newMessages}>
            <Switch
              checked={settings?.notify_messages ?? true}
              onCheckedChange={(checked) => updateSetting('notify_messages', checked)}
              disabled={isUpdating}
            />
          </SettingRow>

          <SettingRow label={t.notificationSettings.levelUp}>
            <Switch
              checked={settings?.notify_level_up ?? true}
              onCheckedChange={(checked) => updateSetting('notify_level_up', checked)}
              disabled={isUpdating}
            />
          </SettingRow>

          <SettingRow label={t.notificationSettings.affiliateCommission}>
            <Switch
              checked={settings?.notify_affiliate_commission ?? true}
              onCheckedChange={(checked) => updateSetting('notify_affiliate_commission', checked)}
              disabled={isUpdating}
            />
          </SettingRow>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5" />
            {t.settings?.privacy || 'Quyền riêng tư'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingRow label={t.settings?.showOnlineStatus || 'Hiển thị trạng thái online'}>
            <Switch
              checked={showOnlineStatus}
              onCheckedChange={toggleVisibility}
              disabled={isUpdatingPresence}
            />
          </SettingRow>
          <p className="text-xs text-muted-foreground mt-2">
            {t.settings?.showOnlineStatusHint || 'Khi tắt, người khác sẽ không thấy bạn đang online'}
          </p>
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex justify-between gap-4 pt-2">
        <Button
          variant="outline"
          onClick={disableAllNotifications}
          disabled={isUpdating}
          className="gap-2"
        >
          <BellOff className="h-4 w-4" />
          {t.notificationSettings.disableAll}
        </Button>
        <Button disabled={isUpdating} className="gap-2">
          <Save className="h-4 w-4" />
          {t.notificationSettings.saveChanges}
        </Button>
      </div>
    </div>
  );
};
