import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useLanguage } from '@/i18n/LanguageContext';
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
    case 'new_membership_request':
      return '📥';
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

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  language: 'vi' | 'en';
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete, language }: NotificationItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: language === 'vi' ? vi : enUS,
  });

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border last:border-0',
        !notification.is_read && 'bg-primary/5'
      )}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      {/* Icon or Avatar */}
      <div className="flex-shrink-0">
        {notification.actor ? (
          <Avatar className="h-9 w-9">
            <AvatarImage src={notification.actor.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {notification.actor.full_name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-lg">
            {getNotificationIcon(notification.type)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !notification.is_read && 'font-medium')}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
      </div>

      {/* Unread indicator & actions */}
      <div className="flex items-center gap-1">
        {!notification.is_read && (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px] font-medium bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h4 className="font-semibold text-sm">
            {language === 'vi' ? 'Thông báo' : 'Notifications'}
          </h4>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setOpen(false);
                navigate('/settings/notifications');
              }}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {language === 'vi' ? 'Đọc tất cả' : 'Read all'}
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {language === 'vi' ? 'Đang tải...' : 'Loading...'}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Không có thông báo' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="group">
              {notifications.slice(0, 5).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  language={language}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer - View All */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
            >
              {language === 'vi' ? 'Xem tất cả thông báo' : 'View all notifications'}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
