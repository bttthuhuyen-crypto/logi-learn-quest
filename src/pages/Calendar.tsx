import React, { useState, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Radio, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { EventCard } from '@/components/calendar/EventCard';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { EventEditorModal } from '@/components/calendar/EventEditorModal';
import { DeleteEventDialog } from '@/components/calendar/DeleteEventDialog';
import { useLiveEvents, useUpcomingEvents, usePastEvents, Event } from '@/hooks/useEvents';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'calendar';

interface GroupedEvents {
  [dateKey: string]: Event[];
}

const Calendar: React.FC = () => {
  const { isAdmin } = useUserRole();
  const isMobile = useIsMobile();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Pick<Event, 'id' | 'title' | 'start_date' | 'start_time' | 'status' | 'location_type'>[]>([]);
  const [isPastExpanded, setIsPastExpanded] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);

  const handleCreateClick = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const { data: liveEvents = [], isLoading: loadingLive } = useLiveEvents();
  const { data: upcomingEvents = [], isLoading: loadingUpcoming } = useUpcomingEvents();
  const { data: pastEvents = [], isLoading: loadingPast } = usePastEvents();

  // Group upcoming events by date
  const groupedUpcomingEvents = useMemo<GroupedEvents>(() => {
    return upcomingEvents.reduce((groups, event) => {
      const dateKey = event.start_date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {} as GroupedEvents);
  }, [upcomingEvents]);

  const handleDateSelect = (date: Date, events: typeof selectedDateEvents) => {
    setSelectedDate(date);
    setSelectedDateEvents(events);
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, dd/MM/yyyy", { locale: vi }).toUpperCase();
  };

  // Force list view on mobile
  const effectiveViewMode = isMobile ? 'list' : viewMode;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              📅 Lịch hoạt động
            </h1>
            <p className="text-muted-foreground mt-1">
              Theo dõi các sự kiện và webinar của cộng đồng
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle - Hide on mobile */}
            {!isMobile && (
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={effectiveViewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Danh sách</span>
                </Button>
                <Button
                  variant={effectiveViewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Lịch tháng</span>
                </Button>
              </div>
            )}

            {/* Create Event Button - Admin only */}
            {isAdmin && (
              <Button onClick={handleCreateClick} className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tạo sự kiện</span>
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {effectiveViewMode === 'list' ? (
          <div className="space-y-8">
            {/* Live Events Section */}
            {(loadingLive || liveEvents.length > 0) && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Radio className="h-5 w-5 text-red-500 animate-pulse" />
                  ĐANG DIỄN RA
                </h2>
                {loadingLive ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-48 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {liveEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        variant="live"
                        onEdit={handleEditEvent}
                        onDelete={setDeleteEvent}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Upcoming Events Section */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                📆 SẮP TỚI
              </h2>
              {loadingUpcoming ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-40 rounded-lg" />
                  ))}
                </div>
              ) : Object.keys(groupedUpcomingEvents).length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-lg">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Không có sự kiện sắp tới</p>
                  {isAdmin && (
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={handleCreateClick}
                    >
                      Tạo sự kiện đầu tiên
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedUpcomingEvents).map(([dateKey, events]) => (
                    <div key={dateKey}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 border-b pb-2">
                        {formatDateHeader(dateKey)}
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {events.map(event => (
                          <EventCard 
                            key={event.id} 
                            event={event}
                            onEdit={handleEditEvent}
                            onDelete={setDeleteEvent}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Events Section */}
            {(loadingPast || pastEvents.length > 0) && (
              <Collapsible open={isPastExpanded} onOpenChange={setIsPastExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      📁 ĐÃ KẾT THÚC ({pastEvents.length})
                    </span>
                    {isPastExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  {loadingPast ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {pastEvents.map(event => (
                        <EventCard 
                          key={event.id} 
                          event={event} 
                          isPast
                          onEdit={handleEditEvent}
                          onDelete={setDeleteEvent}
                        />
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ) : (
          /* Calendar View */
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            <CalendarMonthView 
              onSelectDate={handleDateSelect}
              selectedDate={selectedDate}
            />

            {/* Selected Date Events */}
            <div className="space-y-4">
              <h3 className="font-semibold">
                {selectedDate 
                  ? format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })
                  : "Chọn ngày để xem sự kiện"
                }
              </h3>

              {selectedDate && selectedDateEvents.length === 0 && (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Không có sự kiện trong ngày này
                  </p>
                </div>
              )}

              {selectedDateEvents.map(event => (
                <div 
                  key={event.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors",
                    event.status === 'live' && "border-red-500 bg-red-500/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {event.status === 'live' && (
                      <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                    )}
                    <span className="font-medium text-sm">{event.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.start_time.slice(0, 5)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event Editor Modal */}
      <EventEditorModal
        isOpen={showEventModal}
        onClose={handleCloseEventModal}
        editEvent={editingEvent}
      />

      {/* Delete Event Dialog */}
      <DeleteEventDialog
        event={deleteEvent}
        open={!!deleteEvent}
        onOpenChange={(open) => !open && setDeleteEvent(null)}
      />
    </MainLayout>
  );
};

export default Calendar;
