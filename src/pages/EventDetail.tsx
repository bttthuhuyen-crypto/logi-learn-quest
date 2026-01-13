import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Presentation,
  MapPin,
  Link as LinkIcon,
  RefreshCw,
  Users,
  UserCheck,
  Copy,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useEvent, useEventAttendees, useRelatedEvents, useEventRsvp, Event } from '@/hooks/useEvents';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Location type configuration
const locationTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  skool_call: { label: 'Skool Call', icon: Video, color: 'text-purple-500' },
  skool_webinar: { label: 'Webinar', icon: Presentation, color: 'text-blue-500' },
  zoom: { label: 'Zoom Meeting', icon: Video, color: 'text-blue-600' },
  google_meet: { label: 'Google Meet', icon: Video, color: 'text-green-500' },
  in_person: { label: 'Trực tiếp', icon: MapPin, color: 'text-orange-500' },
  other: { label: 'Liên kết', icon: LinkIcon, color: 'text-muted-foreground' },
};

// Helper: Calculate end time
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

// Helper: Get timezone label
const getTimezoneLabel = (timezone: string): string => {
  const tzMap: Record<string, string> = {
    'Asia/Ho_Chi_Minh': 'Giờ Việt Nam, GMT+7',
    'Asia/Bangkok': 'Giờ Thái Lan, GMT+7',
    'Asia/Singapore': 'Giờ Singapore, GMT+8',
    'UTC': 'UTC',
  };
  return tzMap[timezone] || timezone;
};

// Helper: Get recurrence label
const getRecurrenceLabel = (pattern: string, dayOfWeek?: number | null): string => {
  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  
  switch (pattern) {
    case 'daily': return 'Lặp lại hàng ngày';
    case 'weekly': return `Lặp lại hàng tuần vào ${dayNames[dayOfWeek ?? 0]}`;
    case 'monthly': return 'Lặp lại hàng tháng';
    case 'yearly': return 'Lặp lại hàng năm';
    default: return 'Lặp lại';
  }
};

// Helper: Generate Google Calendar URL
const generateGoogleCalendarUrl = (event: Event): string => {
  const startDate = event.start_date.replace(/-/g, '');
  const startTime = event.start_time.replace(/:/g, '').slice(0, 4) + '00';
  const endTime = calculateEndTime(event.start_time, event.duration_minutes).replace(/:/g, '') + '00';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}T${startTime}/${startDate}T${endTime}`,
    details: event.description || '',
    location: event.location_address || event.location_url || '',
    ctz: event.timezone,
  });
  
  return `https://calendar.google.com/calendar/render?${params}`;
};

