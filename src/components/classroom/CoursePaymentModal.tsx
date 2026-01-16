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
import { Loader2, Copy, CheckCircle, Lock, X } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden [&>button]:hidden">
        {/* Hero Section - Dark background like Skool */}
        <div className="relative bg-black text-white py-8 px-6 overflow-hidden">
          {/* Background thumbnail (blurred) */}
          {course.thumbnail_url && (
            <div className="absolute inset-0 opacity-20">
              <img 
                src={course.thumbnail_url} 
                alt=""
                className="w-full h-full object-cover blur-sm" 
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          
          {/* Close button */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors z-10"
          >
            <X className="h-5 w-5 text-white/60" />
          </button>
          
          {/* Content overlay */}
          <div className="relative flex flex-col items-center text-center space-y-3">
            {/* Lock icon - rounded square like Skool */}
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Lock className="h-7 w-7 text-white" />
            </div>
            
            {/* Course title */}
            <h2 className="text-xl font-bold">{course.title}</h2>
            
            {/* Unlock price */}
            <p className="text-white/80">
              Unlock for {formatCurrency(course.price)}
            </p>
          </div>
        </div>

        {/* Content Section - White background */}
        <div className="p-6 space-y-5 bg-background">
          {/* Course description */}
          {course.description && (
            <p className="text-muted-foreground text-sm text-center line-clamp-2">
              {course.description}
            </p>
          )}

          {/* QR Code - Centered */}
          {settingsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : paymentSettings?.qr_image_url ? (
            <div className="flex justify-center">
              <img
                src={paymentSettings.qr_image_url}
                alt="Payment QR Code"
                className="w-52 h-52 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <div className="w-52 h-52 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <span className="text-muted-foreground text-sm text-center px-4">
                  {language === 'vi' ? 'Chưa có mã QR' : 'No QR code available'}
                </span>
              </div>
            </div>
          )}

          {/* Bank Info - Compact style */}
          {paymentSettings && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-xl text-sm">
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
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
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

          {/* BUY NOW Button - Yellow like Skool */}
          <Button
            className="w-full h-14 text-base font-bold bg-yellow-400 hover:bg-yellow-500 text-black border-0"
            onClick={handleConfirmPayment}
            disabled={isSubmitting || !user}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {language === 'vi' ? 'Đang xử lý...' : 'Processing...'}
              </>
            ) : (
              <>
                {language === 'vi' ? 'MUA NGAY' : 'BUY NOW'} {formatCurrency(course.price)}
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
