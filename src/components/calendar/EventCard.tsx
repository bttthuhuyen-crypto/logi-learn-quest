import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Radio,
  Link as LinkIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  RefreshCw,
  Presentation,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Event } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'live';
  isPast?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

const locationTypeConfig: Record<string, { label: string; icon: React.ElementType; colorClass: string }> = {
  skool_call: { label: 'Skool Call', icon: Video, colorClass: 'text-purple-500' },
  skool_webinar: { label: 'Webinar', icon: Presentation, colorClass: 'text-blue-500' },
  zoom: { label: 'Zoom', icon: Video, colorClass: 'text-blue-600' },
  google_meet: { label: 'Google Meet', icon: Video, colorClass: 'text-green-500' },
  in_person: { label: 'Trực tiếp', icon: MapPin, colorClass: 'text-orange-500' },
  other: { label: 'Khác', icon: LinkIcon, colorClass: 'text-muted-foreground' },
};

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  variant = 'default',
  isPast = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isOwner } = useUserRole();
  const { toast } = useToast();

  const isLive = variant === 'live' || event.status === 'live';
  const canManage = user && (isAdmin || isOwner || user.id === event.creator_id);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getEndTime = () => {
    const [hours, minutes] = event.start_time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + event.duration_minutes;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
      return;
    }
    navigate(`/calendar/event/${event.id}`);
  };

  const copyEventLink = async () => {
    const url = `${window.location.origin}/calendar/event/${event.id}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Đã sao chép link sự kiện' });
  };

  const generateGoogleCalendarUrl = () => {
    const startDateTime = `${event.start_date.replace(/-/g, '')}T${event.start_time.replace(/:/g, '')}00`;
    const endTime = getEndTime();
    const endDateTime = `${event.start_date.replace(/-/g, '')}T${endTime.replace(/:/g, '')}00`;
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDateTime}/${endDateTime}`,
      details: event.description || '',
      location: event.location_address || event.location_url || '',
      ctz: event.timezone,
    });
    
    return `https://calendar.google.com/calendar/render?${params}`;
  };

  const downloadIcsFile = () => {
    const formatIcsDate = (date: string, time: string) => {
      return `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00`;
    };

    const startDT = formatIcsDate(event.start_date, event.start_time);
    const endDT = formatIcsDate(event.start_date, getEndTime());

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lovable//Calendar//EN
BEGIN:VEVENT
UID:${event.id}@lovable.dev
DTSTART:${startDT}
DTEND:${endDT}
SUMMARY:${event.title}
DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}
LOCATION:${event.location_address || event.location_url || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Đã tải file lịch' });
  };

  const locationInfo = event.location_type ? locationTypeConfig[event.location_type] : null;
  const LocationIcon = locationInfo?.icon || LinkIcon;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div 
        onClick={handleCardClick}
        className={cn(
          "p-3 rounded-lg border bg-card transition-all cursor-pointer hover:bg-accent/50",
          isLive && "border-destructive/50 bg-destructive/5"
        )}
      >
        <div className="flex items-center gap-2">
          {isLive && <Radio className="h-4 w-4 text-destructive animate-pulse" />}
          <span className="font-medium text-sm line-clamp-1">{event.title}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(event.start_time)}
          </span>
          {locationInfo && (
            <span className="flex items-center gap-1">
              <LocationIcon className={cn("h-3 w-3", locationInfo.colorClass)} />
              {locationInfo.label}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default/Live variant
  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "p-4 rounded-lg border bg-card transition-all cursor-pointer hover:shadow-md",
        isLive && "border-destructive ring-2 ring-destructive/20",
        isPast && "opacity-60"
      )}
    >
      {/* Live Badge */}
      {isLive && (
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="destructive" className="gap-1 animate-pulse">
            <Radio className="h-3 w-3" />
            ĐANG DIỄN RA
          </Badge>
        </div>
      )}

      <div className="flex gap-4">
        {/* Cover Image */}
        {event.cover_image_url ? (
          <div className="flex-shrink-0 w-24 h-24 md:w-[100px] md:h-[100px] rounded-md overflow-hidden bg-muted">
            <img 
              src={event.cover_image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-24 h-24 md:w-[100px] md:h-[100px] rounded-md bg-muted flex items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row with Menu */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-1">{event.title}</h3>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {canManage && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(event)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(event)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={copyEventLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Sao chép link
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href={generateGoogleCalendarUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Thêm vào Google Calendar
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadIcsFile}>
                  <Download className="h-4 w-4 mr-2" />
                  Thêm vào Apple Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta Info */}
          <div className="space-y-1 mt-1 text-sm text-muted-foreground">
            {/* Date & Time */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(event.start_date), "dd/MM/yyyy", { locale: vi })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(event.start_time)} - {getEndTime()}
              </span>
            </div>

            {/* Location */}
            {locationInfo && (
              <div className="flex items-center gap-1">
                <LocationIcon className={cn("h-3.5 w-3.5", locationInfo.colorClass)} />
                <span>{locationInfo.label}</span>
                {event.location_address && (
                  <span className="text-xs">• {event.location_address}</span>
                )}
              </div>
            )}

            {/* Recurring Badge */}
            {event.is_recurring && (
              <div className="flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sự kiện định kỳ</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {event.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3">
            {isLive && event.location_url ? (
              <Button 
                size="sm" 
                className="gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(event.location_url!, '_blank');
                }}
              >
                <Video className="h-4 w-4" />
                Tham gia ngay
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(generateGoogleCalendarUrl(), '_blank');
                  }}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Thêm vào lịch
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyEventLink();
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy link
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
