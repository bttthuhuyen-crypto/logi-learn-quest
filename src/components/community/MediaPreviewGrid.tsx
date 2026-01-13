import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, Sparkles, Link as LinkIcon, Loader2 } from 'lucide-react';
import { MediaItem } from '@/hooks/useMediaUpload';

interface MediaPreviewGridProps {
  items: MediaItem[];
  onRemove: (id: string) => void;
}

export const MediaPreviewGrid: React.FC<MediaPreviewGridProps> = ({
  items,
  onRemove,
}) => {
  if (items.length === 0) return null;

  const getGridColumns = () => {
    if (items.length === 1) return 'grid-cols-1';
    if (items.length === 2) return 'grid-cols-2';
    return 'grid-cols-2 sm:grid-cols-3';
  };

  return (
    <div className={`grid ${getGridColumns()} gap-2`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="relative group aspect-video rounded-lg overflow-hidden bg-muted border border-border"
        >
          {/* Image */}
          {item.type === 'image' && (
            <img
              src={item.url}
              alt="Media preview"
              className="w-full h-full object-cover"
            />
          )}

          {/* Video */}
          {item.type === 'video' && (
            <div className="relative w-full h-full">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-foreground ml-1" />
                </div>
              </div>
            </div>
          )}

          {/* GIF */}
          {item.type === 'gif' && (
            <div className="relative w-full h-full">
              <img
                src={item.url}
                alt="GIF preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                GIF
              </span>
            </div>
          )}

          {/* Link */}
          {item.type === 'link' && (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Loading overlay */}
          {item.isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Remove button */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
