import React, { memo } from 'react';
import { UpcomingEventsWidget } from './UpcomingEventsWidget';
import { LeaderboardWidget } from './LeaderboardWidget';
import { NewMembersWidget } from './NewMembersWidget';
import { CommunityStatsWidget } from './CommunityStatsWidget';

const SidebarWidgetsComponent: React.FC = () => {
  return (
    <div className="space-y-6">
      <UpcomingEventsWidget />
      <LeaderboardWidget />
      <NewMembersWidget />
      <CommunityStatsWidget />
    </div>
  );
};

export const SidebarWidgets = memo(SidebarWidgetsComponent);
