import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { MessageSquare, Hash } from 'lucide-react';

const Community = () => {
  const { language } = useLanguage();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">
          {language === 'vi' ? 'Thảo luận' : 'Community'}
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          {language === 'vi' 
            ? 'Diễn đàn thảo luận sẽ sớm ra mắt. Bạn sẽ có thể đăng bài, bình luận, và kết nối với cộng đồng.'
            : 'Discussion forum coming soon. You will be able to post, comment, and connect with the community.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {['📢 Thông báo', '❓ Hỏi đáp', '💡 Chia sẻ', '🎉 Giới thiệu'].map((channel) => (
            <div key={channel} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Hash className="h-4 w-4" />
              <span className="text-sm">{channel}</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Community;
