import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Settings, ArrowLeft, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return '❤️';
    case 'comment':
      return '💬';
    case 'follow':
      return '👤';
    case 'mention':
      return '@';
    case 'message':
      return '✉️';
    case 'membership_approved':
      return '✅';
    case 'membership_declined':
      return '❌';
    case 'new_signup':
      return '🎉';
    case 'commission':
      return '💰';
    case 'payout':
      return '💳';
    case 'event_new':
      return '📅';
    case 'event_reminder_24h':
      return '⏰';
    case 'event_reminder_1h':
      return '⏰';
    case 'event_live':
      return '🔴';
    default:
      return '🔔';
  }
};

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  language: 'vi' | 'en';
}

const NotificationCard = ({ notification, onMarkAsRead, onDelete, language }: NotificationCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: language === 'vi' ? vi : enUS,
  });

  return (
    <Card
      className={cn(
        'transition-all cursor-pointer hover:shadow-md',
        !notification.is_read && 'border-primary/30 bg-primary/5'
      )}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon or Avatar */}
          <div className="flex-shrink-0">
            {notification.actor ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={notification.actor.avatar_url || undefined} />
                <AvatarFallback className="text-sm">
                  {notification.actor.full_name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl">
                {getNotificationIcon(notification.type)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={cn('text-sm font-medium', !notification.is_read && 'font-semibold')}>
                  {notification.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.is_read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary mr-1" />
                )}
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Notifications() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">
                {language === 'vi' ? 'Thông báo' : 'Notifications'}
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings/notifications')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
            <TabsList>
              <TabsTrigger value="all">
                {language === 'vi' ? 'Tất cả' : 'All'}
              </TabsTrigger>
              <TabsTrigger value="unread">
                {language === 'vi' ? 'Chưa đọc' : 'Unread'}
                {unreadCount > 0 && ` (${unreadCount})`}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-4 w-4" />
              {language === 'vi' ? 'Đọc tất cả' : 'Mark all read'}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {filter === 'unread'
                    ? (language === 'vi' ? 'Không có thông báo chưa đọc' : 'No unread notifications')
                    : (language === 'vi' ? 'Không có thông báo nào' : 'No notifications yet')
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                language={language}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
