import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, Language, TranslationKeys } from './translations';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
  formatDate: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
  formatRelativeDate: (date: Date | string) => string;
  interpolate: (template: string, values: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred_language');
    return (saved as Language) || 'vi';
  });
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth changes to get user ID
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load language from database when user logs in
  useEffect(() => {
    if (!userId) return;

    const loadUserSettings = async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('language')
        .eq('user_id', userId)
        .maybeSingle();

      if (data?.language) {
        setLanguageState(data.language as Language);
        localStorage.setItem('preferred_language', data.language);
      }
    };

    loadUserSettings();
  }, [userId]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);

    // Save to database if user is logged in
    if (userId) {
      try {
        await supabase
          .from('user_settings')
          .upsert({ 
            user_id: userId, 
            language: lang,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'user_id' 
          });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  }, [userId]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  const formatCurrency = useCallback((amount: number): string => {
    if (language === 'vi') {
      // Vietnamese format: 500.000đ
      return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + 'đ';
    }
    // English format: 500,000 VND
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' VND';
  }, [language]);

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US').format(num);
  }, [language]);

  const formatDate = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (language === 'vi') {
      // Vietnamese format: 15/01/2026
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d);
    }
    // English format: Jan 15, 2026
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  }, [language]);

  const formatDateTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (language === 'vi') {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  }, [language]);

  const formatRelativeDate = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (language === 'vi') {
      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return formatDate(d);
    }

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(d);
  }, [language, formatDate]);

  const interpolate = useCallback((template: string, values: Record<string, string | number>): string => {
    return template.replace(/{(\w+)}/g, (_, key) => String(values[key] ?? ''));
  }, []);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      formatCurrency, 
      formatNumber, 
      formatDate, 
      formatDateTime,
      formatRelativeDate,
      interpolate 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
