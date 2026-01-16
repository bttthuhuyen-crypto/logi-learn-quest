import { useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  type: 'logo' | 'cover';
  value?: string;
  onChange: (file: File | null) => void;
  className?: string;
}

export function ImageUploader({ type, value, onChange, className }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  if (type === 'logo') {
    return (
      <div className={cn('relative', className)}>
        <div
          onClick={handleClick}
          className={cn(
            'w-24 h-24 rounded-xl border-2 border-dashed border-border cursor-pointer',
            'flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors',
            'overflow-hidden group',
            preview && 'border-solid border-primary/20'
          )}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Logo preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Camera className="w-6 h-6" />
              <span className="text-xs">Icon</span>
            </div>
          )}
        </div>
        {preview && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // Cover image
  return (
    <div className={cn('relative', className)}>
      <div
        onClick={handleClick}
        className={cn(
          'w-full aspect-[16/9] rounded-xl border-2 border-dashed border-border cursor-pointer',
          'flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors',
          'overflow-hidden group',
          preview && 'border-solid border-primary/20'
        )}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-10 h-10" />
            <span className="text-sm">Tải lên ảnh bìa (16:9)</span>
          </div>
        )}
      </div>
      {preview && (
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
