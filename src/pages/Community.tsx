import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { MessageSquare, Hash } from 'lucide-react';

const Community = () => {
  const { t } = useLanguage();

  const channels = [
    { icon: '📢', name: t.community.announcements },
    { icon: '❓', name: t.community.qna },
    { icon: '💡', name: t.community.shareExperience },
    { icon: '🎉', name: t.community.introductions },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">{t.community.title}</h1>
        <p className="text-muted-foreground text-lg mb-8">{t.community.comingSoon}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {channels.map((channel) => (
            <div key={channel.name} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <span>{channel.icon}</span>
              <Hash className="h-4 w-4" />
              <span className="text-sm">{channel.name}</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Community;
