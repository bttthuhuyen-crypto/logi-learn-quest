import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAffiliateSettings } from '@/hooks/useAffiliateSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Settings, DollarSign, Clock, Percent, Edit2, Loader2 } from 'lucide-react';

export const AffiliateSettingsPanel: React.FC = () => {
  const { language } = useLanguage();
  const { settings, courseSettings, loading, updateSettings, updateCourseSettings } = useAffiliateSettings();
  
  const [saving, setSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{ courseId: string; rate: number | null } | null>(null);
  const [tempCommissionRate, setTempCommissionRate] = useState<string>('');

  const commissionRates = [0, 10, 20, 30, 40, 50];

  const handleToggleAffiliate = async (enabled: boolean) => {
    setSaving(true);
    const { error } = await updateSettings({ is_enabled: enabled });
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    } else {
      toast.success(language === 'vi' ? 'Đã cập nhật cài đặt' : 'Settings updated');
    }
    setSaving(false);
  };

  const handleCommissionRateChange = async (rate: string) => {
    setSaving(true);
    const { error } = await updateSettings({ default_commission_rate: parseInt(rate) });
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    } else {
      toast.success(language === 'vi' ? 'Đã cập nhật hoa hồng mặc định' : 'Default commission updated');
    }
    setSaving(false);
  };

  const handleSaveTimeSettings = async (field: 'cookie_duration_days' | 'pending_period_days' | 'min_payout_amount', value: number) => {
    setSaving(true);
    const { error } = await updateSettings({ [field]: value });
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    } else {
      toast.success(language === 'vi' ? 'Đã lưu cài đặt' : 'Settings saved');
    }
    setSaving(false);
  };

  const handleSaveCourseCommission = async () => {
    if (!editingCourse) return;
    
    setSaving(true);
    const rate = tempCommissionRate === '' ? null : parseInt(tempCommissionRate);
    const { error } = await updateCourseSettings(editingCourse.courseId, { commission_rate: rate });
    
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    } else {
      toast.success(language === 'vi' ? 'Đã cập nhật hoa hồng' : 'Commission updated');
      setEditingCourse(null);
    }
    setSaving(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Affiliate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {language === 'vi' ? 'Cài đặt Affiliate' : 'Affiliate Settings'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Quản lý hệ thống tiếp thị liên kết' 
              : 'Manage affiliate marketing system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                {language === 'vi' ? 'Bật hệ thống Affiliate' : 'Enable Affiliate System'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'vi' 
                  ? 'Cho phép thành viên kiếm hoa hồng từ giới thiệu' 
                  : 'Allow members to earn commission from referrals'}
              </p>
            </div>
            <Switch
              checked={settings?.is_enabled ?? false}
              onCheckedChange={handleToggleAffiliate}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Default Commission Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            {language === 'vi' ? 'Hoa hồng mặc định cho Khóa học' : 'Default Course Commission'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Tỷ lệ hoa hồng áp dụng cho tất cả khóa học trả phí' 
              : 'Commission rate applied to all paid courses'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings?.default_commission_rate?.toString() ?? '30'}
            onValueChange={handleCommissionRateChange}
            className="grid grid-cols-3 sm:grid-cols-6 gap-4"
          >
            {commissionRates.map((rate) => (
              <div key={rate} className="flex items-center space-x-2">
                <RadioGroupItem value={rate.toString()} id={`rate-${rate}`} />
                <Label htmlFor={`rate-${rate}`} className="cursor-pointer">
                  {rate === 0 ? (language === 'vi' ? 'Tắt' : 'Off') : `${rate}%`}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Per-Course Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {language === 'vi' ? 'Cài đặt riêng cho từng khóa học' : 'Per-Course Settings'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Tùy chỉnh hoa hồng cho từng khóa học (để trống = dùng mặc định)' 
              : 'Customize commission for each course (empty = use default)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courseSettings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {language === 'vi' ? 'Chưa có khóa học trả phí' : 'No paid courses yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {courseSettings.map((cs) => (
                <div 
                  key={cs.course_id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{cs.course?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Giá:' : 'Price:'} {formatCurrency(cs.course?.price ?? 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {cs.commission_rate !== null 
                        ? `${cs.commission_rate}%` 
                        : `${settings?.default_commission_rate ?? 30}% (${language === 'vi' ? 'mặc định' : 'default'})`
                      }
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCourse({ courseId: cs.course_id, rate: cs.commission_rate });
                        setTempCommissionRate(cs.commission_rate?.toString() ?? '');
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {language === 'vi' ? 'Cài đặt thời gian' : 'Time Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Thời gian chờ thanh toán' : 'Pending Period'}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings?.pending_period_days ?? 14}
                  onChange={(e) => handleSaveTimeSettings('pending_period_days', parseInt(e.target.value) || 14)}
                  className="w-24"
                  min={1}
                  max={90}
                />
                <span className="text-sm text-muted-foreground">{language === 'vi' ? 'ngày' : 'days'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' 
                  ? 'Hoa hồng sẽ được giữ lại để đề phòng hoàn tiền' 
                  : 'Commission held to prevent refund issues'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Cookie Duration' : 'Cookie Duration'}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings?.cookie_duration_days ?? 14}
                  onChange={(e) => handleSaveTimeSettings('cookie_duration_days', parseInt(e.target.value) || 14)}
                  className="w-24"
                  min={1}
                  max={90}
                />
                <span className="text-sm text-muted-foreground">{language === 'vi' ? 'ngày' : 'days'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' 
                  ? 'Thời gian ghi nhận referral sau khi click link' 
                  : 'Time to track referral after link click'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Số tiền tối thiểu để rút' : 'Minimum Payout'}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings?.min_payout_amount ?? 100000}
                  onChange={(e) => handleSaveTimeSettings('min_payout_amount', parseInt(e.target.value) || 100000)}
                  className="w-32"
                  min={0}
                  step={10000}
                />
                <span className="text-sm text-muted-foreground">VND</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' 
                  ? 'Số tiền tối thiểu để yêu cầu rút tiền' 
                  : 'Minimum amount to request payout'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Course Commission Modal */}
      <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Chỉnh sửa hoa hồng' : 'Edit Commission'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Tỷ lệ hoa hồng (%)' : 'Commission Rate (%)'}</Label>
              <Input
                type="number"
                value={tempCommissionRate}
                onChange={(e) => setTempCommissionRate(e.target.value)}
                placeholder={language === 'vi' ? 'Để trống = dùng mặc định' : 'Empty = use default'}
                min={0}
                max={100}
              />
              <p className="text-sm text-muted-foreground">
                {language === 'vi' 
                  ? `Mặc định: ${settings?.default_commission_rate ?? 30}%` 
                  : `Default: ${settings?.default_commission_rate ?? 30}%`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCourse(null)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveCourseCommission} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {language === 'vi' ? 'Lưu' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
