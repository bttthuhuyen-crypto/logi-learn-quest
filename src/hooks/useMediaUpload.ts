import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'gif' | 'link';
  url: string;
  file?: File;
  thumbnailUrl?: string;
  isUploading?: boolean;
  isExisting?: boolean;
}

export const useMediaUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadMediaFiles = async (
    files: File[],
    userId: string
  ): Promise<{ url: string; type: 'image' | 'video' | 'gif' }[]> => {
    setIsUploading(true);
    const results: { url: string; type: 'image' | 'video' | 'gif' }[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('post-media')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(fileName);

        // Determine media type
        let type: 'image' | 'video' | 'gif' = 'image';
        if (file.type.startsWith('video/')) {
          type = 'video';
        } else if (fileExt === 'gif') {
          type = 'gif';
        }

        results.push({ url: publicUrl, type });
      }
    } catch (error: any) {
      toast.error(`Lỗi upload: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }

    return results;
  };

  const deleteMediaFile = async (url: string) => {
    try {
      // Extract file path from URL
      const urlParts = url.split('/post-media/');
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];
      await supabase.storage.from('post-media').remove([filePath]);
    } catch (error) {
      console.error('Error deleting media file:', error);
    }
  };

  return {
    uploadMediaFiles,
    deleteMediaFile,
    isUploading,
  };
};

// Video URL parsing utilities
export const parseVideoUrl = (url: string): { type: 'youtube' | 'vimeo' | 'loom' | null; id: string | null; thumbnailUrl: string | null } => {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return {
      type: 'youtube',
      id: youtubeMatch[1],
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      id: vimeoMatch[1],
      thumbnailUrl: null, // Vimeo requires API call for thumbnail
    };
  }

  // Loom
  const loomMatch = url.match(/(?:loom\.com\/share\/)([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return {
      type: 'loom',
      id: loomMatch[1],
      thumbnailUrl: `https://cdn.loom.com/sessions/thumbnails/${loomMatch[1]}-with-play.gif`,
    };
  }

  return { type: null, id: null, thumbnailUrl: null };
};

export const isValidVideoUrl = (url: string): boolean => {
  const { type } = parseVideoUrl(url);
  return type !== null;
};
