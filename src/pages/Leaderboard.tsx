import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Trophy } from 'lucide-react';
import { MyProgressCard } from '@/components/leaderboard/MyProgressCard';
import { LevelRewardsPreview } from '@/components/leaderboard/LevelRewardsPreview';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { LevelRewardsModal } from '@/components/leaderboard/LevelRewardsModal';
import { useMyProgress } from '@/hooks/useMyProgress';
import { useLevelConfig } from '@/hooks/useLevelConfig';

const Leaderboard = () => {
  const { t } = useLanguage();
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  // TODO: Get actual community ID from context when multi-community is implemented
  const communityId = undefined;

  const { data: levelConfigData, isLoading: isConfigLoading } = useLevelConfig(communityId);
  const { data: myProgress, isLoading: isProgressLoading } = useMyProgress(
    communityId,
    levelConfigData?.config
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t.leaderboard.title}</h1>
            <p className="text-muted-foreground">{t.leaderboard.subtitle}</p>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress & Rewards */}
          <div className="lg:col-span-1 space-y-6">
            <MyProgressCard
              progress={myProgress}
              isLoading={isProgressLoading}
            />
            <LevelRewardsPreview
              currentLevel={myProgress?.level || 1}
              levelConfig={levelConfigData?.config}
              rewards={levelConfigData?.rewards}
              isLoading={isConfigLoading}
              onViewDetails={() => setShowRewardsModal(true)}
            />
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-2">
            <LeaderboardList
              communityId={communityId}
              levelConfig={levelConfigData?.config}
            />
          </div>
        </div>
      </div>

      {/* Rewards Modal */}
      <LevelRewardsModal
        open={showRewardsModal}
        onOpenChange={setShowRewardsModal}
        currentLevel={myProgress?.level || 1}
        levelConfig={levelConfigData?.config}
        rewards={levelConfigData?.rewards}
      />
    </MainLayout>
  );
};

export default Leaderboard;
