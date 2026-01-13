import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plug } from 'lucide-react';

export const AdminPlugins = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">Plugins</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plug className="h-5 w-5" />
            {language === 'vi' ? 'Quản lý Plugins' : 'Plugin Management'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Mở rộng chức năng với các plugin' 
              : 'Extend functionality with plugins'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {language === 'vi' 
                ? 'Chưa có plugin nào được cài đặt' 
                : 'No plugins installed'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