// Helper: Generate ICS file content
const generateIcsContent = (event: Event): string => {
  const startDate = event.start_date.replace(/-/g, '');
  const startTime = event.start_time.replace(/:/g, '').slice(0, 4) + '00';
  const endTime = calculateEndTime(event.start_time, event.duration_minutes).replace(/:/g, '') + '00';
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Community//Event//VI
BEGIN:VEVENT
DTSTART:${startDate}T${startTime}
DTEND:${startDate}T${endTime}
SUMMARY:${event.title}
DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}
LOCATION:${event.location_address || event.location_url || ''}
END:VEVENT
END:VCALENDAR`;
};

// Helper: Download ICS file
const downloadIcsFile = (event: Event) => {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper: Generate Event Schema for SEO
const generateEventSchema = (event: Event) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event.title,
  "description": event.description,
  "image": event.cover_image_url,
  "startDate": `${event.start_date}T${event.start_time}`,
  "endDate": `${event.start_date}T${calculateEndTime(event.start_time, event.duration_minutes)}`,
  "eventStatus": event.status === 'cancelled' 
    ? "https://schema.org/EventCancelled" 
    : "https://schema.org/EventScheduled",
  "eventAttendanceMode": event.location_type === 'in_person'
    ? "https://schema.org/OfflineEventAttendanceMode"
    : "https://schema.org/OnlineEventAttendanceMode",
  "location": event.location_type === 'in_person' 
    ? { "@type": "Place", "name": event.location_address || 'TBD' }
    : { "@type": "VirtualLocation", "url": event.location_url || '' },
  "organizer": event.creator ? {
    "@type": "Person",
    "name": event.creator.full_name || 'Unknown',
  } : undefined,
});

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: event, isLoading, error } = useEvent(eventId);
  const { data: attendees = [] } = useEventAttendees(eventId!);
  const { data: relatedEvents = [] } = useRelatedEvents(event?.parent_event_id || (event?.is_recurring ? event?.id : null));
  const rsvpMutation = useEventRsvp();

  // Check event status
  const isLive = event?.status === 'live';
  const isStartingSoon = React.useMemo(() => {
    if (!event || event.status !== 'scheduled') return false;
    const now = new Date();
    const eventStart = new Date(`${event.start_date}T${event.start_time}`);
    const diffMs = eventStart.getTime() - now.getTime();
    return diffMs > 0 && diffMs <= 15 * 60 * 1000; // Within 15 minutes
  }, [event]);

  const isPast = event?.status === 'ended' || event?.status === 'cancelled';

  // Copy event link
  const copyEventLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/calendar/event/${eventId}`);
    toast({ title: 'Đã sao chép link sự kiện' });
  };

  // Handle RSVP
  const handleRsvp = (status: 'going' | null) => {
    if (!eventId) return;
    rsvpMutation.mutate({ eventId, status });
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-video w-full rounded-lg mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-6 w-1/4 mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MainLayout>
    );
  }

  // Error or not found
  if (error || !event) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy sự kiện</h1>
          <p className="text-muted-foreground mb-6">Sự kiện này có thể đã bị xóa hoặc không tồn tại.</p>
          <Button onClick={() => navigate('/calendar')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại lịch
          </Button>
        </div>
      </MainLayout>
    );
  }

  const locationInfo = locationTypeConfig[event.location_type || 'other'] || locationTypeConfig.other;
  const LocationIcon = locationInfo.icon;

  return (
    <MainLayout>
      <Helmet>
        <title>{event.title} | Lịch hoạt động</title>
        <meta name="description" content={event.description?.slice(0, 160) || `Sự kiện: ${event.title}`} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description?.slice(0, 160) || ''} />
        {event.cover_image_url && <meta property="og:image" content={event.cover_image_url} />}
        <meta property="og:type" content="event" />
        <script type="application/ld+json">
          {JSON.stringify(generateEventSchema(event))}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => navigate('/calendar')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại lịch
        </Button>

        {/* Cover Image */}
        <div className="aspect-video w-full rounded-lg overflow-hidden mb-6">
          {event.cover_image_url ? (
            <img 
              src={event.cover_image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center">
              <Calendar className="h-24 w-24 text-primary/40" />
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className={cn("grid gap-8", isPast && "opacity-70")}>
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Left Column - Event Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Status */}
              <div className="flex items-start gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex-1">{event.title}</h1>
                {isLive && (
                  <Badge variant="destructive" className="animate-pulse shrink-0">
                    🔴 LIVE
                  </Badge>
                )}
                {event.status === 'cancelled' && (
                  <Badge variant="secondary" className="shrink-0">Đã hủy</Badge>
                )}
              </div>

              {/* Meta Info */}
              <div className="space-y-3">
                {/* Date */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-5 w-5 shrink-0" />
                  <span className="capitalize">
                    {format(new Date(event.start_date), "EEEE, dd 'tháng' M, yyyy", { locale: vi })}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5 shrink-0" />
                  <span>
                    {event.start_time.slice(0, 5)} - {calculateEndTime(event.start_time, event.duration_minutes)} ({getTimezoneLabel(event.timezone)})
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <LocationIcon className={cn("h-5 w-5 shrink-0", locationInfo.color)} />
                  <span>{locationInfo.label}</span>
                  {event.location_url && (
                    <a 
                      href={event.location_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Mở link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {event.location_address && (
                    <span className="text-muted-foreground">• {event.location_address}</span>
                  )}
                </div>

                {/* Recurring */}
                {event.is_recurring && event.recurrence_pattern && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <RefreshCw className="h-5 w-5 shrink-0" />
                    <span>{getRecurrenceLabel(event.recurrence_pattern, event.recurrence_day_of_week)}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="pt-4 border-t">
                  <h2 className="font-semibold mb-3">Mô tả sự kiện</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </div>
                </div>
              )}

              {/* Organizer */}
              {event.creator && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Người tổ chức</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={event.creator.avatar_url || ''} />
                      <AvatarFallback>{event.creator.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{event.creator.full_name || 'Ẩn danh'}</span>
                  </div>
                </div>
              )}

              {/* Attendees Section */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5" />
                  {event.attendee_count} người tham gia
                </h3>
                
                {/* Avatar Stack */}
                {attendees.length > 0 && (
                  <div className="flex -space-x-2 mb-4">
                    {attendees.slice(0, 8).map((attendee) => (
                      <Avatar key={attendee.id} className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={attendee.profile?.avatar_url || ''} />
                        <AvatarFallback>{attendee.profile?.full_name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                    ))}
                    {attendees.length > 8 && (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium border-2 border-background">
                        +{attendees.length - 8}
                      </div>
                    )}
                  </div>
                )}
                
                {/* RSVP Button */}
                {user && !isPast && (
                  <Button
                    variant={event.user_rsvp === 'going' ? 'default' : 'outline'}
                    className="gap-2"
                    onClick={() => handleRsvp(event.user_rsvp === 'going' ? null : 'going')}
                    disabled={rsvpMutation.isPending}
                  >
                    <UserCheck className="h-4 w-4" />
                    {event.user_rsvp === 'going' ? 'Đã đăng ký tham gia' : 'Tôi sẽ tham gia'}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column - Action Buttons (Sticky on Desktop) */}
            <div className="mt-6 lg:mt-0">
              <div className="lg:sticky lg:top-24 space-y-3">
                {/* Join Now - only for live/starting soon events */}
                {(isLive || isStartingSoon) && event.location_url && (
                  <Button size="lg" className="w-full gap-2" asChild>
                    <a href={event.location_url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-5 w-5" />
                      Tham gia ngay
                    </a>
                  </Button>
                )}

                {/* Add to Calendar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full gap-2">
                      <Calendar className="h-5 w-5" />
                      Thêm vào lịch
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem asChild>
                      <a href={generateGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                        Google Calendar
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadIcsFile(event)}>
                      Apple Calendar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadIcsFile(event)}>
                      Outlook
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Copy Link */}
                <Button variant="ghost" className="w-full gap-2" onClick={copyEventLink}>
                  <Copy className="h-5 w-5" />
                  Sao chép link
                </Button>
              </div>
            </div>
          </div>

          {/* Related Events (Recurring Series) */}
          {relatedEvents.length > 0 && (
            <section className="pt-6 border-t">
              <h3 className="font-semibold mb-4">Các buổi khác trong series</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedEvents
                  .filter(e => e.id !== event.id)
                  .slice(0, 4)
                  .map((relEvent) => (
                    <Link 
                      key={relEvent.id} 
                      to={`/calendar/event/${relEvent.id}`}
                      className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="font-medium text-sm">{relEvent.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(relEvent.start_date), 'dd/MM/yyyy')} • {relEvent.start_time.slice(0, 5)}
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetail;
