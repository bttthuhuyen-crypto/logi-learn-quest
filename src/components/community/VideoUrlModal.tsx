import React, { useState } from 'react';
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
import { isValidVideoUrl, parseVideoUrl } from '@/hooks/useMediaUpload';
import { Video, Youtube, AlertCircle } from 'lucide-react';

interface VideoUrlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddVideo: (url: string, thumbnailUrl: string | null) => void;
}

export const VideoUrlModal: React.FC<VideoUrlModalProps> = ({
  open,
  onOpenChange,
  onAddVideo,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) {
      setError('Vui lòng nhập URL video');
      return;
    }

    if (!isValidVideoUrl(url)) {
      setError('URL không hợp lệ. Hỗ trợ: YouTube, Vimeo, Loom');
      return;
    }

    const parsed = parseVideoUrl(url);
    onAddVideo(url, parsed.thumbnailUrl);
    setUrl('');
    setError('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setUrl('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Thêm video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">URL Video</Label>
            <Input
              id="video-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-2">Hỗ trợ các nền tảng:</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-background px-2 py-1 rounded">
                <Youtube className="h-3 w-3 text-red-500" />
                YouTube
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-background px-2 py-1 rounded">
                <Video className="h-3 w-3 text-blue-500" />
                Vimeo
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-background px-2 py-1 rounded">
                <Video className="h-3 w-3 text-purple-500" />
                Loom
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            Thêm video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
