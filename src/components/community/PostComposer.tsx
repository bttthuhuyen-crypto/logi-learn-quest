import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Image, Video, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PostComposerProps {
  onOpenModal: (type?: 'text' | 'poll') => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onOpenModal }) => {
  const { profile } = useAuth();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-muted text-muted-foreground">
            {profile?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <button
          onClick={() => onOpenModal('text')}
          className="flex-1 text-left px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors"
        >
          Bạn đang nghĩ gì?
        </button>
      </div>
      
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => onOpenModal('text')}
        >
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">Hình ảnh</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => onOpenModal('text')}
        >
          <Video className="h-4 w-4" />
          <span className="hidden sm:inline">Video</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => onOpenModal('poll')}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Thăm dò</span>
        </Button>
      </div>
    </div>
  );
};
