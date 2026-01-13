import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Play, ExternalLink } from 'lucide-react';
import type { PostMedia } from '@/hooks/usePosts';
import { cn } from '@/lib/utils';

interface PostMediaGalleryProps {
  media: PostMedia[];
}

export const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({ media }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = media.filter((m) => m.media_type === 'image' || m.media_type === 'gif');
  const videos = media.filter((m) => m.media_type === 'video');
  const links = media.filter((m) => m.media_type === 'link');

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-4">
      {/* Images Grid */}
      {images.length > 0 && (
        <div className={cn(
          'grid gap-2',
          images.length === 1 && 'grid-cols-1',
          images.length === 2 && 'grid-cols-2',
          images.length >= 3 && 'grid-cols-2 md:grid-cols-3'
        )}>
          {images.map((img, index) => (
            <div
              key={img.id}
              className={cn(
                'relative overflow-hidden rounded-lg cursor-pointer group',
                images.length === 1 && 'max-h-[500px]',
                images.length > 1 && 'aspect-square'
              )}
              onClick={() => openLightbox(index)}
            >
              <img
                src={img.media_url}
                alt=""
                className={cn(
                  'w-full h-full object-cover transition-transform group-hover:scale-105',
                  images.length === 1 && 'object-contain bg-muted'
                )}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      )}

      {/* Videos */}
      {videos.map((video) => {
        const youtubeId = getYouTubeId(video.media_url);
        
        if (youtubeId) {
          return (
            <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }

        return (
          <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <video
              src={video.media_url}
              controls
              className="w-full h-full object-contain"
              poster={video.thumbnail_url || undefined}
            >
              <source src={video.media_url} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      })}

      {/* Links */}
      {links.map((link) => (
        <a
          key={link.id}
          href={link.media_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <img
              src={`https://www.google.com/s2/favicons?domain=${getHostname(link.media_url)}&sz=32`}
              alt=""
              className="w-5 h-5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:underline truncate">
              {getHostname(link.media_url)}
            </p>
            <p className="text-xs text-muted-foreground truncate">{link.media_url}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </a>
      ))}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Image */}
            {images[currentIndex] && (
              <img
                src={images[currentIndex].media_url}
                alt=""
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
