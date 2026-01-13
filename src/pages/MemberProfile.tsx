import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberProfileHeader } from '@/components/members/MemberProfileHeader';
import { MemberStatsSection } from '@/components/members/MemberStatsSection';
import { ActivityHeatmap } from '@/components/members/ActivityHeatmap';
import { MemberActivityFeed } from '@/components/members/MemberActivityFeed';
import { MemberPostsTab } from '@/components/members/MemberPostsTab';
import { MemberFollowersTab } from '@/components/members/MemberFollowersTab';
import { MemberFollowingTab } from '@/components/members/MemberFollowingTab';
import { MemberAdminActions } from '@/components/members/MemberAdminActions';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useMemberStats } from '@/hooks/useMemberStats';
import { useMemberActivities, useMemberActivityHeatmap } from '@/hooks/useMemberActivities';
import { useIsFollowing, useToggleFollow } from '@/hooks/useUserFollows';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/i18n/LanguageContext';
import { Activity } from 'lucide-react';

const MemberProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const activeTab = searchParams.get('tab') || 'activity';

  const { data: member, isLoading: isLoadingProfile } = useMemberProfile(userId);
  const { data: stats, isLoading: isLoadingStats } = useMemberStats(userId);
  const { data: heatmapData, isLoading: isLoadingHeatmap } = useMemberActivityHeatmap(userId);
  const { 
    data: activitiesData, 
    isLoading: isLoadingActivities,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
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

  if (isLoadingProfile) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-24 mb-4" />
          <Skeleton className="h-40 w-full rounded-xl mb-4" />
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!member) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.memberProfile.notFound}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <MemberProfileHeader
          member={member}
          isFollowing={isFollowing || false}
          isFollowLoading={toggleFollow.isPending}
          onFollow={handleFollow}
          isOwnProfile={isOwnProfile}
        />

        {/* Stats Section */}
        <MemberStatsSection
          stats={stats || { postsCount: 0, followersCount: 0, followingCount: 0, points: 0 }}
          onTabChange={handleTabChange}
        />

        {/* Activity Heatmap */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              {t.memberProfile.activityTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap 
              activities={heatmapData || []} 
              isLoading={isLoadingHeatmap}
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="activity">{t.memberProfile.tabActivity}</TabsTrigger>
            <TabsTrigger value="posts">{t.memberProfile.tabPosts}</TabsTrigger>
            <TabsTrigger value="followers">{t.memberProfile.tabFollowers}</TabsTrigger>
            <TabsTrigger value="following">{t.memberProfile.tabFollowing}</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="activity" className="mt-0">
              <MemberActivityFeed
                activities={allActivities}
                isLoading={isLoadingActivities}
                hasMore={hasNextPage}
                onLoadMore={() => fetchNextPage()}
              />
            </TabsContent>

            <TabsContent value="posts" className="mt-0">
              <MemberPostsTab userId={userId!} />
            </TabsContent>

            <TabsContent value="followers" className="mt-0">
              <MemberFollowersTab userId={userId!} />
            </TabsContent>

            <TabsContent value="following" className="mt-0">
              <MemberFollowingTab userId={userId!} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Admin Actions */}
        {isAdmin && !isOwnProfile && (
          <MemberAdminActions member={member} />
        )}
      </div>
    </MainLayout>
  );
};

export default MemberProfile;
