import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface CourseAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  order: any | null;
}

export const useCourseAccess = (courseId: string | undefined, isPaid: boolean | null): CourseAccessResult => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!courseId) {
        setIsLoading(false);
        return;
      }

      // Free courses are accessible to everyone
      if (!isPaid) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // Admin always has access
      if (isAdmin) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // Not logged in - no access to paid courses
      if (!user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Check if user has a successful order for this course
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .eq('status', 'success')
          .maybeSingle();

        if (error) {
          console.error('Error checking course access:', error);
          setHasAccess(false);
        } else {
          setHasAccess(!!data);
          setOrder(data);
        }
      } catch (err) {
        console.error('Error checking course access:', err);
        setHasAccess(false);
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [courseId, isPaid, user, isAdmin]);

  return { hasAccess, isLoading, order };
};

export const usePaymentSettings = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_qr_settings')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching payment settings:', error);
        } else {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching payment settings:', err);
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, isLoading };
};
