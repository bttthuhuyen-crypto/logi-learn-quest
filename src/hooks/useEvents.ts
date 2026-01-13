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

// Fetch events for a specific month (includes visible grid range)
export const useMonthEvents = (year: number, month: number) => {
  return useQuery({
    queryKey: ['events', 'month', year, month],
    queryFn: async () => {
      // Calculate the full grid range (from start of first week to end of last week)
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      // Get the Sunday of the week containing the first day of the month
      const gridStart = new Date(monthStart);
      gridStart.setDate(monthStart.getDate() - monthStart.getDay());
      
      // Get the Saturday of the week containing the last day of the month
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
  });
};

// Fetch events for banner: live or within next 24 hours
export const useBannerEvents = () => {
  return useQuery({
    queryKey: ['events', 'banner'],
    queryFn: async () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 8);
      
      // Calculate 24 hours from now
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const futureDate = in24Hours.toISOString().split('T')[0];
      const futureTime = in24Hours.toTimeString().slice(0, 8);

      // Query for live events or scheduled events within 24 hours
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
        .order('status', { ascending: false }) // 'live' comes before 'scheduled'
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000, // Auto-refresh every minute
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
      
      // Fetch creator info
      const creator = await fetchCreatorInfo(data.creator_id);
      
      // Fetch user RSVP
      let userRsvp = null;
      if (user) {
        const { data: rsvp } = await supabase
          .from('event_attendees')
          .select('status')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();
        userRsvp = rsvp?.status || null;
      }

      return {
        ...data,
        creator,
        user_rsvp: userRsvp,
      } as Event;
    },
    enabled: !!eventId,
  });
};

// Fetch related events (recurring series)
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
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa sự kiện. Vui lòng thử lại.',
        variant: 'destructive',
      });
      console.error('Delete event error:', error);
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

      const startDateTime = new Date(`${format(eventData.start_date, 'yyyy-MM-dd')}T${eventData.start_time}`);

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description || null,
          cover_image_url: eventData.cover_image_url || null,
          start_at: startDateTime.toISOString(),
          start_date: format(eventData.start_date, 'yyyy-MM-dd'),
          start_time: eventData.start_time + ':00',
          duration_minutes: eventData.duration,
          timezone: eventData.timezone,
          location_type: eventData.location_type,
          location_url: eventData.location_url || null,
          location_address: eventData.location_address || null,
          is_recurring: eventData.is_recurring,
          recurrence_pattern: eventData.is_recurring ? eventData.recurrence_pattern : null,
          recurrence_day_of_week: eventData.recurrence_day_of_week ?? null,
          recurrence_end_type: eventData.recurrence_end_type || null,
          recurrence_end_date: eventData.recurrence_end_date 
            ? format(eventData.recurrence_end_date, 'yyyy-MM-dd') 
            : null,
          recurrence_occurrences: eventData.recurrence_occurrences || null,
          creator_id: user.id,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      // Send event notification if requested
      if (eventData.send_notification && data.id) {
        try {
          const { error: notifError } = await supabase.functions.invoke('send-event-notification', {
            body: { event_id: data.id },
          });
          if (notifError) {
            console.error('Error sending event notification:', notifError);
          }
        } catch (notifError) {
          console.error('Error invoking send-event-notification:', notifError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Thành công',
        description: 'Sự kiện đã được tạo',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo sự kiện. Vui lòng thử lại.',
        variant: 'destructive',
      });
      console.error('Create event error:', error);
    },
  });
};

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: Partial<EventFormData> }) => {
      const updateData: Record<string, unknown> = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.cover_image_url !== undefined) updateData.cover_image_url = data.cover_image_url || null;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.location_type !== undefined) updateData.location_type = data.location_type;
      if (data.location_url !== undefined) updateData.location_url = data.location_url || null;
      if (data.location_address !== undefined) updateData.location_address = data.location_address || null;
      if (data.is_recurring !== undefined) updateData.is_recurring = data.is_recurring;
      if (data.recurrence_pattern !== undefined) updateData.recurrence_pattern = data.recurrence_pattern;
      if (data.recurrence_day_of_week !== undefined) updateData.recurrence_day_of_week = data.recurrence_day_of_week;
      if (data.recurrence_end_type !== undefined) updateData.recurrence_end_type = data.recurrence_end_type;
      if (data.recurrence_occurrences !== undefined) updateData.recurrence_occurrences = data.recurrence_occurrences;
      
      if (data.start_date && data.start_time) {
        const startDateTime = new Date(`${format(data.start_date, 'yyyy-MM-dd')}T${data.start_time}`);
        updateData.start_at = startDateTime.toISOString();
        updateData.start_date = format(data.start_date, 'yyyy-MM-dd');
        updateData.start_time = data.start_time + ':00';
      }

      if (data.duration !== undefined) {
        updateData.duration_minutes = data.duration;
      }

      if (data.recurrence_end_date !== undefined) {
        updateData.recurrence_end_date = data.recurrence_end_date 
          ? format(data.recurrence_end_date, 'yyyy-MM-dd') 
          : null;
      }

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      toast({
        title: 'Thành công',
        description: 'Sự kiện đã được cập nhật',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật sự kiện. Vui lòng thử lại.',
        variant: 'destructive',
      });
      console.error('Update event error:', error);
    },
  });
};
