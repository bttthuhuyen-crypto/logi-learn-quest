import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/i18n/LanguageContext';
import { Loader2 } from 'lucide-react';

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string) => Promise<void>;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const { language } = useLanguage();
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setSubmitting(true);
    await onSubmit(title);
    setTitle('');
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'vi' ? 'Thêm danh mục' : 'Add Section'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Tên danh mục' : 'Section Name'}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 150))}
              placeholder={language === 'vi' ? 'Nhập tên danh mục...' : 'Enter section name...'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/150</p>
          </div>

          <div className="flex justify-end gap-3">
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
