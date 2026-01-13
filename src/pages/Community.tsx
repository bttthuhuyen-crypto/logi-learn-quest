import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostComposer } from '@/components/community/PostComposer';
import { CategoryChips } from '@/components/community/CategoryChips';
import { SortDropdown } from '@/components/community/SortDropdown';
import { PinnedPosts } from '@/components/community/PinnedPosts';
import { PostsList } from '@/components/community/PostsList';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { UpcomingEvents } from '@/components/community/sidebar/UpcomingEvents';
import { LeaderboardWidget } from '@/components/community/sidebar/LeaderboardWidget';
import { NewMembersWidget } from '@/components/community/sidebar/NewMembersWidget';
import { CommunityStats } from '@/components/community/sidebar/CommunityStats';
import { useUserPostLikes, SortOption } from '@/hooks/usePosts';
import { usePinnedPosts } from '@/hooks/usePosts';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Community = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    // Persist sort selection in session
    const saved = sessionStorage.getItem('community-sort');
    return (saved as SortOption) || 'default';
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<'text' | 'poll'>('text');

  // Get pinned posts for like status
  const { data: pinnedPosts } = usePinnedPosts(selectedCategoryId);
  const pinnedPostIds = pinnedPosts?.map((p) => p.id) || [];
  const { data: likedPinnedPostIds = [] } = useUserPostLikes(pinnedPostIds);

  // Persist sort option
  useEffect(() => {
    sessionStorage.setItem('community-sort', sortOption);
  }, [sortOption]);

  const handleOpenCreateModal = (type: 'text' | 'poll' = 'text') => {
    setCreateModalType(type);
    setIsCreateModalOpen(true);
  };

  const handleOpenPost = (postId: string) => {
    // TODO: Navigate to post detail or open modal
    console.log('Open post:', postId);
  };

  const Sidebar = () => (
    <div className="space-y-6">
      <UpcomingEvents />
      <LeaderboardWidget />
      <NewMembersWidget />
      <CommunityStats />
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Column - Main Content (70%) */}
          <div className="flex-1 min-w-0 lg:max-w-[70%] space-y-6">
            {/* Post Composer */}
            <PostComposer onOpenModal={handleOpenCreateModal} />

            {/* Category Chips & Sort */}
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <CategoryChips
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={setSelectedCategoryId}
                />
              </div>
              <SortDropdown value={sortOption} onChange={setSortOption} />
            </div>

            {/* Pinned Posts */}
            <PinnedPosts
              categoryId={selectedCategoryId}
              likedPostIds={likedPinnedPostIds}
              onOpenPost={handleOpenPost}
            />

            {/* Regular Posts List */}
            <PostsList
              categoryId={selectedCategoryId}
              sort={sortOption}
              onOpenPost={handleOpenPost}
            />
          </div>

          {/* Right Column - Sidebar (30%) - Desktop only */}
          <aside className="hidden lg:block w-[30%] max-w-[320px] flex-shrink-0">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </aside>
        </div>

        {/* Mobile Sidebar Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden z-50"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] overflow-y-auto">
            <div className="pt-6">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultType={createModalType}
      />
    </MainLayout>
  );
};

export default Community;
