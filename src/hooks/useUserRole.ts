import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'owner' | 'admin' | 'paid_member' | 'free_member';

interface UserRoleData {
  roles: AppRole[];
  isAdmin: boolean;
  isOwner: boolean;
  isPaidMember: boolean;
  loading: boolean;
}

export const useUserRole = (): UserRoleData => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!error && data) {
        setRoles(data.map(r => r.role as AppRole));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const isOwner = roles.includes('owner');
  const isAdmin = roles.includes('admin') || isOwner;
  const isPaidMember = roles.includes('paid_member') || isAdmin;

  return {
    roles,
    isAdmin,
    isOwner,
    isPaidMember,
    loading,
  };
};
