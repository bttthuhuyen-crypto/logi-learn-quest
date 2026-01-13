import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Video, MapPin, Link, Users, X, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBannerEvents, EventLocationType, EventStatus } from '@/hooks/useEvents';

interface BannerEvent {
  id: string;
  title: string;
  start_date: string;
  start_time: string;
  duration_minutes: number;
  status: EventStatus;
  location_type: EventLocationType | null;
  location_url: string | null;
  attendee_count: number;
}

interface UpcomingEventBannerProps {
  className?: string;
}

const locationIcons: Record<string, React.ElementType> = {
  skool_call: Video,
  skool_webinar: Presentation,
  zoom: Video,
  google_meet: Video,
  in_person: MapPin,
  other: Link,
};

const formatEventDateTime = (startDate: string, startTime: string) => {
  const eventDate = new Date(`${startDate}T${startTime}`);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();
  
  const timeStr = startTime.slice(0, 5); // HH:mm
  
  if (isToday) {
    return `Hôm nay, ${timeStr}`;
  } else if (isTomorrow) {
    return `Ngày mai, ${timeStr}`;
  }
  return format(eventDate, "dd/MM, HH:mm", { locale: vi });
};

interface EventBannerCardProps {
  event: BannerEvent;
  countdown: string;
  isLive: boolean;
}

const EventBannerCard: React.FC<EventBannerCardProps> = ({ event, countdown, isLive }) => {
  const navigate = useNavigate();
  const LocationIcon = locationIcons[event.location_type || 'other'] || Calendar;

  const handleViewDetails = () => {
    navigate(`/calendar/event/${event.id}`);
  };

  return (
    <div className="p-4 bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg flex-shrink-0",
          isLive ? "bg-red-500/10" : "bg-primary/10"
        )}>
          <LocationIcon className={cn("h-5 w-5", isLive ? "text-red-500" : "text-primary")} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{event.title}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            {isLive ? (
              <span className="flex items-center gap-1 text-green-600">
                <Users className="h-3.5 w-3.5" />
                {event.attendee_count} người đang tham gia
              </span>
            ) : (
              <>
                <span>{formatEventDateTime(event.start_date, event.start_time)}</span>
                {countdown && (
                  <span className="text-primary font-medium">
                    (còn {countdown})
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {isLive && event.location_url ? (
          <Button size="sm" className="gap-2 flex-shrink-0" asChild>
            <a href={event.location_url} target="_blank" rel="noopener noreferrer">
              <Video className="h-4 w-4" />
              Tham gia ngay
            </a>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-shrink-0"
            onClick={handleViewDetails}
          >
            Xem chi tiết
          </Button>
        )}
      </div>
    </div>
  );
};

export const UpcomingEventBanner: React.FC<UpcomingEventBannerProps> = ({ className }) => {
  const { data: events = [], isLoading } = useBannerEvents();
  
  // Session-based dismiss state
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('dismissed-event-banners');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter out dismissed events
  const visibleEvents = useMemo(() => 
    events.filter(e => !dismissedIds.includes(e.id)),
    [events, dismissedIds]
  );

  // Separate live and upcoming
  const liveEvent = visibleEvents.find(e => e.status === 'live');
  const upcomingEvent = !liveEvent ? visibleEvents[0] : null;
  const displayEvent = liveEvent || upcomingEvent;

  // Countdown timer state
  const [countdown, setCountdown] = useState<string>('');

  // Update countdown
  useEffect(() => {
    if (!upcomingEvent) {
      setCountdown('');
      return;
    }

    const calculateCountdown = () => {
      const eventDateTime = new Date(`${upcomingEvent.start_date}T${upcomingEvent.start_time}`);
      const now = new Date();
      const diff = eventDateTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown('');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setCountdown(`${hours} giờ ${minutes} phút`);
      } else if (minutes > 0) {
        setCountdown(`${minutes} phút`);
      } else {
        setCountdown('sắp bắt đầu');
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [upcomingEvent]);

  // Dismiss handler
  const handleDismiss = (eventId: string) => {
    const updated = [...dismissedIds, eventId];
    setDismissedIds(updated);
    sessionStorage.setItem('dismissed-event-banners', JSON.stringify(updated));
  };

  if (isLoading || !displayEvent) return null;

  const isLive = !!liveEvent;

  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2",
        isLive ? "bg-red-500/10" : "bg-muted/50"
      )}>
        {isLive ? (
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            ĐANG DIỄN RA
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">SỰ KIỆN SẮP TỚI</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => handleDismiss(displayEvent.id)}
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Event Card */}
      <EventBannerCard 
        event={displayEvent as BannerEvent}
        countdown={countdown}
        isLive={isLive}
      />
    </div>
  );
};
