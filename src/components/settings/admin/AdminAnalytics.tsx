import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const AdminAnalytics = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        {language === 'vi' ? 'Thống kê' : 'Analytics'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            {language === 'vi' ? 'Tổng quan' : 'Overview'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Xem các số liệu thống kê của cộng đồng' 
              : 'View community statistics'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {language === 'vi' 
                ? 'Thống kê sẽ được hiển thị ở đây' 
                : 'Analytics will be displayed here'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
