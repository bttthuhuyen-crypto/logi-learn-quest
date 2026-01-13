import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMonthEvents, Event } from '@/hooks/useEvents';

interface CalendarGridProps {
  onSelectDate: (date: Date, events: Pick<Event, 'id' | 'title' | 'start_date' | 'start_time' | 'status' | 'location_type'>[]) => void;
  selectedDate: Date | null;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: events = [], isLoading } = useMonthEvents(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.start_date === dateStr);
  };

  const renderDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const currentDay = day;
      const dayEvents = getEventsForDate(currentDay);
      const isCurrentMonth = isSameMonth(currentDay, currentMonth);
      const isToday = isSameDay(currentDay, new Date());
      const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
      const hasLiveEvent = dayEvents.some(e => e.status === 'live');

      days.push(
        <button
          key={day.toString()}
          onClick={() => onSelectDate(currentDay, dayEvents)}
          className={cn(
            "relative aspect-square flex flex-col items-center justify-center rounded-lg transition-colors",
            "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50",
            !isCurrentMonth && "text-muted-foreground/50",
            isToday && "bg-primary/10 font-semibold",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
            hasLiveEvent && !isSelected && "ring-2 ring-red-500"
          )}
        >
          <span className={cn(
            "text-sm",
            isSelected && "text-primary-foreground"
          )}>
            {format(currentDay, 'd')}
          </span>
          
          {/* Event indicators */}
          {dayEvents.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {dayEvents.slice(0, 3).map((event, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    event.status === 'live' ? "bg-red-500" : 
                    isSelected ? "bg-primary-foreground/70" : "bg-primary"
                  )}
                />
              ))}
              {dayEvents.length > 3 && (
                <span className={cn(
                  "text-[8px]",
                  isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  +{dayEvents.length - 3}
                </span>
              )}
            </div>
          )}
        </button>
      );
      day = addDays(day, 1);
    }

    return days;
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy', { locale: vi })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {isLoading ? (
          Array(35).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
          ))
        ) : (
          renderDays()
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Có sự kiện</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-red-500" />
          <span>Đang live</span>
        </div>
      </div>
    </div>
  );
};
