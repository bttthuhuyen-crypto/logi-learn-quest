import React, { useState, useEffect } from 'react';
import { MessageCircle, Lock, Send, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChatSettings } from '@/hooks/useChatSettings';
import { useLanguage } from '@/i18n/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export const ChatSettingsPanel: React.FC = () => {
  const { language } = useLanguage();
  const { 
    chatSettings, 
    autoDMSettings, 
    isLoading, 
    updateChatSettings, 
    updateAutoDMSettings 
  } = useChatSettings();

  // Chat unlock settings
  const [unlockEnabled, setUnlockEnabled] = useState(false);
  const [unlockLevel, setUnlockLevel] = useState(2);

  // Auto DM settings
  const [autoDMEnabled, setAutoDMEnabled] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [senderId, setSenderId] = useState<string | null>(null);

  // Fetch admin users to select as sender
  const { data: adminUsers = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get admin user_ids
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'owner']);

      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) return [];

      const userIds = roles.map(r => r.user_id);

      // Then fetch their profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      return profiles as Array<{
        user_id: string;
        full_name: string | null;
        avatar_url: string | null;
      }>;
    },
  });

  // Initialize state from fetched data
  useEffect(() => {
    if (chatSettings) {
      setUnlockEnabled(chatSettings.unlock_chat_enabled || false);
      setUnlockLevel(chatSettings.unlock_chat_level || 2);
    }
  }, [chatSettings]);

  useEffect(() => {
    if (autoDMSettings) {
      setAutoDMEnabled(autoDMSettings.is_enabled || false);
      setMessageTemplate(autoDMSettings.message_template || '');
      setSenderId(autoDMSettings.sender_id);
    }
  }, [autoDMSettings]);

  const handleSaveChatSettings = () => {
    updateChatSettings.mutate({
      unlock_chat_enabled: unlockEnabled,
      unlock_chat_level: unlockLevel,
    });
  };

  const handleSaveAutoDMSettings = () => {
    updateAutoDMSettings.mutate({
      is_enabled: autoDMEnabled,
      message_template: messageTemplate,
      sender_id: senderId,
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chat Unlock Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {language === 'vi' ? 'Cài đặt mở khóa Chat' : 'Chat Unlock Settings'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Yêu cầu người dùng đạt level tối thiểu để sử dụng chat' 
              : 'Require users to reach a minimum level to use chat'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="unlock-enabled">
                {language === 'vi' ? 'Bật mở khóa theo level' : 'Enable level-based unlock'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'vi' 
                  ? 'Khi bật, người dùng cần đạt level tối thiểu để nhắn tin' 
                  : 'When enabled, users need to reach minimum level to message'}
              </p>
            </div>
            <Switch
              id="unlock-enabled"
              checked={unlockEnabled}
              onCheckedChange={setUnlockEnabled}
            />
          </div>

          {unlockEnabled && (
            <div className="space-y-2">
              <Label htmlFor="unlock-level">
                {language === 'vi' ? 'Level tối thiểu' : 'Minimum Level'}
              </Label>
              <Input
                id="unlock-level"
                type="number"
                min={1}
                max={100}
                value={unlockLevel}
                onChange={(e) => setUnlockLevel(parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>
          )}

          <Button 
            onClick={handleSaveChatSettings}
            disabled={updateChatSettings.isPending}
          >
            {updateChatSettings.isPending 
              ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') 
              : (language === 'vi' ? 'Lưu cài đặt' : 'Save Settings')}
          </Button>
        </CardContent>
      </Card>

      {/* Auto DM Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {language === 'vi' ? 'Cài đặt Auto DM' : 'Auto DM Settings'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Tự động gửi tin nhắn chào mừng cho thành viên mới' 
              : 'Automatically send welcome message to new members'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-dm-enabled">
                {language === 'vi' ? 'Bật Auto DM' : 'Enable Auto DM'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'vi' 
                  ? 'Tự động gửi tin nhắn khi thành viên được duyệt' 
                  : 'Automatically send message when member is approved'}
              </p>
            </div>
            <Switch
              id="auto-dm-enabled"
              checked={autoDMEnabled}
              onCheckedChange={setAutoDMEnabled}
            />
          </div>

          {autoDMEnabled && (
            <>
              <Separator />

              <div className="space-y-2">
                <Label>
                  {language === 'vi' ? 'Người gửi' : 'Sender'}
                </Label>
                <Select value={senderId || ''} onValueChange={(v) => setSenderId(v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'vi' ? 'Chọn người gửi' : 'Select sender'} />
                  </SelectTrigger>
                  <SelectContent>
                    {adminUsers.map(admin => (
                      <SelectItem key={admin.user_id} value={admin.user_id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={admin.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {getInitials(admin.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {admin.full_name || 'Admin'}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' 
                    ? 'Tin nhắn sẽ được gửi từ tài khoản này' 
                    : 'Message will be sent from this account'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message-template">
                  {language === 'vi' ? 'Mẫu tin nhắn' : 'Message Template'}
                </Label>
                <Textarea
                  id="message-template"
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder={language === 'vi' 
                    ? 'Chào mừng #NAME# đến với cộng đồng! 🎉' 
                    : 'Welcome #NAME# to the community! 🎉'}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' 
                    ? 'Sử dụng #NAME# để chèn tên thành viên' 
                    : 'Use #NAME# to insert member name'}
                </p>
              </div>

              {/* Preview */}
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium mb-2">
                  {language === 'vi' ? 'Xem trước:' : 'Preview:'}
                </p>
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={adminUsers.find(a => a.user_id === senderId)?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(adminUsers.find(a => a.user_id === senderId)?.full_name || null)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-background rounded-2xl px-4 py-2 max-w-xs">
                    <p className="text-sm">
                      {messageTemplate.replace('#NAME#', 'Nguyễn Văn A') || 
                        (language === 'vi' 
                          ? 'Chào mừng Nguyễn Văn A đến với cộng đồng! 🎉' 
                          : 'Welcome John Doe to the community! 🎉')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button 
            onClick={handleSaveAutoDMSettings}
            disabled={updateAutoDMSettings.isPending}
          >
            {updateAutoDMSettings.isPending 
              ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') 
              : (language === 'vi' ? 'Lưu cài đặt' : 'Save Settings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
