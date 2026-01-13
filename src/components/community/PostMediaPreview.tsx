import React from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PostMedia } from '@/hooks/usePosts';

interface PostMediaPreviewProps {
  media: PostMedia[];
  onClick?: () => void;
}

export const PostMediaPreview: React.FC<PostMediaPreviewProps> = ({ media, onClick }) => {
  if (!media.length) return null;

  const images = media.filter(m => m.media_type === 'image' || m.media_type === 'gif');
  const videos = media.filter(m => m.media_type === 'video');
  const links = media.filter(m => m.media_type === 'link');

  // Render images grid
  if (images.length > 0) {
    const displayImages = images.slice(0, 2);
    const remainingCount = images.length - 2;

    return (
      <div
        className={cn(
          'grid gap-1 rounded-lg overflow-hidden cursor-pointer',
          images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        )}
        onClick={onClick}
      >
        {displayImages.map((img, index) => (
          <div key={img.id} className="relative aspect-video bg-muted">
            <img
              src={img.media_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {img.media_type === 'gif' && (
              <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-semibold bg-black/70 text-white rounded">
                GIF
              </span>
            )}
            {index === 1 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{remainingCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Render video thumbnail
  if (videos.length > 0) {
    const video = videos[0];
    return (
      <div
        className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center">
            <Play className="h-6 w-6 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
    );
  }

  // Render link preview
  if (links.length > 0) {
    const link = links[0];
    return (
      <a
        href={link.media_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {link.thumbnail_url && (
          <div className="aspect-[2/1] bg-muted">
            <img
              src={link.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(link.media_url).hostname}&sz=16`}
              alt=""
              className="w-4 h-4"
            />
            <span className="truncate">{new URL(link.media_url).hostname}</span>
          </div>
          <p className="text-sm font-medium line-clamp-2">{link.media_url}</p>
        </div>
      </a>
    );
  }

  return null;
};
