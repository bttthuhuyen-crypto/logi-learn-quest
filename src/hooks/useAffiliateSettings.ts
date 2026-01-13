import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AffiliateSettings {
  id: string;
  is_enabled: boolean;
  default_commission_rate: number;
  cookie_duration_days: number;
  pending_period_days: number;
  min_payout_amount: number;
}

export interface CourseAffiliateSettings {
  id: string;
  course_id: string;
  commission_rate: number | null;
  is_enabled: boolean;
  course?: {
    id: string;
    title: string;
    price: number | null;
    is_paid: boolean | null;
  };
}

export const useAffiliateSettings = () => {
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);
  const [courseSettings, setCourseSettings] = useState<CourseAffiliateSettings[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('affiliate_settings')
      .select('*')
      .single();

    if (!error && data) {
      setSettings(data);
    }
    
    setLoading(false);
  };

  const fetchCourseSettings = async () => {
    // Fetch all paid courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, price, is_paid')
      .eq('is_paid', true)
      .order('title');

    // Fetch existing course affiliate settings
    const { data: affiliateSettings } = await supabase
      .from('course_affiliate_settings')
      .select('*');

    if (courses) {
      const mergedSettings: CourseAffiliateSettings[] = courses.map(course => {
        const existing = affiliateSettings?.find(s => s.course_id === course.id);
        return {
          id: existing?.id || '',
          course_id: course.id,
          commission_rate: existing?.commission_rate ?? null,
          is_enabled: existing?.is_enabled ?? true,
          course: {
            id: course.id,
            title: course.title,
            price: course.price,
            is_paid: course.is_paid
          }
        };
      });
      setCourseSettings(mergedSettings);
    }
  };

  const updateSettings = async (updates: Partial<AffiliateSettings>) => {
    if (!settings) return { error: new Error('No settings found') };

    const { error } = await supabase
      .from('affiliate_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', settings.id);

    if (!error) {
      setSettings(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  const updateCourseSettings = async (courseId: string, updates: { commission_rate?: number | null; is_enabled?: boolean }) => {
    const existing = courseSettings.find(s => s.course_id === courseId);

    if (existing?.id) {
      // Update existing
      const { error } = await supabase
        .from('course_affiliate_settings')
        .update(updates)
        .eq('id', existing.id);

      if (!error) {
        setCourseSettings(prev => prev.map(s => 
          s.course_id === courseId ? { ...s, ...updates } : s
        ));
      }
      return { error };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('course_affiliate_settings')
        .insert({
          course_id: courseId,
          ...updates
        })
        .select()
        .single();

      if (!error && data) {
        setCourseSettings(prev => prev.map(s => 
          s.course_id === courseId ? { ...s, id: data.id, ...updates } : s
        ));
      }
      return { error };
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCourseSettings();
  }, []);

  return {
    settings,
    courseSettings,
    loading,
    updateSettings,
    updateCourseSettings,
    refetch: () => {
      fetchSettings();
      fetchCourseSettings();
    }
  };
};
