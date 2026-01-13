import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Video, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCreatePost } from '@/hooks/usePosts';
import { toast } from 'sonner';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'text' | 'poll';
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onOpenChange,
  defaultType = 'text',
}) => {
  const { profile } = useAuth();
  const { data: categories } = useCategories();
  const createPost = useCreatePost();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    
    if (!categoryId) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim() || undefined,
        category_id: categoryId,
        content_type: defaultType,
      });
      
      toast.success('Đã đăng bài viết');
      setTitle('');
      setContent('');
      setCategoryId('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Không thể đăng bài viết');
    }
  };

  const handleClose = () => {
    if (title || content) {
      if (confirm('Bạn có chắc muốn hủy bài viết này?')) {
        setTitle('');
        setContent('');
        setCategoryId('');
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo bài viết mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Author info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-7 text-xs w-[180px]">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              placeholder="Tiêu đề bài viết..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung</Label>
            <Textarea
              id="content"
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Media buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Thêm:</span>
            <Button type="button" variant="ghost" size="sm" className="gap-2">
              <Image className="h-4 w-4" />
              Ảnh
            </Button>
            <Button type="button" variant="ghost" size="sm" className="gap-2">
              <Video className="h-4 w-4" />
              Video
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPost.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Đăng bài
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
