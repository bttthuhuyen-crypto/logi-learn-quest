import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberProfileHeader } from '@/components/members/MemberProfileHeader';
import { MemberActivityFeed } from '@/components/members/MemberActivityFeed';
import { MemberPostsTab } from '@/components/members/MemberPostsTab';
import { MemberFollowersTab } from '@/components/members/MemberFollowersTab';
import { MemberFollowingTab } from '@/components/members/MemberFollowingTab';
import { MemberCommentsTab } from '@/components/members/MemberCommentsTab';
import { MemberAdminActions } from '@/components/members/MemberAdminActions';
import { MyProgressCard } from '@/components/leaderboard/MyProgressCard';
import { BadgesCard } from '@/components/gamification/BadgesCard';
import { UserActivityHeatmap } from '@/components/members/UserActivityHeatmap';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useMemberActivities } from '@/hooks/useMemberActivities';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useIsFollowing, useToggleFollow } from '@/hooks/useUserFollows';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/i18n/LanguageContext';
import { Award } from 'lucide-react';
import { LevelBadge } from '@/components/community/LevelBadge';
import { useLevelConfig } from '@/hooks/useLevelConfig';

const MemberProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const activeTab = searchParams.get('tab') || 'activity';

  const { data: member, isLoading: isLoadingProfile } = useMemberProfile(userId);
  const { data: progress, isLoading: isLoadingProgress } = useUserProgress(userId);
  const { data: levelConfig, isLoading: isLoadingLevelConfig } = useLevelConfig();
  const {
    data: activitiesData, 
    isLoading: isLoadingActivities,
    hasNextPage,
    fetchNextPage,
  } = useMemberActivities(userId);
  const { data: isFollowing } = useIsFollowing(userId);
  const toggleFollow = useToggleFollow();

  const isOwnProfile = user?.id === userId;

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleFollow = () => {
    if (!userId) return;
    toggleFollow.mutate({ targetUserId: userId, isFollowing: isFollowing || false });
  };

  const allActivities = activitiesData?.pages.flatMap(page => page.data) || [];

  // Get all level numbers for badges display
  const levelNumbers = levelConfig?.config?.pointsRequired 
    ? Object.keys(levelConfig.config.pointsRequired).map(Number).sort((a, b) => a - b)
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (isLoadingProfile) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!member) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.memberProfile.notFound}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8">
        {/* LEFT COLUMN (8/12): Profile Info & Tabs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Section */}
          <MemberProfileHeader
            member={member}
            isFollowing={isFollowing || false}
            isFollowLoading={toggleFollow.isPending}
            onFollow={handleFollow}
            isOwnProfile={isOwnProfile}
          />

          {/* Tabs - Skool Style */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-6 md:gap-8">
              <TabsTrigger 
                value="activity"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 pt-0 text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                {t.memberProfile.tabActivity}
              </TabsTrigger>
              <TabsTrigger 
                value="posts"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 pt-0 text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                {t.memberProfile.tabPosts}
              </TabsTrigger>
              <TabsTrigger 
                value="comments"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 pt-0 text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                Bình luận
              </TabsTrigger>
              <TabsTrigger 
                value="followers"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 pt-0 text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                {t.memberProfile.tabFollowers}
              </TabsTrigger>
              <TabsTrigger 
                value="following"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 pt-0 text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                {t.memberProfile.tabFollowing}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <MemberActivityFeed
                activities={allActivities}
                isLoading={isLoadingActivities}
                hasMore={hasNextPage}
                onLoadMore={() => fetchNextPage()}
              />
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <MemberPostsTab userId={userId!} />
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <MemberCommentsTab userId={userId!} />
            </TabsContent>

            <TabsContent value="followers" className="mt-6">
              <MemberFollowersTab userId={userId!} />
            </TabsContent>

            <TabsContent value="following" className="mt-6">
              <MemberFollowingTab userId={userId!} />
            </TabsContent>
          </Tabs>

          {/* Admin Actions */}
          {isAdmin && !isOwnProfile && (
            <MemberAdminActions member={member} />
          )}
        </div>

        {/* RIGHT COLUMN (4/12): Gamification Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Progress Card */}
          <MyProgressCard 
            progress={progress || undefined}
            isLoading={isLoadingProgress}
            variant="compact"
          />
          
          {/* Badges Card */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4" />
                Huy hiệu Logistics đạt được
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {isLoadingLevelConfig ? (
                <div className="grid grid-cols-5 gap-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full" />
                  ))}
                </div>
              ) : levelNumbers.length > 0 ? (
                <div className="grid grid-cols-5 gap-3">
                  {levelNumbers.map((lvl) => (
                    <div 
                      key={lvl} 
                      className={`flex items-center justify-center transition-all ${
                        lvl <= (member?.level || 1) 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-40 grayscale scale-90'
                      }`}
                    >
                      <LevelBadge level={lvl} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có huy hiệu
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Activity Heatmap */}
          <UserActivityHeatmap userId={userId!} />
        </div>
      </div>
    </MainLayout>
  );
};

export default MemberProfile;
