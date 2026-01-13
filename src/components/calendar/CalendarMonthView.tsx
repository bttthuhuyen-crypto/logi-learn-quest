import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  setMonth,
  setYear,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronDown, Video, Presentation, MapPin, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useMonthEvents, Event, EventLocationType, EventStatus } from '@/hooks/useEvents';

interface EventSummary {
  id: string;
  title: string;
  start_date: string;
  start_time: string;
  status: EventStatus;
  location_type: EventLocationType | null;
}

interface CalendarMonthViewProps {
  onSelectDate?: (date: Date, events: EventSummary[]) => void;
  onSelectEvent?: (eventId: string) => void;
  selectedDate?: Date | null;
}

const locationIcons: Record<string, React.ReactNode> = {
  skool_call: <Video className="h-3 w-3" />,
  skool_webinar: <Presentation className="h-3 w-3" />,
  zoom: <Video className="h-3 w-3" />,
  google_meet: <Video className="h-3 w-3" />,
  in_person: <MapPin className="h-3 w-3" />,
  other: <Link className="h-3 w-3" />,
};

const months = [
  'Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
  'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'
];

const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Event Chip Component
interface EventChipProps {
  event: EventSummary;
  onClick: (e: React.MouseEvent) => void;
}

const EventChip: React.FC<EventChipProps> = ({ event, onClick }) => {
  const isLive = event.status === 'live';
  const icon = locationIcons[event.location_type || 'other'];

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded truncate cursor-pointer",
        "hover:opacity-80 transition-opacity",
        isLive
          ? "bg-red-500 text-white font-medium"
          : "bg-primary/10 text-primary hover:bg-primary/20"
      )}
    >
      {isLive && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
      )}
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{event.title}</span>
    </div>
  );
};

// Day Cell Component
interface DayCellProps {
  date: Date;
  events: EventSummary[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
  onEventClick: (eventId: string) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  events,
  isCurrentMonth,
  isToday,
  isSelected,
  onClick,
  onEventClick,
}) => {
  const visibleEvents = events.slice(0, 3);
  const remainingCount = events.length - 3;
  const isSunday = date.getDay() === 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "min-h-[100px] p-1.5 border-r border-b cursor-pointer transition-colors",
        "hover:bg-accent/50",
        !isCurrentMonth && "bg-muted/30 text-muted-foreground",
        isToday && "bg-primary/5",
        isSelected && "ring-2 ring-primary ring-inset"
      )}
    >
      {/* Day Number */}
      <div
        className={cn(
          "text-sm font-medium mb-1",
          isToday && "text-primary font-bold",
          isSunday && isCurrentMonth && "text-red-500"
        )}
      >
        {format(date, 'd')}
      </div>

      {/* Event Chips */}
      <div className="space-y-0.5">
        {visibleEvents.map((event) => (
          <EventChip
            key={event.id}
            event={event}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event.id);
            }}
          />
        ))}

        {remainingCount > 0 && (
          <div className="text-xs text-muted-foreground px-1 font-medium">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
};

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  onSelectDate,
  onSelectEvent,
  selectedDate,
}) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const { data: events = [], isLoading } = useMonthEvents(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = gridStart;
    while (day <= gridEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventSummary[]> = {};
    events.forEach((event) => {
      const dateKey = event.start_date;
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(event as EventSummary);
    });
    return map;
  }, [events]);

  const getEventsForDate = (date: Date): EventSummary[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateStr] || [];
  };

  // Navigation handlers
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onSelectDate?.(today, getEventsForDate(today));
  };

  const selectMonth = (monthIndex: number) => {
    const newDate = setMonth(setYear(currentMonth, pickerYear), monthIndex);
    setCurrentMonth(newDate);
    setShowMonthPicker(false);
  };

  const handleDateClick = (date: Date) => {
    onSelectDate?.(date, getEventsForDate(date));
  };

  const handleEventClick = (eventId: string) => {
    onSelectEvent?.(eventId);
    navigate(`/calendar/event/${eventId}`);
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Month/Year Picker */}
          <Popover open={showMonthPicker} onOpenChange={setShowMonthPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="gap-1 font-semibold text-base">
                {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
              {/* Year Navigator */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPickerYear((y) => y - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold">{pickerYear}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPickerYear((y) => y + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Month Grid - 4x3 */}
              <div className="grid grid-cols-4 gap-2">
                {months.map((month, index) => {
                  const isCurrentSelection =
                    index === currentMonth.getMonth() &&
                    pickerYear === currentMonth.getFullYear();
                  return (
                    <Button
                      key={month}
                      variant={isCurrentSelection ? 'default' : 'ghost'}
                      size="sm"
                      className="h-9"
                      onClick={() => selectMonth(index)}
                    >
                      {month}
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Today Button */}
        <Button variant="outline" size="sm" onClick={goToToday}>
          Hôm nay
        </Button>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center py-2 text-sm font-medium text-muted-foreground",
              index === 0 && "text-red-500"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {isLoading
          ? Array(35)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="min-h-[100px] p-1.5 border-r border-b bg-muted/30 animate-pulse"
                />
              ))
          : calendarDays.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth_ = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

              return (
                <DayCell
                  key={day.toISOString()}
                  date={day}
                  events={dayEvents}
                  isCurrentMonth={isCurrentMonth_}
                  isToday={isToday}
                  isSelected={isSelected}
                  onClick={() => handleDateClick(day)}
                  onEventClick={handleEventClick}
                />
              );
            })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary/10 border border-primary/20" />
          <span>Có sự kiện</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500" />
          <span>Đang live</span>
        </div>
      </div>
    </div>
  );
};
