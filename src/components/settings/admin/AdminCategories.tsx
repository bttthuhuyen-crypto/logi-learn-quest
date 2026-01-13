import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus } from 'lucide-react';

export const AdminCategories = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {language === 'vi' ? 'Danh mục' : 'Categories'}
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {language === 'vi' ? 'Thêm danh mục' : 'Add Category'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5" />
            {language === 'vi' ? 'Quản lý danh mục' : 'Category Management'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Tổ chức nội dung theo danh mục' 
              : 'Organize content by categories'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {language === 'vi' 
                ? 'Chưa có danh mục nào' 
                : 'No categories yet'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
