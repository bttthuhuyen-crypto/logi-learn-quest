import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type EventStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type EventRsvpStatus = 'going' | 'maybe' | 'not_going';
export type EventLocationType = 'skool_call' | 'skool_webinar' | 'zoom' | 'google_meet' | 'in_person' | 'other';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  start_date: string;
  start_time: string;
  duration_minutes: number;
  timezone: string;
  location_type: EventLocationType | null;
  location_url: string | null;
  location_address: string | null;
  status: EventStatus;
  attendee_count: number;
  creator_id: string | null;
  is_recurring: boolean;
  created_at: string;
  // Joined data
  creator?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  user_rsvp?: EventRsvpStatus | null;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: EventRsvpStatus;
  joined_at: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Helper to get creator info separately
const fetchCreatorInfo = async (creatorId: string | null) => {
  if (!creatorId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('user_id', creatorId)
    .maybeSingle();
  return data;
};

// Fetch live events
export const useLiveEvents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['events', 'live'],
    queryFn: async () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`status.eq.live,and(status.eq.scheduled,start_date.eq.${currentDate},start_time.lte.${currentTime})`)
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      // Get user RSVPs if logged in
      let rsvpMap: Record<string, EventRsvpStatus> = {};
      if (user && data.length > 0) {
        const { data: rsvps } = await supabase
          .from('event_attendees')
          .select('event_id, status')
          .eq('user_id', user.id)
          .in('event_id', data.map(e => e.id));
        
        rsvps?.forEach(r => {
          rsvpMap[r.event_id] = r.status as EventRsvpStatus;
        });
      }

      // Fetch creator info for each event
      const eventsWithCreators = await Promise.all(
        data.map(async (event) => ({
          ...event,
          creator: await fetchCreatorInfo(event.creator_id),
          user_rsvp: rsvpMap[event.id] || null
        }))
      );

      return eventsWithCreators as Event[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live status
  });
};

// Fetch upcoming events
export const useUpcomingEvents = (limit?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['events', 'upcoming', limit],
    queryFn: async () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0];

      let query = supabase
        .from('events')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .or(`start_date.gt.${currentDate},and(start_date.eq.${currentDate},start_time.gte.${currentTime})`)
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data) return [];

      // Get user RSVPs if logged in
      let rsvpMap: Record<string, EventRsvpStatus> = {};
      if (user && data.length > 0) {
        const { data: rsvps } = await supabase
          .from('event_attendees')
          .select('event_id, status')
          .eq('user_id', user.id)
          .in('event_id', data.map(e => e.id));
        
        rsvps?.forEach(r => {
          rsvpMap[r.event_id] = r.status as EventRsvpStatus;
        });
      }

      // Fetch creator info for each event
      const eventsWithCreators = await Promise.all(
        data.map(async (event) => ({
          ...event,
          creator: await fetchCreatorInfo(event.creator_id),
          user_rsvp: rsvpMap[event.id] || null
        }))
      );

      return eventsWithCreators as Event[];
    },
  });
};

// Fetch past events (last 30 days)
export const usePastEvents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['events', 'past'],
    queryFn: async () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('status', ['ended', 'cancelled'])
        .gte('start_date', thirtyDaysAgo)
        .lte('start_date', currentDate)
        .order('start_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      // Get user RSVPs if logged in
      let rsvpMap: Record<string, EventRsvpStatus> = {};
      if (user && data.length > 0) {
        const { data: rsvps } = await supabase
          .from('event_attendees')
          .select('event_id, status')
          .eq('user_id', user.id)
          .in('event_id', data.map(e => e.id));
        
        rsvps?.forEach(r => {
          rsvpMap[r.event_id] = r.status as EventRsvpStatus;
        });
      }

      // Fetch creator info for each event
      const eventsWithCreators = await Promise.all(
        data.map(async (event) => ({
          ...event,
          creator: await fetchCreatorInfo(event.creator_id),
          user_rsvp: rsvpMap[event.id] || null
        }))
      );

      return eventsWithCreators as Event[];
    },
  });
};

// Fetch events for a specific month
export const useMonthEvents = (year: number, month: number) => {
  return useQuery({
    queryKey: ['events', 'month', year, month],
    queryFn: async () => {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date, start_time, status, location_type')
        .gte('start_date', startDate)
        .lte('start_date', endDate)
        .not('status', 'eq', 'cancelled')
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return (data || []) as Pick<Event, 'id' | 'title' | 'start_date' | 'start_time' | 'status' | 'location_type'>[];
    },
  });
};

// RSVP to an event
export const useEventRsvp = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: EventRsvpStatus | null }) => {
      if (!user) throw new Error('Must be logged in');

      if (status === null) {
        // Remove RSVP
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Upsert RSVP
        const { error } = await supabase
          .from('event_attendees')
          .upsert({
            event_id: eventId,
            user_id: user.id,
            status,
          }, {
            onConflict: 'event_id,user_id'
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Đã cập nhật',
        description: 'Trạng thái tham gia đã được lưu',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái. Vui lòng thử lại.',
        variant: 'destructive',
      });
      console.error('RSVP error:', error);
    },
  });
};

// Get event attendees
export const useEventAttendees = (eventId: string) => {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'going')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      // Fetch profile info for each attendee
      const attendeesWithProfiles = await Promise.all(
        data.map(async (attendee) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', attendee.user_id)
            .maybeSingle();
          
          return {
            ...attendee,
            profile
          };
        })
      );

      return attendeesWithProfiles as EventAttendee[];
    },
    enabled: !!eventId,
  });
};
