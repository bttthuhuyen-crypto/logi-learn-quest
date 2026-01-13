import React, { useState, useRef } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/i18n/LanguageContext';
import { uploadCourseAsset } from '@/hooks/useCourses';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (course: {
    title: string;
    description: string;
    is_paid: boolean;
    price: number;
    thumbnail_url: string | null;
  }) => Promise<void>;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `courses/thumbnails/${Date.now()}-${file.name}`;
    const { url, error } = await uploadCourseAsset(file, path);
    
    if (error) {
      toast.error(language === 'vi' ? 'Lỗi tải ảnh lên' : 'Error uploading image');
    } else {
      setThumbnailUrl(url);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error(language === 'vi' ? 'Vui lòng nhập tên khóa học' : 'Please enter course name');
      return;
    }

    setSubmitting(true);
    await onSubmit({
      title,
      description,
      is_paid: isPaid,
      price: isPaid ? parseFloat(price) || 0 : 0,
      thumbnail_url: thumbnailUrl
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setIsPaid(false);
    setPrice('');
    setThumbnailUrl(null);
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {language === 'vi' ? 'Tạo khóa học mới' : 'Create New Course'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Course Name */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Tên khóa học' : 'Course Name'} *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 150))}
              placeholder={language === 'vi' ? 'Nhập tên khóa học...' : 'Enter course name...'}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/150</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Mô tả khóa học' : 'Course Description'}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder={language === 'vi' ? 'Nhập mô tả...' : 'Enter description...'}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
          </div>

          {/* Course Type */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Loại khóa học' : 'Course Type'}</Label>
            <RadioGroup
              value={isPaid ? 'paid' : 'free'}
              onValueChange={(v) => setIsPaid(v === 'paid')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free" className="font-normal cursor-pointer">
                  {language === 'vi' ? 'Miễn phí' : 'Free'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid" className="font-normal cursor-pointer">
                  {language === 'vi' ? 'Trả phí' : 'Paid'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Price (if paid) */}
          {isPaid && (
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Giá (VNĐ)' : 'Price (VND)'}</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Ảnh bìa' : 'Cover Image'}</Label>
            <p className="text-xs text-muted-foreground">
              {language === 'vi' ? 'Khuyến nghị: 1600x800px' : 'Recommended: 1600x800px'}
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {thumbnailUrl ? (
              <div className="relative">
                <img
                  src={thumbnailUrl}
                  alt="Course thumbnail"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {language === 'vi' ? 'Thay đổi' : 'Change'}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-32"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    {language === 'vi' ? 'Tải ảnh bìa lên' : 'Upload Cover Image'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !title.trim()}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === 'vi' ? 'Lưu' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
