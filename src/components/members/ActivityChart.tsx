import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScreenSize } from '@/hooks/use-screen-size';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ActivityChartProps {
  userId: string;
  months?: number;
  className?: string;
}

interface DayData {
  date: string;
  count: number;
  level: number;
}

const CELL_SIZE = 11;
const CELL_GAP = 2;
const LABEL_WIDTH = 28;
const HEADER_HEIGHT = 16;

// Grayscale colors based on activity count
const LEVEL_COLORS = [
  '#ebedf0', // 0: no activity (lightest)
  '#c6c6c6', // 1-2
  '#8c8c8c', // 3-5
  '#4a4a4a', // 6-10
  '#1a1a1a', // 10+ (darkest)
];

const getLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
};

const useActivityChartData = (userId: string, months: number) => {
  return useQuery({
    queryKey: ['activity-chart', userId, months],
    queryFn: async (): Promise<DayData[]> => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      startDate.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_activities')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching activity chart data:', error);
        return [];
      }

      // Group by date
      const countsByDate: Record<string, number> = {};
      (data || []).forEach((item) => {
        const date = item.created_at.split('T')[0];
        countsByDate[date] = (countsByDate[date] || 0) + 1;
      });

      // Generate all days in the period
      const days: DayData[] = [];
      const today = new Date();
      const current = new Date(startDate);

      while (current <= today) {
        const dateStr = current.toISOString().split('T')[0];
        const count = countsByDate[dateStr] || 0;
        days.push({
          date: dateStr,
          count,
          level: getLevel(count),
        });
        current.setDate(current.getDate() + 1);
      }

      return days;
    },
    enabled: !!userId,
  });
};

export const ActivityChart: React.FC<ActivityChartProps> = ({
  userId,
  months = 12,
  className,
}) => {
  const { t, formatDate } = useLanguage();
  const { isMobile, isTablet } = useScreenSize();

  // Responsive months
  const visibleMonths = useMemo(() => {
    if (isMobile) return 3;
    if (isTablet) return 6;
    return months;
  }, [isMobile, isTablet, months]);

  const { data: activities = [], isLoading } = useActivityChartData(userId, visibleMonths);

  // Organize data into weeks (columns) with days (rows)
  const { weeks, monthLabels, dayLabels } = useMemo(() => {
    if (activities.length === 0) {
      return { weeks: [], monthLabels: [], dayLabels: [] };
    }

    // Vietnamese day labels (short)
    const dayLabelsVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayLabelsEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const localDayLabels = t.common.loading === 'Đang tải...' ? dayLabelsVi : dayLabelsEn;

    // Month labels
    const monthLabelsVi = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const monthLabelsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const localMonthLabels = t.common.loading === 'Đang tải...' ? monthLabelsVi : monthLabelsEn;

    // Group activities into weeks
    const weeksData: DayData[][] = [];
    let currentWeek: DayData[] = [];

    // Fill in empty days at the start of the first week
    if (activities.length > 0) {
      const firstDate = new Date(activities[0].date);
      const firstDayOfWeek = firstDate.getDay();
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: '', count: 0, level: -1 }); // -1 means empty cell
      }
    }

    activities.forEach((day) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);
    });

    // Push the last week
    if (currentWeek.length > 0) {
      weeksData.push(currentWeek);
    }

    // Calculate month labels with positions
    const monthPositions: { text: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    activities.forEach((day, index) => {
      const date = new Date(day.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        // Find which week this day belongs to
        let weekIndex = 0;
        let dayCount = 0;
        const firstDate = new Date(activities[0].date);
        const firstDayOfWeek = firstDate.getDay();
        dayCount = firstDayOfWeek; // Account for empty cells

        for (let i = 0; i < index; i++) {
          dayCount++;
          if (dayCount % 7 === 0) {
            weekIndex++;
          }
        }

        monthPositions.push({
          text: localMonthLabels[month],
          weekIndex,
        });
        lastMonth = month;
      }
    });

    return {
      weeks: weeksData,
      monthLabels: monthPositions,
      dayLabels: localDayLabels,
    };
  }, [activities, t.common.loading]);

  const getTooltipText = (day: DayData) => {
    if (day.count === 0) {
      return t.memberProfile.noActivities.replace('Chưa có hoạt động nào', 'Không có hoạt động').replace('No activities yet', 'No activity');
    }
    return t.memberProfile.activityTooltip
      .replace('{count}', String(day.count))
      .replace('{date}', formatDate(day.date));
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const totalWidth = LABEL_WIDTH + weeks.length * (CELL_SIZE + CELL_GAP);
  const totalHeight = HEADER_HEIGHT + 7 * (CELL_SIZE + CELL_GAP);

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('overflow-x-auto', className)}>
        <svg 
          width={totalWidth} 
          height={totalHeight}
          className="block"
        >
          {/* Month labels */}
          <g className="month-labels">
            {monthLabels.map((label, idx) => (
              <text
                key={idx}
                x={LABEL_WIDTH + label.weekIndex * (CELL_SIZE + CELL_GAP)}
                y={10}
                className="text-[10px] fill-muted-foreground"
                style={{ fontSize: '10px' }}
              >
                {label.text}
              </text>
            ))}
          </g>

          {/* Day labels (show Mon, Wed, Fri) */}
          <g className="day-labels">
            {[1, 3, 5].map((dayIdx) => (
              <text
                key={dayIdx}
                x={0}
                y={HEADER_HEIGHT + dayIdx * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
                className="text-[10px] fill-muted-foreground"
                style={{ fontSize: '10px' }}
              >
                {dayLabels[dayIdx]}
              </text>
            ))}
          </g>

          {/* Activity cells */}
          <g className="activity-cells">
            {weeks.map((week, weekIdx) =>
              week.map((day, dayIdx) => {
                if (day.level === -1) return null; // Empty cell

                const x = LABEL_WIDTH + weekIdx * (CELL_SIZE + CELL_GAP);
                const y = HEADER_HEIGHT + dayIdx * (CELL_SIZE + CELL_GAP);

                return (
                  <Tooltip key={`${weekIdx}-${dayIdx}`}>
                    <TooltipTrigger asChild>
                      <rect
                        x={x}
                        y={y}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        rx={2}
                        fill={LEVEL_COLORS[day.level]}
                        className="cursor-pointer transition-all hover:ring-1 hover:ring-foreground/50"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {getTooltipText(day)}
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
          </g>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
          <span>{t.memberProfile.less}</span>
          {LEVEL_COLORS.map((color, idx) => (
            <div
              key={idx}
              className="w-[11px] h-[11px] rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <span>{t.memberProfile.more}</span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ActivityChart;
