import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export const EmptyChat: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
      <p className="text-lg font-medium">
        {t.messenger?.selectConversation || 'Chọn một cuộc trò chuyện để bắt đầu'}
      </p>
    </div>
  );
};
