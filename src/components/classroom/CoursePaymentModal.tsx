import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { usePaymentSettings } from '@/hooks/useCourseAccess';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Copy, CheckCircle, BookOpen } from 'lucide-react';
import { Course } from '@/hooks/useCourses';

interface CoursePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
}

const generateOrderCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}${random}`;
};

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const CoursePaymentModal: React.FC<CoursePaymentModalProps> = ({
  open,
  onOpenChange,
  course,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { settings: paymentSettings, isLoading: settingsLoading } = usePaymentSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCode, setOrderCode] = useState(() => generateOrderCode());
  const [copied, setCopied] = useState(false);

  const handleCopyOrderCode = async () => {
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopied(true);
      toast.success(language === 'vi' ? 'Đã sao chép mã đơn hàng' : 'Order code copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(language === 'vi' ? 'Không thể sao chép' : 'Failed to copy');
    }
  };

  const handleConfirmPayment = async () => {
    if (!user || !course) {
      toast.error(language === 'vi' ? 'Vui lòng đăng nhập để thanh toán' : 'Please login to pay');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        course_id: course.id,
        order_code: orderCode,
        amount: course.price || 0,
        payment_method: 'bank_transfer',
        status: 'pending',
      });

      if (error) {
        console.error('Error creating order:', error);
        toast.error(language === 'vi' ? 'Có lỗi xảy ra. Vui lòng thử lại.' : 'An error occurred. Please try again.');
      } else {
        toast.success(
          language === 'vi'
            ? 'Đơn hàng đã được ghi nhận. Admin sẽ xác nhận trong thời gian sớm nhất.'
            : 'Order recorded. Admin will confirm soon.',
          { duration: 5000 }
        );
        onOpenChange(false);
        setOrderCode(generateOrderCode());
      }
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error(language === 'vi' ? 'Có lỗi xảy ra. Vui lòng thử lại.' : 'An error occurred. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Course Thumbnail - Full width, 16:9 */}
        <div className="relative aspect-video w-full bg-muted">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="h-16 w-16 text-primary/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Course Title & Price - Centered */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-xl">{course.title}</h3>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(course.price)}
            </p>
          </div>

          {/* QR Code - Larger */}
          {settingsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : paymentSettings?.qr_image_url ? (
            <div className="flex justify-center">
              <img
                src={paymentSettings.qr_image_url}
                alt="Payment QR Code"
                className="w-56 h-56 object-contain rounded-lg shadow-sm"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <div className="w-56 h-56 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <span className="text-muted-foreground text-sm text-center px-4">
                  {language === 'vi' ? 'Chưa có mã QR' : 'No QR code available'}
                </span>
              </div>
            </div>
          )}

          {/* Bank Info - Improved styling */}
          {paymentSettings && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-xl text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {language === 'vi' ? 'Ngân hàng' : 'Bank'}
                </span>
                <span className="font-semibold">{paymentSettings.bank_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {language === 'vi' ? 'Chủ TK' : 'Account holder'}
                </span>
                <span className="font-semibold">{paymentSettings.account_holder}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {language === 'vi' ? 'Số TK' : 'Account number'}
                </span>
                <span className="font-semibold font-mono tracking-wide">{paymentSettings.account_number}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border/50">
                <span className="text-muted-foreground">
                  {language === 'vi' ? 'Nội dung CK' : 'Transfer note'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary font-mono">{orderCode}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-primary/10"
                    onClick={handleCopyOrderCode}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <p className="text-xs text-muted-foreground text-center">
            {language === 'vi'
              ? 'Vui lòng chuyển khoản đúng số tiền và nội dung để được xác nhận nhanh nhất.'
              : 'Please transfer the exact amount with the correct note for fastest confirmation.'}
          </p>

          {/* Submit Button with icon */}
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={handleConfirmPayment}
            disabled={isSubmitting || !user}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {language === 'vi' ? 'Đang xử lý...' : 'Processing...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                {language === 'vi' ? 'Xác nhận đã thanh toán' : 'Confirm Payment'}
              </>
            )}
          </Button>

          {!user && (
            <p className="text-xs text-destructive text-center">
              {language === 'vi'
                ? 'Vui lòng đăng nhập để thanh toán'
                : 'Please login to make payment'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
