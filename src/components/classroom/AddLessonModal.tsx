import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/i18n/LanguageContext';
import { uploadCourseAsset, CourseLesson } from '@/hooks/useCourses';
import { Upload, Loader2, Globe, Users, Award } from 'lucide-react';
import { toast } from 'sonner';

interface AddLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (lesson: Partial<CourseLesson>) => Promise<void>;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [accessLevel, setAccessLevel] = useState<'public' | 'member' | 'level'>('member');
  const [requiredLevel, setRequiredLevel] = useState('3');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `lessons/thumbnails/${Date.now()}-${file.name}`;
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
      toast.error(language === 'vi' ? 'Vui lòng nhập tên bài học' : 'Please enter lesson name');
      return;
    }

    setSubmitting(true);
    await onSubmit({
      title,
      access_level: accessLevel,
      required_level: accessLevel === 'level' ? parseInt(requiredLevel) : 1,
      thumbnail_url: thumbnailUrl
    });

    // Reset form
    setTitle('');
    setAccessLevel('member');
    setRequiredLevel('3');
    setThumbnailUrl(null);
    setSubmitting(false);
    onOpenChange(false);
  };

  const accessLevelOptions = [
    {
      value: 'public' as const,
      icon: Globe,
      label: language === 'vi' ? 'Công khai' : 'Public',
      description: language === 'vi'
        ? 'Mọi người đều có thể truy cập nội dung này.'
        : 'Everyone can access this content.'
    },
    {
      value: 'member' as const,
      icon: Users,
      label: language === 'vi' ? 'Thành viên' : 'Member',
      description: language === 'vi'
        ? 'Người dùng cần tham gia cộng đồng để truy cập nội dung này.'
        : 'Users need to join the community to access this content.'
    },
    {
      value: 'level' as const,
      icon: Award,
      label: language === 'vi' ? 'Cấp bậc' : 'Level',
      description: language === 'vi'
        ? 'Người dùng cần đạt đến cấp bậc tối thiểu.'
        : 'Users need to reach minimum level.'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {language === 'vi' ? 'Thêm bài học' : 'Add Lesson'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Lesson Title */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Tên bài học' : 'Lesson Name'} *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 150))}
              placeholder={language === 'vi' ? 'Nhập tên bài học...' : 'Enter lesson name...'}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/150</p>
          </div>

          {/* Access Level */}
          <div className="space-y-3">
            <Label>{language === 'vi' ? 'Quyền truy cập' : 'Access Level'}</Label>
            <RadioGroup
              value={accessLevel}
              onValueChange={(v) => setAccessLevel(v as 'public' | 'member' | 'level')}
              className="space-y-3"
            >
              {accessLevelOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    accessLevel === option.value ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setAccessLevel(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <Label htmlFor={option.value} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Required Level (if level-based) */}
          {accessLevel === 'level' && (
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Cấp bậc tối thiểu' : 'Minimum Level'}</Label>
              <Input
                type="number"
                min="1"
                max="9"
                value={requiredLevel}
                onChange={(e) => setRequiredLevel(e.target.value)}
              />
            </div>
          )}

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Ảnh bìa' : 'Thumbnail'}</Label>
            <p className="text-xs text-muted-foreground">
              {language === 'vi' ? 'Khuyến nghị tỉ lệ: 16:9' : 'Recommended ratio: 16:9'}
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
                  alt="Lesson thumbnail"
                  className="w-full h-32 object-cover rounded-lg"
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
                className="w-full h-24"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    {language === 'vi' ? 'Upload ảnh bìa' : 'Upload Thumbnail'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
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
