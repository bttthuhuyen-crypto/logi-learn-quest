import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Users, Search, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Members = () => {
  const { language } = useLanguage();

  const sampleMembers = [
    { name: 'Nguyễn Văn A', level: 5, online: true },
    { name: 'Trần Thị B', level: 3, online: true },
    { name: 'Lê Văn C', level: 7, online: false },
    { name: 'Phạm Thị D', level: 2, online: false },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">
                {language === 'vi' ? 'Thành viên' : 'Members'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'vi' ? '4 thành viên' : '4 members'}
              </p>
            </div>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={language === 'vi' ? 'Tìm kiếm...' : 'Search...'} 
              className="pl-10" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleMembers.map((member, index) => (
            <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {member.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <Badge variant="outline" className="text-xs">
                    Level {member.level}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Members;
