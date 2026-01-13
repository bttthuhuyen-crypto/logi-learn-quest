import React from 'react';
import { Calendar, Clock, Radio } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { format, isWithinInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  start_at: string;
  end_at: string | null;
  event_type: string;
}

export const UpcomingEventsWidget: React.FC = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['upcoming-events-widget'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_at, end_at, event_type')
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data as Event[];
    },
  });

  const isLive = (event: Event) => {
    const now = new Date();
    const start = new Date(event.start_at);
    const end = event.end_at ? new Date(event.end_at) : null;
    
    if (end) {
      return isWithinInterval(now, { start, end });
    }
    // If no end time, consider it live for 2 hours after start
    const twoHoursAfterStart = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return now >= start && now <= twoHoursAfterStart;
  };

  const formatEventTime = (startAt: string) => {
    const date = new Date(startAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Hôm nay, ${format(date, 'HH:mm')}`;
    }
    return format(date, "dd/MM, HH:mm", { locale: vi });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Sự kiện sắp tới</h3>
        </div>
        <Link 
          to="/calendar" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="space-y-2">
          {events.map((event) => {
            const live = isLive(event);
            return (
              <div
                key={event.id}
                className="group p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  {live ? (
                    <Radio className="h-4 w-4 text-red-500 mt-0.5 animate-pulse" />
                  ) : (
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-foreground">
                      {live && (
                        <span className="text-red-500 mr-1">LIVE:</span>
                      )}
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatEventTime(event.start_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Không có sự kiện sắp tới
          </p>
          <Link 
            to="/calendar" 
            className="text-xs text-primary hover:underline mt-1 inline-block"
          >
            Xem lịch
          </Link>
        </div>
      )}
    </div>
  );
};
