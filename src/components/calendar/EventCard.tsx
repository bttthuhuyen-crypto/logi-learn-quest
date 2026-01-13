import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  Radio,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Event, EventRsvpStatus, useEventRsvp } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';

interface EventCardProps {
  event: Event;
  isLive?: boolean;
  variant?: 'default' | 'compact';
}

const locationTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  skool_call: { label: 'Skool Call', icon: <Video className="h-3.5 w-3.5" /> },
  skool_webinar: { label: 'Webinar', icon: <Video className="h-3.5 w-3.5" /> },
  zoom: { label: 'Zoom', icon: <Video className="h-3.5 w-3.5" /> },
  google_meet: { label: 'Google Meet', icon: <Video className="h-3.5 w-3.5" /> },
  in_person: { label: 'Trực tiếp', icon: <MapPin className="h-3.5 w-3.5" /> },
  other: { label: 'Khác', icon: <ExternalLink className="h-3.5 w-3.5" /> },
};

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isLive = false,
  variant = 'default' 
}) => {
  const { user } = useAuth();
  const { mutate: updateRsvp, isPending } = useEventRsvp();

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}m` : `${hours} giờ`;
  };

  const getEndTime = () => {
    const [hours, minutes] = event.start_time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + event.duration_minutes;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const handleRsvp = (status: EventRsvpStatus) => {
    if (!user) return;
    updateRsvp({ eventId: event.id, status });
  };

  const locationInfo = event.location_type ? locationTypeLabels[event.location_type] : null;

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50",
          isLive && "border-red-500/50 bg-red-500/5"
        )}
      >
        <div className="flex items-center gap-2">
          {isLive && <Radio className="h-4 w-4 text-red-500 animate-pulse" />}
          <span className="font-medium text-sm line-clamp-1">{event.title}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(event.start_time)}
          </span>
          {event.attendee_count > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.attendee_count}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border bg-card transition-all hover:shadow-md",
        isLive && "border-red-500 ring-2 ring-red-500/20"
      )}
    >
      {/* Live badge */}
      {isLive && (
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="destructive" className="gap-1 animate-pulse">
            <Radio className="h-3 w-3" />
            ĐANG DIỄN RA
          </Badge>
        </div>
      )}

      {/* Cover image */}
      {event.cover_image_url && (
        <div className="relative aspect-video rounded-md overflow-hidden mb-3">
          <img 
            src={event.cover_image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-lg line-clamp-2 mb-2">{event.title}</h3>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.description}
        </p>
      )}

      {/* Event details */}
      <div className="space-y-2 text-sm">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(event.start_date), "EEEE, dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(event.start_time)} - {getEndTime()} ({formatDuration(event.duration_minutes)})
          </span>
        </div>

        {/* Location */}
        {locationInfo && (
          <div className="flex items-center gap-2 text-muted-foreground">
            {locationInfo.icon}
            <span>{locationInfo.label}</span>
            {event.location_address && (
              <span className="text-xs">• {event.location_address}</span>
            )}
          </div>
        )}

        {/* Attendees */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{event.attendee_count} người tham gia</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        {isLive && event.location_url && (
          <Button 
            className="flex-1 gap-2" 
            asChild
          >
            <a href={event.location_url} target="_blank" rel="noopener noreferrer">
              <Video className="h-4 w-4" />
              Tham gia ngay
            </a>
          </Button>
        )}

        {!isLive && user && (
          <div className="flex items-center gap-2 w-full">
            <Button
              variant={event.user_rsvp === 'going' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => handleRsvp('going')}
              disabled={isPending}
            >
              Sẽ tham gia
            </Button>
            <Button
              variant={event.user_rsvp === 'maybe' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleRsvp('maybe')}
              disabled={isPending}
            >
              Có thể
            </Button>
          </div>
        )}

        {!isLive && !user && (
          <p className="text-sm text-muted-foreground">
            Đăng nhập để xác nhận tham gia
          </p>
        )}
      </div>
    </div>
  );
};
