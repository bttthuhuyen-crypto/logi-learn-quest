import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Leaderboard = () => {
  const { t, formatNumber } = useLanguage();

  const leaders = [
    { name: 'Nguyễn Văn A', points: 2500, level: 7 },
    { name: 'Trần Thị B', points: 1800, level: 6 },
    { name: 'Lê Văn C', points: 1200, level: 5 },
    { name: 'Phạm Thị D', points: 850, level: 4 },
    { name: 'Hoàng Văn E', points: 600, level: 4 },
  ];

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-medium">{rank}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t.leaderboard.title}</h1>
            <p className="text-muted-foreground">{t.leaderboard.subtitle}</p>
          </div>
        </div>

        <Tabs defaultValue="week">
          <TabsList className="mb-6">
            <TabsTrigger value="week">{t.leaderboard.last7Days}</TabsTrigger>
            <TabsTrigger value="month">{t.leaderboard.last30Days}</TabsTrigger>
            <TabsTrigger value="all">{t.leaderboard.allTime}</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-3">
            {leaders.map((leader, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  index < 3 ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <div className="w-8 flex justify-center">
                  {getMedalIcon(index + 1)}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{leader.name}</p>
                  <p className="text-sm text-muted-foreground">{t.common.level} {leader.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatNumber(leader.points)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {t.common.points}
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="month">
            <p className="text-center text-muted-foreground py-8">
              {t.leaderboard.data30Days}
            </p>
          </TabsContent>

          <TabsContent value="all">
            <p className="text-center text-muted-foreground py-8">
              {t.leaderboard.dataAllTime}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
