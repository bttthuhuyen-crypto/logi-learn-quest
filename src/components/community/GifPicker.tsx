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
import { AlertCircle, Sparkles } from 'lucide-react';

interface GifPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGif: (url: string) => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({
  open,
  onOpenChange,
  onSelectGif,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const isValidGifUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!url.trim()) {
      setError('Vui lòng nhập URL GIF');
      return;
    }

    if (!isValidGifUrl(url)) {
      setError('URL không hợp lệ');
      return;
    }

    onSelectGif(url);
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
            <Sparkles className="h-5 w-5" />
            Thêm GIF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="gif-url">URL GIF</Label>
            <Input
              id="gif-url"
              placeholder="https://media.giphy.com/media/..."
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
            <p className="text-xs text-muted-foreground">
              Dán URL trực tiếp của GIF từ Giphy, Tenor hoặc các nguồn khác.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            Thêm GIF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
