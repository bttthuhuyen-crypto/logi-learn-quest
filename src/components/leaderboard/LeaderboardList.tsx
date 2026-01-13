import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Trophy, Loader2, Users } from 'lucide-react';
import { useLeaderboard, LeaderboardPeriod } from '@/hooks/useLeaderboard';
import { LeaderboardItem } from './LeaderboardItem';
import { useLanguage } from '@/i18n/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { LevelConfig } from '@/utils/levelConfig';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LeaderboardListProps {
  communityId?: string;
  levelConfig?: LevelConfig | null;
}

export interface LeaderboardListRef {
  scrollToUser: (userId: string, period: LeaderboardPeriod) => void;
  setPeriod: (period: LeaderboardPeriod) => void;
}

export const LeaderboardList = forwardRef<LeaderboardListRef, LeaderboardListProps>(
  function LeaderboardList({ communityId, levelConfig }, ref) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    
    const periodParam = searchParams.get('period') as LeaderboardPeriod | null;
    const [period, setPeriod] = useState<LeaderboardPeriod>(periodParam || '7d');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [highlightUserId, setHighlightUserId] = useState<string | null>(null);
    
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      scrollToUser: (userId: string, targetPeriod: LeaderboardPeriod) => {
        // Switch period if needed
        if (targetPeriod !== period) {
          setPeriod(targetPeriod);
        }
        
        // Clear search to show full list
        setSearchQuery('');
        
        // Highlight and scroll after data loads
        setTimeout(() => {
          setHighlightUserId(userId);
          const element = itemRefs.current.get(userId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // Clear highlight after animation
          setTimeout(() => setHighlightUserId(null), 2000);
        }, 500);
      },
      setPeriod: (targetPeriod: LeaderboardPeriod) => {
        setPeriod(targetPeriod);
      },
    }));

    // Update URL when period changes
    useEffect(() => {
      setSearchParams({ period });
    }, [period, setSearchParams]);

    // Reset page when search or period changes
    useEffect(() => {
      setPage(1);
    }, [debouncedSearch, period]);

    const { data, isLoading, isFetching } = useLeaderboard({
      period,
      communityId,
      page,
      pageSize: 20,
      search: debouncedSearch,
      levelConfig,
    });

    const handlePeriodChange = (value: string) => {
      setPeriod(value as LeaderboardPeriod);
    };

    const handleLoadMore = () => {
      setPage((p) => p + 1);
    };

    // Register item refs
    const setItemRef = (userId: string, element: HTMLDivElement | null) => {
      if (element) {
        itemRefs.current.set(userId, element);
      } else {
        itemRefs.current.delete(userId);
      }
    };

    return (
      <Card className="h-full" ref={containerRef}>
        <CardHeader className="pb-4 sticky top-0 bg-card z-10 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {t.leaderboard.title}
            </CardTitle>

            {/* Period Tabs */}
            <Tabs value={period} onValueChange={handlePeriodChange}>
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="7d" className="text-xs sm:text-sm">
                  {t.leaderboard.last7Days}
                </TabsTrigger>
                <TabsTrigger value="30d" className="text-xs sm:text-sm">
                  {t.leaderboard.last30Days}
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  {t.leaderboard.allTime}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.leaderboard.searchPlaceholder || 'Tìm kiếm thành viên...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && data?.entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {t.leaderboard.noResults || 'Không tìm thấy thành viên nào'}
              </p>
            </div>
          )}

          {/* Leaderboard Entries */}
          {!isLoading && data?.entries.map((entry) => (
            <div
              key={entry.userId}
              ref={(el) => setItemRef(entry.userId, el)}
              className={cn(
                'transition-all duration-500',
                highlightUserId === entry.userId && 'ring-2 ring-primary ring-offset-2 rounded-xl'
              )}
            >
              <LeaderboardItem 
                entry={entry} 
                isCurrentUser={entry.userId === user?.id}
              />
            </div>
          ))}

          {/* Load More */}
          {!isLoading && data?.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isFetching}
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.common.loading}
                  </>
                ) : (
                  t.leaderboard.loadMore || 'Xem thêm'
                )}
              </Button>
            </div>
          )}

          {/* Total count */}
          {!isLoading && data && data.totalCount > 0 && (
            <p className="text-center text-sm text-muted-foreground pt-2">
              Hiển thị {data.entries.length} / {data.totalCount} thành viên
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);
