import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export const AdminGeneralSettings = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        {language === 'vi' ? 'Cài đặt chung' : 'General Settings'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            {language === 'vi' ? 'Cấu hình hệ thống' : 'System Configuration'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Quản lý các cài đặt chung của hệ thống' 
              : 'Manage general system settings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {language === 'vi' 
                ? 'Các cài đặt chung sẽ được thêm vào đây' 
                : 'General settings will be added here'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
