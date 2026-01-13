import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/i18n/LanguageContext';
import { MembershipQuestion } from '@/hooks/useMembership';
import { Plus, X } from 'lucide-react';

interface EditQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: MembershipQuestion | null;
  onSave: (question: Omit<MembershipQuestion, 'id'> | MembershipQuestion) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  open,
  onOpenChange,
  question,
  onSave
}) => {
  const { language } = useLanguage();
  const [questionText, setQuestionText] = useState('');
  const [questionTextEn, setQuestionTextEn] = useState('');
  const [questionType, setQuestionType] = useState<'text' | 'multiple_choice' | 'email'>('text');
  const [options, setOptions] = useState<string[]>(['']);
  const [isRequired, setIsRequired] = useState(true);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setQuestionTextEn(question.question_text_en || '');
      setQuestionType(question.question_type);
      setOptions(question.options.length > 0 ? question.options : ['']);
      setIsRequired(question.is_required);
    } else {
      setQuestionText('');
      setQuestionTextEn('');
      setQuestionType('text');
      setOptions(['']);
      setIsRequired(true);
    }
  }, [question, open]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    const questionData = {
      question_text: questionText,
      question_text_en: questionTextEn || null,
      question_type: questionType,
      options: questionType === 'multiple_choice' ? options.filter(o => o.trim()) : [],
      is_required: isRequired,
      order_index: question?.order_index || 0
    };

    if (question) {
      onSave({ ...questionData, id: question.id });
    } else {
      onSave(questionData);
    }
  };

  const isValid = () => {
    if (!questionText.trim()) return false;
    if (questionType === 'multiple_choice') {
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length < 2) return false;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question
              ? (language === 'vi' ? 'Chỉnh sửa câu hỏi' : 'Edit Question')
              : (language === 'vi' ? 'Thêm câu hỏi mới' : 'Add New Question')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Question text (Vietnamese) */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Câu hỏi (Tiếng Việt)' : 'Question (Vietnamese)'} *</Label>
            <Input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={language === 'vi' ? 'Nhập câu hỏi...' : 'Enter question...'}
            />
          </div>

          {/* Question text (English) */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Câu hỏi (Tiếng Anh)' : 'Question (English)'}</Label>
            <Input
              value={questionTextEn}
              onChange={(e) => setQuestionTextEn(e.target.value)}
              placeholder={language === 'vi' ? 'Nhập bản dịch tiếng Anh...' : 'Enter English translation...'}
            />
          </div>

          {/* Question type */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Loại câu hỏi' : 'Question Type'}</Label>
            <RadioGroup
              value={questionType}
              onValueChange={(value) => setQuestionType(value as 'text' | 'multiple_choice' | 'email')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="type-text" />
                <Label htmlFor="type-text" className="font-normal cursor-pointer">
                  {language === 'vi' ? 'Văn bản' : 'Text'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple_choice" id="type-mc" />
                <Label htmlFor="type-mc" className="font-normal cursor-pointer">
                  {language === 'vi' ? 'Trắc nghiệm' : 'Multiple Choice'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="type-email" />
                <Label htmlFor="type-email" className="font-normal cursor-pointer">
                  Email
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Options for multiple choice */}
          {questionType === 'multiple_choice' && (
            <div className="space-y-3">
              <Label>{language === 'vi' ? 'Các lựa chọn' : 'Options'}</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`${language === 'vi' ? 'Lựa chọn' : 'Option'} ${index + 1}`}
                  />
                  {options.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                {language === 'vi' ? 'Thêm lựa chọn' : 'Add Option'}
              </Button>
            </div>
          )}

          {/* Required checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked === true)}
            />
            <Label htmlFor="required" className="font-normal cursor-pointer">
              {language === 'vi' ? 'Bắt buộc trả lời' : 'Required'}
            </Label>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} disabled={!isValid()}>
              {language === 'vi' ? 'Lưu' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
