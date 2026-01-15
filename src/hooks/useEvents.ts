import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type EventStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type EventRsvpStatus = 'going' | 'maybe' | 'not_going';
export type EventLocationType = 'skool_call' | 'skool_webinar' | 'zoom' | 'google_meet' | 'in_person' | 'other';
export type EventRecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  recurrence_pattern?: EventRecurrencePattern | null;
  recurrence_day_of_week?: number | null;
  parent_event_id?: string | null;
  created_at: string;
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

// Helper to fetch user RSVPs in batch
const fetchUserRsvps = async (userId: string, eventIds: string[]): Promise<Record<string, EventRsvpStatus>> => {
  if (eventIds.length === 0) return {};
  
  const { data: rsvps } = await supabase
    .from('event_attendees')
    .select('event_id, status')
    .eq('user_id', userId)
    .in('event_id', eventIds);
  
  const rsvpMap: Record<string, EventRsvpStatus> = {};
  rsvps?.forEach(r => {
    rsvpMap[r.event_id] = r.status as EventRsvpStatus;
  });
  return rsvpMap;
};

// Helper to fetch creator profiles in batch
const fetchCreatorProfiles = async (creatorIds: string[]): Promise<Record<string, { full_name: string | null; avatar_url: string | null }>> => {
  const uniqueIds = [...new Set(creatorIds.filter(Boolean))];
  if (uniqueIds.length === 0) return {};
  
  const { data } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url')
    .in('user_id', uniqueIds);
  
  const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
  data?.forEach(p => {
    profileMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
  });
  return profileMap;
};

// Fetch live events - NO polling, rely on realtime
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
      if (!data || data.length === 0) return [];

      // Batch fetch RSVPs and creators in parallel
      const [rsvpMap, creatorMap] = await Promise.all([
        user ? fetchUserRsvps(user.id, data.map(e => e.id)) : Promise.resolve({}),
        fetchCreatorProfiles(data.map(e => e.creator_id).filter(Boolean) as string[])
      ]);

      return data.map(event => ({
        ...event,
        creator: event.creator_id ? creatorMap[event.creator_id] || null : null,
        user_rsvp: rsvpMap[event.id] || null
      })) as Event[];
    },
    // DISABLED polling - rely on realtime instead
    refetchInterval: false,
  });
};

// Fetch upcoming events - NO polling
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
      if (!data || data.length === 0) return [];

      // Batch fetch RSVPs and creators in parallel
      const [rsvpMap, creatorMap] = await Promise.all([
        user ? fetchUserRsvps(user.id, data.map(e => e.id)) : Promise.resolve({}),
        fetchCreatorProfiles(data.map(e => e.creator_id).filter(Boolean) as string[])
      ]);

      return data.map(event => ({
        ...event,
        creator: event.creator_id ? creatorMap[event.creator_id] || null : null,
        user_rsvp: rsvpMap[event.id] || null
      })) as Event[];
    },
    refetchInterval: false,
  });
};

// Fetch past events - NO polling
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
      if (!data || data.length === 0) return [];

      // Batch fetch RSVPs and creators in parallel
      const [rsvpMap, creatorMap] = await Promise.all([
        user ? fetchUserRsvps(user.id, data.map(e => e.id)) : Promise.resolve({}),
        fetchCreatorProfiles(data.map(e => e.creator_id).filter(Boolean) as string[])
      ]);

      return data.map(event => ({
        ...event,
        creator: event.creator_id ? creatorMap[event.creator_id] || null : null,
        user_rsvp: rsvpMap[event.id] || null
      })) as Event[];
    },
    refetchInterval: false,
  });
};

// Fetch events for a specific month
export const useMonthEvents = (year: number, month: number) => {
  return useQuery({
    queryKey: ['events', 'month', year, month],
    queryFn: async () => {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      const gridStart = new Date(monthStart);
      gridStart.setDate(monthStart.getDate() - monthStart.getDay());
      
      const gridEnd = new Date(monthEnd);
      gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

      const startDate = format(gridStart, 'yyyy-MM-dd');
      const endDate = format(gridEnd, 'yyyy-MM-dd');

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
    refetchInterval: false,
  });
};

// Fetch events for banner - NO polling
export const useBannerEvents = () => {
  return useQuery({
    queryKey: ['events', 'banner'],
    queryFn: async () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 8);
      
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const futureDate = in24Hours.toISOString().split('T')[0];
      const futureTime = in24Hours.toTimeString().slice(0, 8);

      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date, start_time, duration_minutes, status, location_type, location_url, attendee_count')
        .in('status', ['scheduled', 'live'])
        .or(
          `status.eq.live,` +
          `and(start_date.eq.${currentDate},start_time.gte.${currentTime}),` +
          `and(start_date.eq.${futureDate},start_time.lte.${futureTime}),` +
          `and(start_date.gt.${currentDate},start_date.lt.${futureDate})`
        )
        .order('status', { ascending: false })
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    // DISABLED polling - rely on realtime
    refetchInterval: false,
    staleTime: 30000,
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
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
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
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });
};

// Get event attendees - batch profile fetch
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
      if (!data || data.length === 0) return [];

      // Batch fetch all profiles at once
      const profileMap = await fetchCreatorProfiles(data.map(a => a.user_id));

      return data.map(attendee => ({
        ...attendee,
        profile: profileMap[attendee.user_id] || null
      })) as EventAttendee[];
    },
    enabled: !!eventId,
    refetchInterval: false,
  });
};

