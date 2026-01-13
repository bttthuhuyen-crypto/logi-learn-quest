import React, { useMemo } from 'react';
import { Search, Plus, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/i18n/LanguageContext';
import { ConversationWithDetails } from '@/hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useChatUnlock } from '@/hooks/useChatUnlock';
import { useUsersPresence } from '@/hooks/useUserPresence';
import { StatusIndicator } from '@/components/members/StatusIndicator';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  currentUserId: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  onNewConversation,
  currentUserId,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { canChat, requiredLevel } = useChatUnlock();

  // Get user IDs for presence tracking
  const userIds = useMemo(() => 
    conversations
      .map(c => c.otherParticipant?.user_id)
      .filter((id): id is string => !!id),
    [conversations]
  );
  const { getPresence } = useUsersPresence(userIds);

  const filteredConversations = conversations.filter(conv => 
    conv.otherParticipant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { 
      addSuffix: false,
      locale: language === 'vi' ? vi : enUS 
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getMessagePreview = (conv: ConversationWithDetails) => {
    if (!conv.lastMessage) return '';
    
    const isMe = conv.lastMessage.sender_id === currentUserId;
    const prefix = isMe ? `${t.messenger?.you || 'Bạn'}: ` : '';
    
    if (conv.lastMessage.message_type === 'image') {
      return `${prefix}📷 ${t.messenger?.attachImage || 'Ảnh'}`;
    }
    if (conv.lastMessage.message_type === 'file') {
      return `${prefix}📎 ${t.messenger?.attachFile || 'File'}`;
    }
    return `${prefix}${conv.lastMessage.content || ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full border-r border-border">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r border-border bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{t.messenger?.title || 'Tin nhắn'}</h2>
          {canChat ? (
            <Button variant="ghost" size="icon" onClick={onNewConversation}>
              <Plus className="h-5 w-5" />
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" disabled>
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {language === 'vi' 
                    ? `Cần đạt Level ${requiredLevel} để nhắn tin`
                    : `Reach Level ${requiredLevel} to send messages`
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.messenger?.searchPlaceholder || 'Tìm kiếm cuộc trò chuyện...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>{t.messenger?.noConversations || 'Chưa có cuộc trò chuyện nào'}</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  selectedId === conv.id 
                    ? 'bg-primary/10' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.otherParticipant?.avatar_url || ''} />
                    <AvatarFallback>
                      {getInitials(conv.otherParticipant?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.otherParticipant?.user_id && (
                    <StatusIndicator 
                      status={getPresence(conv.otherParticipant.user_id).status}
                      size="md"
                      className="absolute bottom-0 right-0"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-foreground' : ''}`}>
                      {conv.otherParticipant?.full_name || 'Người dùng'}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className={`text-sm truncate ${
                      conv.unreadCount > 0 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    }`}>
                      {getMessagePreview(conv)}
                    </span>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2 h-5 min-w-[20px] px-1.5">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
