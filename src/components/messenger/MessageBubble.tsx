import React from 'react';
import { Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/i18n/LanguageContext';
import { Message } from '@/hooks/useMessages';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onDelete?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onDelete,
}) => {
  const { t, language } = useLanguage();

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm', {
      locale: language === 'vi' ? vi : enUS,
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Deleted message
  if (message.deleted_at) {
    return (
      <div className={`flex items-end gap-2 mb-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
        {!isOwn && showAvatar && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderProfile?.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {getInitials(message.senderProfile?.full_name)}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`max-w-[70%] px-4 py-2 rounded-2xl bg-muted text-muted-foreground italic`}>
          {t.messenger?.messageDeleted || 'Tin nhắn đã bị xóa'}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-2 group ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.senderProfile?.avatar_url || ''} />
          <AvatarFallback className="text-xs">
            {getInitials(message.senderProfile?.full_name)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Message content */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          }`}
        >
          {/* Text content */}
          {message.content && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Image attachment */}
          {message.message_type === 'image' && message.attachment_url && (
            <a 
              href={message.attachment_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mt-1"
            >
              <img
                src={message.attachment_url}
                alt={message.attachment_name || 'Image'}
                className="max-w-full rounded-lg max-h-60 object-cover"
              />
            </a>
          )}

          {/* File attachment */}
          {message.message_type === 'file' && message.attachment_url && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 mt-1 p-2 rounded-lg ${
                isOwn ? 'bg-primary-foreground/10' : 'bg-background'
              }`}
            >
              <Download className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{message.attachment_name || 'File'}</p>
                <p className="text-xs opacity-70">{formatFileSize(message.attachment_size)}</p>
              </div>
            </a>
          )}
        </div>

        {/* Time and actions */}
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
          {isOwn && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
