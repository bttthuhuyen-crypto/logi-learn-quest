import React from 'react';
import { ActivityHeatmap } from './ActivityHeatmap';
import { useMemberActivityHeatmap } from '@/hooks/useMemberActivities';

interface UserActivityHeatmapProps {
  userId: string;
}

/**
 * Wrapper component that fetches activity data for a specific user
 * and passes it to ActivityHeatmap
 */
export const UserActivityHeatmap: React.FC<UserActivityHeatmapProps> = ({ userId }) => {
  const { data: activities, isLoading } = useMemberActivityHeatmap(userId);

  return <ActivityHeatmap activities={activities || []} isLoading={isLoading} />;
};
