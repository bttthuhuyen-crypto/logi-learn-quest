import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, Loader2 } from 'lucide-react';
import { useSearchPosts } from '@/hooks/useSearchPosts';
import { useLanguage } from '@/i18n/LanguageContext';

interface PostSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPost: (postId: string, postTitle: string) => void;
}

export const PostSelectionModal: React.FC<PostSelectionModalProps> = ({
  open,
  onOpenChange,
  onSelectPost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: posts, isLoading } = useSearchPosts(searchQuery, 15);
  const { language } = useLanguage();

  const handleSelectPost = (postId: string, postTitle: string) => {
    onSelectPost(postId, postTitle);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {language === 'vi' ? 'Chọn bài viết' : 'Select Post'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'vi' ? 'Tìm kiếm bài viết...' : 'Search posts...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Posts List */}
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-2">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handleSelectPost(post.id, post.title)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={post.author?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {post.author?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground truncate">
                          {post.author?.full_name || 'Unknown'}
                        </span>
                        {post.category && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {post.category.emoji} {post.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? (language === 'vi' ? 'Không tìm thấy bài viết' : 'No posts found')
                    : (language === 'vi' ? 'Nhập từ khóa để tìm kiếm' : 'Enter keyword to search')}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
