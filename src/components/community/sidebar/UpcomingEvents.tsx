import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export const UpcomingEvents: React.FC = () => {
  // Placeholder data - will be connected to events table later
  const events = [
    {
      id: '1',
      title: 'Workshop: Xây dựng thương hiệu cá nhân',
      date: '15 Th1',
      time: '19:00',
    },
    {
      id: '2',
      title: 'Q&A Session với Expert',
      date: '20 Th1',
      time: '20:00',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Sự kiện sắp tới</h3>
      </div>
      
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Không có sự kiện nào
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="group p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-foreground">
                {event.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
