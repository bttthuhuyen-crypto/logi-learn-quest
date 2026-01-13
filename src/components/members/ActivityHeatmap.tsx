import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ActivityDay } from '@/hooks/useMemberActivities';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfWeek, addDays, getDay } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface ActivityHeatmapProps {
  activities: ActivityDay[];
  isLoading?: boolean;
}

const CELL_SIZE = 12;
const CELL_GAP = 2;
const MONTHS_LABEL_HEIGHT = 20;
const DAYS_LABEL_WIDTH = 28;

const levelColors = [
  'bg-muted',
  'bg-green-200 dark:bg-green-900',
  'bg-green-300 dark:bg-green-700',
  'bg-green-400 dark:bg-green-500',
  'bg-green-500 dark:bg-green-400',
];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activities,
  isLoading,
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? vi : enUS;

  const { weeks, monthLabels } = useMemo(() => {
    if (!activities.length) return { weeks: [], monthLabels: [] };

    // Group activities by week
    const weeksMap: Map<string, ActivityDay[]> = new Map();
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    activities.forEach((day, index) => {
      const date = parseISO(day.date);
      const weekStart = format(startOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      
      if (!weeksMap.has(weekStart)) {
        weeksMap.set(weekStart, Array(7).fill(null));
        
        // Check if new month
        const month = date.getMonth();
        if (month !== lastMonth) {
          months.push({
            label: format(date, 'MMM', { locale }),
            weekIndex: weeksMap.size - 1,
          });
          lastMonth = month;
        }
      }

      const weekDays = weeksMap.get(weekStart)!;
      const dayOfWeek = getDay(date);
      weekDays[dayOfWeek] = day;
    });

    return {
      weeks: Array.from(weeksMap.values()),
      monthLabels: months,
    };
  }, [activities, locale]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-[120px] bg-muted rounded" />
      </div>
    );
  }

  const dayLabels = language === 'vi' 
    ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const totalWidth = DAYS_LABEL_WIDTH + weeks.length * (CELL_SIZE + CELL_GAP);
  const totalHeight = MONTHS_LABEL_HEIGHT + 7 * (CELL_SIZE + CELL_GAP);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto pb-2">
        <svg
          width={totalWidth}
          height={totalHeight}
          className="min-w-max"
        >
          {/* Month labels */}
          {monthLabels.map((month, idx) => (
            <text
              key={idx}
              x={DAYS_LABEL_WIDTH + month.weekIndex * (CELL_SIZE + CELL_GAP)}
              y={12}
              className="fill-muted-foreground text-[10px]"
            >
              {month.label}
            </text>
          ))}

          {/* Day labels */}
          {[1, 3, 5].map((dayIdx) => (
            <text
              key={dayIdx}
              x={0}
              y={MONTHS_LABEL_HEIGHT + dayIdx * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
              className="fill-muted-foreground text-[10px]"
            >
              {dayLabels[dayIdx]}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, weekIdx) => (
            <g key={weekIdx}>
              {week.map((day, dayIdx) => {
                if (!day) return null;
                
                const x = DAYS_LABEL_WIDTH + weekIdx * (CELL_SIZE + CELL_GAP);
                const y = MONTHS_LABEL_HEIGHT + dayIdx * (CELL_SIZE + CELL_GAP);
                
                const tooltipText = t.memberProfile.activityTooltip
                  .replace('{count}', String(day.count))
                  .replace('{date}', format(parseISO(day.date), 'dd/MM/yyyy'));

                return (
                  <Tooltip key={`${weekIdx}-${dayIdx}`}>
                    <TooltipTrigger asChild>
                      <rect
                        x={x}
                        y={y}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        rx={2}
                        className={cn(
                          levelColors[day.level],
                          "transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {tooltipText}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
          <span>{t.memberProfile.less}</span>
          {levelColors.map((color, idx) => (
            <div
              key={idx}
              className={cn("w-3 h-3 rounded-sm", color)}
            />
          ))}
          <span>{t.memberProfile.more}</span>
        </div>
      </div>
    </TooltipProvider>
  );
};
