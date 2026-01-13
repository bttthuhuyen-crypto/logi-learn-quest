import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subWeeks, subMonths, subYears } from 'date-fns';

export interface MemberFilters {
  search?: string;
  role?: 'all' | 'owner' | 'admin' | 'moderator' | 'member';
  status?: 'all' | 'online' | 'away' | 'offline';
  levelRange?: 'all' | '1-3' | '4-6' | '7-9';
  joinedPeriod?: 'all' | 'week' | 'month' | '3months' | '6months' | 'year';
  sortBy?: 'recent' | 'newest' | 'level' | 'name';
}

export interface MemberData {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number | null;
  points: number | null;
  position: string | null;
  company: string | null;
  created_at: string;
  role: 'owner' | 'admin' | 'moderator' | 'paid_member' | 'free_member' | null;
  presence_status: 'online' | 'away' | 'offline' | null;
  last_seen_at: string | null;
  show_online_status: boolean | null;
}

const PAGE_SIZE = 20;

const getJoinedDateFilter = (period: string): Date | null => {
  const now = new Date();
  switch (period) {
    case 'week':
      return subWeeks(now, 1);
    case 'month':
      return subMonths(now, 1);
    case '3months':
      return subMonths(now, 3);
    case '6months':
      return subMonths(now, 6);
    case 'year':
      return subYears(now, 1);
    default:
      return null;
  }
};

const getLevelRange = (range: string): [number, number] | null => {
  switch (range) {
    case '1-3':
      return [1, 3];
    case '4-6':
      return [4, 6];
    case '7-9':
      return [7, 9];
    default:
      return null;
  }
};

const isOnlineRecently = (lastSeenAt: string | null, showStatus: boolean | null): boolean => {
  if (!showStatus || !lastSeenAt) return false;
  const lastSeen = new Date(lastSeenAt);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return lastSeen > fiveMinutesAgo;
};

export const useCommunityMembers = (filters: MemberFilters, page: number = 0) => {
  return useQuery({
    queryKey: ['community-members', filters, page],
    queryFn: async () => {
      // First get profiles
      let profilesQuery = supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          avatar_url,
          bio,
          level,
          points,
          position,
          company,
          created_at
        `);

      // Apply search filter
      if (filters.search) {
        profilesQuery = profilesQuery.or(`full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
      }

      // Apply level filter
      const levelRange = filters.levelRange ? getLevelRange(filters.levelRange) : null;
      if (levelRange) {
        profilesQuery = profilesQuery.gte('level', levelRange[0]).lte('level', levelRange[1]);
      }

      // Apply joined filter
      const joinedDate = filters.joinedPeriod ? getJoinedDateFilter(filters.joinedPeriod) : null;
      if (joinedDate) {
        profilesQuery = profilesQuery.gte('created_at', joinedDate.toISOString());
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          profilesQuery = profilesQuery.order('created_at', { ascending: false });
          break;
        case 'level':
          profilesQuery = profilesQuery.order('level', { ascending: false, nullsFirst: false });
          break;
        case 'name':
          profilesQuery = profilesQuery.order('full_name', { ascending: true, nullsFirst: false });
          break;
        default:
          profilesQuery = profilesQuery.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      profilesQuery = profilesQuery.range(from, to);

      const { data: profiles, error: profilesError } = await profilesQuery;

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map(p => p.user_id);

      // Get roles for these users
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Get presence for these users
      const { data: presence } = await supabase
        .from('user_presence')
        .select('user_id, status, last_seen_at, show_online_status')
        .in('user_id', userIds);

      // Combine data
      let members: MemberData[] = profiles.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        const userPresence = presence?.find(p => p.user_id === profile.user_id);
        
        return {
          ...profile,
          role: userRole?.role || null,
          presence_status: userPresence?.status || 'offline',
          last_seen_at: userPresence?.last_seen_at || null,
          show_online_status: userPresence?.show_online_status ?? true,
        };
      });

      // Filter by role
      if (filters.role && filters.role !== 'all') {
        if (filters.role === 'member') {
          members = members.filter(m => m.role === 'paid_member' || m.role === 'free_member' || !m.role);
        } else {
          members = members.filter(m => m.role === filters.role);
        }
      }

      // Filter by online status
      if (filters.status && filters.status !== 'all') {
        members = members.filter(m => {
          if (!m.show_online_status) return filters.status === 'offline';
          
          if (filters.status === 'online') {
            return m.presence_status === 'online' && isOnlineRecently(m.last_seen_at, m.show_online_status);
          }
          if (filters.status === 'away') {
            return m.presence_status === 'away';
          }
          if (filters.status === 'offline') {
            return m.presence_status === 'offline' || !isOnlineRecently(m.last_seen_at, m.show_online_status);
          }
          return true;
        });
      }

      // Sort by recent activity if selected
      if (filters.sortBy === 'recent') {
        members.sort((a, b) => {
          const aTime = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
          const bTime = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
          return bTime - aTime;
        });
      }

      return members;
    },
    staleTime: 30000,
  });
};

export const useAdminMembers = () => {
  return useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      // Get all admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['owner', 'admin', 'moderator']);

      if (rolesError) throw rolesError;
      if (!adminRoles || adminRoles.length === 0) return [];

      const userIds = adminRoles.map(r => r.user_id);

      // Get profiles for admins
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          avatar_url,
          bio,
          level,
          points,
          position,
          company,
          created_at
        `)
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Get presence
      const { data: presence } = await supabase
        .from('user_presence')
        .select('user_id, status, last_seen_at, show_online_status')
        .in('user_id', userIds);

      // Combine and sort by role priority
      const rolePriority = { owner: 0, admin: 1, moderator: 2 };
      
      const members: MemberData[] = profiles.map(profile => {
        const userRole = adminRoles.find(r => r.user_id === profile.user_id);
        const userPresence = presence?.find(p => p.user_id === profile.user_id);
        
        return {
          ...profile,
          role: userRole?.role || null,
          presence_status: userPresence?.status || 'offline',
          last_seen_at: userPresence?.last_seen_at || null,
          show_online_status: userPresence?.show_online_status ?? true,
        };
      });

      // Sort by role priority
      members.sort((a, b) => {
        const aPriority = a.role ? rolePriority[a.role as keyof typeof rolePriority] ?? 3 : 3;
        const bPriority = b.role ? rolePriority[b.role as keyof typeof rolePriority] ?? 3 : 3;
        return aPriority - bPriority;
      });

      return members;
    },
    staleTime: 60000,
  });
};

export const useMembersCount = () => {
  return useQuery({
    queryKey: ['members-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000,
  });
};
