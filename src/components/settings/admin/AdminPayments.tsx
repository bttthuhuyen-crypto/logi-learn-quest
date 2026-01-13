import { useLanguage } from '@/i18n/LanguageContext';
import { PayoutRequestsPanel } from '@/components/admin/PayoutRequestsPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Banknote } from 'lucide-react';

export const AdminPayments = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        {language === 'vi' ? 'Cài đặt thanh toán' : 'Payment Settings'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Banknote className="h-5 w-5" />
            {language === 'vi' ? 'Yêu cầu rút tiền' : 'Payout Requests'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Quản lý các yêu cầu rút tiền từ affiliate' 
              : 'Manage affiliate payout requests'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PayoutRequestsPanel />
        </CardContent>
      </Card>
    </div>
  );
};
