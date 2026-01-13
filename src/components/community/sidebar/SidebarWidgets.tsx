import React from 'react';
import { UpcomingEventsWidget } from './UpcomingEventsWidget';
import { LeaderboardWidget } from './LeaderboardWidget';
import { NewMembersWidget } from './NewMembersWidget';
import { CommunityStatsWidget } from './CommunityStatsWidget';

export const SidebarWidgets: React.FC = () => {
  return (
    <div className="space-y-6">
      <UpcomingEventsWidget />
      <LeaderboardWidget />
      <NewMembersWidget />
      <CommunityStatsWidget />
    </div>
  );
};
