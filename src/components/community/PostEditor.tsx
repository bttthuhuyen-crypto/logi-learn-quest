import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Video, Sparkles, BarChart3, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { PostRichTextEditor } from './PostRichTextEditor';
import { VideoUrlModal } from './VideoUrlModal';
import { GifPicker } from './GifPicker';
import { PollBuilder, PollData, calculateEndsAt } from './PollBuilder';
import { MediaPreviewGrid } from './MediaPreviewGrid';
import { useMediaUpload, MediaItem } from '@/hooks/useMediaUpload';

const postEditorSchema = z.object({
  title: z.string()
    .min(1, 'Vui lòng nhập tiêu đề')
    .max(200, 'Tiêu đề tối đa 200 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  isActionPost: z.boolean().default(false),
});

type PostEditorFormData = z.infer<typeof postEditorSchema>;

interface PostEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'text' | 'poll';
}

export const PostEditor: React.FC<PostEditorProps> = ({
  open,
  onOpenChange,
  defaultType = 'text',
}) => {
  const { user, profile } = useAuth();
  const { data: categories } = useCategories();
  const { isAdmin } = useUserRole();
  const { uploadMediaFiles, isUploading } = useMediaUpload();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [pollData, setPollData] = useState<PollData | null>(
    defaultType === 'poll' 
      ? { question: '', options: ['', ''], isMultipleChoice: false, endsAt: null, duration: 'none' }
      : null
  );
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PostEditorFormData>({
    resolver: zodResolver(postEditorSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      isActionPost: false,
    },
  });

  const titleValue = form.watch('title');

  // Filter categories based on user permission
  const availableCategories = categories?.filter((cat) => {
    if (cat.post_permission === 'all') return true;
    if (cat.post_permission === 'admin_only' && isAdmin) return true;
    return false;
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là ảnh`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} vượt quá 10MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;
    if (mediaItems.length + validFiles.length > 10) {
      toast.error('Tối đa 10 media');
      return;
    }

    // Add local preview immediately
    const newItems: MediaItem[] = validFiles.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      type: 'image' as const,
      url: URL.createObjectURL(file),
      file,
      isUploading: false,
    }));

    setMediaItems((prev) => [...prev, ...newItems]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddVideo = (url: string, thumbnailUrl: string | null) => {
    if (mediaItems.length >= 10) {
      toast.error('Tối đa 10 media');
      return;
    }

    const newItem: MediaItem = {
      id: `video-${Date.now()}`,
      type: 'video',
      url,
      thumbnailUrl: thumbnailUrl || undefined,
    };

    setMediaItems((prev) => [...prev, newItem]);
  };

  const handleAddGif = (url: string) => {
    if (mediaItems.length >= 10) {
      toast.error('Tối đa 10 media');
      return;
    }

    const newItem: MediaItem = {
      id: `gif-${Date.now()}`,
      type: 'gif',
      url,
    };

    setMediaItems((prev) => [...prev, newItem]);
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleTogglePoll = () => {
    if (pollData) {
      setPollData(null);
    } else {
      setPollData({ question: '', options: ['', ''], isMultipleChoice: false, endsAt: null, duration: 'none' });
      // Clear media when adding poll
      setMediaItems([]);
    }
  };

  const handleClose = () => {
    if (titleValue || content || mediaItems.length > 0 || pollData?.question) {
      if (confirm('Bạn có chắc muốn hủy bài viết này?')) {
        resetForm();
        onOpenChange(false);
      }
    } else {
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setContent('');
    setMediaItems([]);
    setPollData(null);
  };

  const onSubmit = async (data: PostEditorFormData) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    // Validate poll if present
    if (pollData) {
      if (!pollData.question.trim()) {
        toast.error('Vui lòng nhập câu hỏi thăm dò');
        return;
      }
      const validOptions = pollData.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        toast.error('Cần ít nhất 2 lựa chọn');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: data.title.trim(),
          content: content.trim() || null,
          category_id: data.categoryId,
          content_type: pollData ? 'poll' : 'text',
          is_action_post: data.isActionPost,
          author_id: user.id,
        })
        .select()
        .single();

      if (postError) throw postError;

      // 2. Upload and save media
      if (mediaItems.length > 0) {
        // Upload files to storage
        const filesToUpload = mediaItems.filter((item) => item.file);
        const uploadedUrls: { url: string; type: 'image' | 'video' | 'gif' }[] = [];

        if (filesToUpload.length > 0) {
          const uploaded = await uploadMediaFiles(
            filesToUpload.map((item) => item.file!),
            user.id
          );
          uploadedUrls.push(...uploaded);
        }

        // Prepare media records
        const mediaRecords = mediaItems.map((item, index) => {
          const uploadedItem = item.file
            ? uploadedUrls.shift()
            : { url: item.url, type: item.type };

          return {
            post_id: post.id,
            media_type: uploadedItem?.type || item.type,
            media_url: uploadedItem?.url || item.url,
            thumbnail_url: item.thumbnailUrl || null,
            order_index: index,
          };
        });

        const { error: mediaError } = await supabase
          .from('post_media')
          .insert(mediaRecords);

        if (mediaError) throw mediaError;
      }

      // 3. Create poll if present
      if (pollData) {
        const validOptions = pollData.options.filter((opt) => opt.trim());

        // Calculate endsAt from duration
        const endsAt = calculateEndsAt(pollData.duration);
        
        const { data: poll, error: pollError } = await supabase
          .from('polls')
          .insert({
            post_id: post.id,
            question: pollData.question.trim(),
            is_multiple_choice: pollData.isMultipleChoice,
            ends_at: endsAt,
          })
          .select()
          .single();

        if (pollError) throw pollError;

        const optionRecords = validOptions.map((opt, index) => ({
          poll_id: poll.id,
          option_text: opt.trim(),
          order_index: index,
        }));

        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(optionRecords);

        if (optionsError) throw optionsError;
      }

      toast.success('Đã đăng bài viết');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Không thể đăng bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo bài viết mới</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Author info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-7 text-xs w-[180px]">
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableCategories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.emoji} {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title">Tiêu đề</Label>
                      <span className="text-xs text-muted-foreground">
                        {field.value.length}/200
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        id="title"
                        placeholder="Tiêu đề bài viết"
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rich Text Editor */}
              {!pollData && (
                <div className="space-y-2">
                  <Label>Nội dung</Label>
                  <PostRichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Chia sẻ suy nghĩ của bạn..."
                  />
                </div>
              )}

              {/* Media Preview */}
              {mediaItems.length > 0 && !pollData && (
                <MediaPreviewGrid items={mediaItems} onRemove={handleRemoveMedia} />
              )}

              {/* Poll Builder */}
              {pollData && (
                <PollBuilder
                  value={pollData}
                  onChange={setPollData}
                  onRemove={() => setPollData(null)}
                />
              )}

              {/* Media buttons */}
              {!pollData && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Thêm:</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Image className="h-4 w-4" />
                    Ảnh
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowVideoModal(true)}
                  >
                    <Video className="h-4 w-4" />
                    Video
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowGifPicker(true)}
                  >
                    <Sparkles className="h-4 w-4" />
                    GIF
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={handleTogglePoll}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Poll
                  </Button>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 pt-2 border-t border-border">
                <FormField
                  control={form.control}
                  name="isActionPost"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActionPost"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="isActionPost"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Đây là bài "Hành động" (yêu cầu comment)
                      </label>
                    </div>
                  )}
                />
              </div>

              {/* Footer */}
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {(isSubmitting || isUploading) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Đăng bài
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <VideoUrlModal
        open={showVideoModal}
        onOpenChange={setShowVideoModal}
        onAddVideo={handleAddVideo}
      />
      <GifPicker
        open={showGifPicker}
        onOpenChange={setShowGifPicker}
        onSelectGif={handleAddGif}
      />
    </>
  );
};
