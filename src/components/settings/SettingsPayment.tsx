import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';

export const SettingsPayment = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        {language === 'vi' ? 'Phương thức thanh toán' : 'Payment Methods'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            {language === 'vi' ? 'Thẻ thanh toán' : 'Payment Cards'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Quản lý các phương thức thanh toán của bạn' 
              : 'Manage your payment methods'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">
              {language === 'vi' 
                ? 'Chưa có phương thức thanh toán nào' 
                : 'No payment methods added'}
            </p>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {language === 'vi' ? 'Thêm thẻ mới' : 'Add new card'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
