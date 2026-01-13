import React, { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useMyProgress } from '@/hooks/useMyProgress';
import { useLevelConfig } from '@/hooks/useLevelConfig';
import { LeaderboardList, LeaderboardListRef } from '@/components/leaderboard/LeaderboardList';
import { MyProgressCard } from '@/components/leaderboard/MyProgressCard';
import { LevelRewardsPreview } from '@/components/leaderboard/LevelRewardsPreview';
import { LevelRewardsModal } from '@/components/leaderboard/LevelRewardsModal';
import { useAuth } from '@/contexts/AuthContext';

// Hardcoded community ID for now
const COMMUNITY_ID = 'default-community';

export default function Leaderboard() {
  const { user } = useAuth();
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);
  const leaderboardRef = useRef<LeaderboardListRef>(null);
  
  const { data: levelConfigData, isLoading: isConfigLoading } = useLevelConfig(COMMUNITY_ID);
  const { data: myProgress, isLoading: isProgressLoading } = useMyProgress(
    COMMUNITY_ID,
    levelConfigData?.config
  );

  const handleRankClick = (period: '7d' | '30d' | 'all') => {
    if (user?.id && leaderboardRef.current) {
      leaderboardRef.current.setPeriod(period);
      setTimeout(() => {
        leaderboardRef.current?.scrollToUser(user.id, period);
      }, 100);
    }
  };

  const handleLevelClick = (level: number) => {
    setSelectedLevel(level);
    setShowRewardsModal(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowRewardsModal(open);
    if (!open) {
      setSelectedLevel(undefined);
    }
  };

  // Transform rewards for the components
  const transformedRewards = levelConfigData?.rewards?.map(r => ({
    level: r.level,
    rewardType: r.rewardType,
    description: r.description,
  }));

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* My Progress Card */}
        <MyProgressCard
          progress={myProgress}
          isLoading={isProgressLoading}
          onRankClick={handleRankClick}
        />

        {/* Level Rewards Preview */}
        <LevelRewardsPreview
          currentLevel={myProgress?.level || 1}
          levelConfig={levelConfigData?.config}
          rewards={transformedRewards}
          isLoading={isConfigLoading}
          onViewDetails={() => setShowRewardsModal(true)}
          onLevelClick={handleLevelClick}
        />

        {/* Leaderboard */}
        <LeaderboardList
          ref={leaderboardRef}
          communityId={COMMUNITY_ID}
        />
      </div>

      {/* Level Rewards Modal */}
      <LevelRewardsModal
        open={showRewardsModal}
        onOpenChange={handleModalOpenChange}
        currentLevel={myProgress?.level || 1}
        levelConfig={levelConfigData?.config}
        rewards={transformedRewards}
        scrollToLevel={selectedLevel}
      />
    </MainLayout>
  );
}