// Fetch single event by ID
export const useEvent = (eventId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      
      // Fetch creator and RSVP in parallel
      const [creatorMap, userRsvp] = await Promise.all([
        data.creator_id ? fetchCreatorProfiles([data.creator_id]) : Promise.resolve({}),
        user ? (async () => {
          const { data: rsvp } = await supabase
            .from('event_attendees')
            .select('status')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .maybeSingle();
          return rsvp?.status || null;
        })() : Promise.resolve(null)
      ]);

      return {
        ...data,
        creator: data.creator_id ? creatorMap[data.creator_id] || null : null,
        user_rsvp: userRsvp,
      } as Event;
    },
    enabled: !!eventId,
    refetchInterval: false,
  });
};

// Fetch related events
export const useRelatedEvents = (parentEventId: string | null | undefined) => {
  return useQuery({
    queryKey: ['related-events', parentEventId],
    queryFn: async () => {
      if (!parentEventId) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date, start_time, status')
        .or(`parent_event_id.eq.${parentEventId},id.eq.${parentEventId}`)
        .in('status', ['scheduled', 'live'])
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!parentEventId,
    refetchInterval: false,
  });
};

// Delete event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Đã xóa sự kiện',
        description: 'Sự kiện đã được xóa thành công',
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa sự kiện. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });
};

// Event form data type
export interface EventFormData {
  title: string;
  start_date: Date;
  start_time: string;
  duration: number;
  timezone: string;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_day_of_week?: number;
  recurrence_end_type?: 'never' | 'on_date' | 'after_occurrences';
  recurrence_end_date?: Date;
  recurrence_occurrences?: number;
  location_type: EventLocationType;
  location_url?: string;
  location_address?: string;
  description?: string;
  cover_image_url?: string;
  send_notification?: boolean;
}

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: EventFormData) => {
      if (!user) throw new Error('Must be logged in');

      const startAt = new Date(`${format(eventData.start_date, 'yyyy-MM-dd')}T${eventData.start_time}`);
      const endAt = new Date(startAt.getTime() + eventData.duration * 60000);

      const eventPayload = {
        title: eventData.title,
        description: eventData.description || null,
        cover_image_url: eventData.cover_image_url || null,
        start_date: format(eventData.start_date, 'yyyy-MM-dd'),
        start_time: eventData.start_time,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        duration_minutes: eventData.duration,
        timezone: eventData.timezone,
        location_type: eventData.location_type,
        location_url: eventData.location_url || null,
        location_address: eventData.location_address || null,
        is_recurring: eventData.is_recurring,
        recurrence_pattern: eventData.is_recurring ? eventData.recurrence_pattern : null,
        recurrence_day_of_week: eventData.is_recurring ? eventData.recurrence_day_of_week : null,
        recurrence_end_date: eventData.is_recurring && eventData.recurrence_end_type === 'on_date' && eventData.recurrence_end_date 
          ? format(eventData.recurrence_end_date, 'yyyy-MM-dd') 
          : null,
        recurrence_end_type: eventData.is_recurring ? eventData.recurrence_end_type : null,
        recurrence_occurrences: eventData.is_recurring && eventData.recurrence_end_type === 'after_occurrences' 
          ? eventData.recurrence_occurrences 
          : null,
        creator_id: user.id,
        status: 'scheduled' as const,
      };

      const { data, error } = await supabase
        .from('events')
        .insert(eventPayload)
        .select()
        .single();

      if (error) throw error;

      // Send notification if requested
      if (eventData.send_notification && data) {
        try {
          await supabase.functions.invoke('send-event-notification', {
            body: { eventId: data.id }
          });
        } catch {
          // Silently fail notification
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Đã tạo sự kiện',
        description: 'Sự kiện mới đã được tạo thành công',
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo sự kiện. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });
};

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, eventData }: { eventId: string; eventData: Partial<EventFormData> }) => {
      const updatePayload: Record<string, unknown> = {};

      if (eventData.title !== undefined) updatePayload.title = eventData.title;
      if (eventData.description !== undefined) updatePayload.description = eventData.description;
      if (eventData.cover_image_url !== undefined) updatePayload.cover_image_url = eventData.cover_image_url;
      
      if (eventData.start_date !== undefined) {
        updatePayload.start_date = format(eventData.start_date, 'yyyy-MM-dd');
      }
      if (eventData.start_time !== undefined) updatePayload.start_time = eventData.start_time;
      if (eventData.duration !== undefined) updatePayload.duration_minutes = eventData.duration;
      if (eventData.timezone !== undefined) updatePayload.timezone = eventData.timezone;
      
      if (eventData.start_date && eventData.start_time && eventData.duration) {
        const startAt = new Date(`${format(eventData.start_date, 'yyyy-MM-dd')}T${eventData.start_time}`);
        const endAt = new Date(startAt.getTime() + eventData.duration * 60000);
        updatePayload.start_at = startAt.toISOString();
        updatePayload.end_at = endAt.toISOString();
      }

      if (eventData.location_type !== undefined) updatePayload.location_type = eventData.location_type;
      if (eventData.location_url !== undefined) updatePayload.location_url = eventData.location_url;
      if (eventData.location_address !== undefined) updatePayload.location_address = eventData.location_address;

      const { data, error } = await supabase
        .from('events')
        .update(updatePayload)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast({
        title: 'Đã cập nhật',
        description: 'Sự kiện đã được cập nhật thành công',
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật sự kiện. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });
};