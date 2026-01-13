import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package } from 'lucide-react';

export const SettingsOrders = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        {language === 'vi' ? 'Lịch sử đơn hàng' : 'Order History'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            {language === 'vi' ? 'Đơn hàng của bạn' : 'Your Orders'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Xem lại các đơn hàng đã mua' 
              : 'Review your purchase history'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {language === 'vi' 
                ? 'Chưa có đơn hàng nào' 
                : 'No orders yet'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
