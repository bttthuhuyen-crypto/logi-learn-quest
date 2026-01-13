import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/i18n/LanguageContext';
import { useMembership, MembershipQuestion } from '@/hooks/useMembership';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface MembershipQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const MembershipQuestionsModal: React.FC<MembershipQuestionsModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { language, t } = useLanguage();
  const { questions, submitRequest } = useMembership();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getQuestionText = (question: MembershipQuestion) => {
    if (language === 'en' && question.question_text_en) {
      return question.question_text_en;
    }
    return question.question_text;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isFormValid = () => {
    const allAnswered = questions.every(q => {
      const answer = answers[q.id];
      if (q.is_required) {
        if (q.question_type === 'text') {
          return answer && answer.trim().length >= 20;
        }
        return answer && answer.trim().length > 0;
      }
      return true;
    });
    return allAnswered && agreedToTerms;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setSubmitting(true);
    const answersList = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    const { error, autoApproved } = await submitRequest(answersList);

    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra. Vui lòng thử lại.' : 'An error occurred. Please try again.');
    } else {
      if (autoApproved) {
        toast.success(language === 'vi' ? 'Chào mừng bạn đến với cộng đồng!' : 'Welcome to the community!');
      } else {
        toast.success(language === 'vi' ? 'Yêu cầu đã được gửi. Vui lòng chờ Admin duyệt.' : 'Request submitted. Please wait for Admin approval.');
      }
      onOpenChange(false);
      onSuccess?.();
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            🚀 {language === 'vi' ? 'Tham gia 10X Logistics' : 'Join 10X Logistics Community'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {language === 'vi' 
              ? 'Vui lòng trả lời các câu hỏi dưới đây để Admin xem xét yêu cầu tham gia của bạn.'
              : 'Please answer the following questions for Admin review.'}
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <Label className="text-sm font-medium">
                {language === 'vi' ? `Câu hỏi ${index + 1}/${questions.length}` : `Question ${index + 1}/${questions.length}`}
              </Label>
              <p className="text-sm font-medium">{getQuestionText(question)} *</p>

              {question.question_type === 'multiple_choice' && (
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-2"
                >
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                      <Label htmlFor={`${question.id}-${optIndex}`} className="text-sm font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.question_type === 'text' && (
                <div className="space-y-1">
                  <Textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={language === 'vi' ? 'Nhập câu trả lời của bạn...' : 'Enter your answer...'}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 {language === 'vi' 
                      ? 'Gợi ý: Chia sẻ về mục tiêu nghề nghiệp, kỹ năng muốn học, hoặc thử thách bạn đang gặp phải (tối thiểu 20 ký tự)'
                      : 'Tip: Share your career goals, skills you want to learn, or challenges you face (minimum 20 characters)'}
                  </p>
                </div>
              )}

              {question.question_type === 'email' && (
                <Input
                  type="email"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="email@example.com"
                />
              )}
            </div>
          ))}

          <div className="flex items-start space-x-2 pt-4 border-t">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
              {language === 'vi'
                ? 'Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật'
                : 'I agree to the Terms of Service and Privacy Policy'}
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid() || submitting}
              className="bg-primary hover:bg-primary/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {language === 'vi' ? 'Gửi yêu cầu' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
