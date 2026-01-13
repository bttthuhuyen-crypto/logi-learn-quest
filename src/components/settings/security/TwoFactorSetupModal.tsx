import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTwoFactor } from '@/hooks/useTwoFactor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Shield, Copy, Check } from 'lucide-react';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: 'vi' | 'en';
}

export function TwoFactorSetupModal({ isOpen, onClose, onSuccess, language }: TwoFactorSetupModalProps) {
  const { 
    qrCode, 
    secret, 
    isEnrolling, 
    isVerifying,
    startEnrollment, 
    verifyAndActivate,
    cancelEnrollment,
  } = useTwoFactor();
  
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const t = {
    title: language === 'vi' ? 'Kích hoạt xác thực 2 bước' : 'Enable Two-Factor Authentication',
    step1: language === 'vi' ? 'Bước 1: Quét mã QR bằng ứng dụng Authenticator' : 'Step 1: Scan QR code with Authenticator app',
    step1Desc: language === 'vi' 
      ? '(Google Authenticator, Authy, Microsoft Authenticator)' 
      : '(Google Authenticator, Authy, Microsoft Authenticator)',
    orManual: language === 'vi' ? 'Hoặc nhập mã thủ công:' : 'Or enter code manually:',
    step2: language === 'vi' ? 'Bước 2: Nhập mã 6 số từ ứng dụng' : 'Step 2: Enter 6-digit code from app',
    cancel: language === 'vi' ? 'Hủy' : 'Cancel',
    verify: language === 'vi' ? 'Xác nhận' : 'Verify',
    success: language === 'vi' ? 'Đã kích hoạt xác thực 2 bước!' : '2FA enabled successfully!',
    error: language === 'vi' ? 'Mã không đúng. Vui lòng thử lại.' : 'Invalid code. Please try again.',
    copied: language === 'vi' ? 'Đã copy!' : 'Copied!',
  };

  useEffect(() => {
    if (isOpen && !qrCode) {
      startEnrollment().catch(() => {
        toast.error(language === 'vi' ? 'Không thể khởi tạo 2FA' : 'Failed to initialize 2FA');
        onClose();
      });
    }
  }, [isOpen]);

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;

    try {
      await verifyAndActivate(code);
      toast.success(t.success);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(t.error);
      setCode('');
    }
  };

  const handleClose = () => {
    cancelEnrollment();
    setCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isEnrolling ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Step 1: QR Code */}
              <div className="space-y-3">
                <p className="text-sm font-medium">{t.step1}</p>
                <p className="text-xs text-muted-foreground">{t.step1Desc}</p>
                
                {qrCode && (
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                  </div>
                )}

                {secret && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t.orManual}</p>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="flex-1 text-sm font-mono break-all">{secret}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopySecret}
                        className="shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t" />

              {/* Step 2: Enter Code */}
              <div className="space-y-3">
                <p className="text-sm font-medium">{t.step2}</p>
                <div className="flex justify-center">
                  <InputOTP
                    value={code}
                    onChange={setCode}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleVerify} disabled={isVerifying || code.length !== 6}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.verify}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
