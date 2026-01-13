import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Calendar as CalendarIcon, Video, Clock } from 'lucide-react';

const Calendar = () => {
  const { language } = useLanguage();

  const upcomingEvents = [
    {
      title: language === 'vi' ? 'Webinar: Nghề Logistics 2026' : 'Webinar: Logistics Career 2026',
      date: '15/01/2026',
      time: '19:00 - 21:00',
    },
    {
      title: language === 'vi' ? 'Workshop: INCOTERMS 2020' : 'Workshop: INCOTERMS 2020',
      date: '22/01/2026',
      time: '14:00 - 17:00',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {language === 'vi' ? 'Lịch sự kiện' : 'Calendar'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'vi' 
              ? 'Theo dõi các sự kiện và webinar sắp tới'
              : 'Track upcoming events and webinars'}
          </p>
        </div>

        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="border rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Calendar;
