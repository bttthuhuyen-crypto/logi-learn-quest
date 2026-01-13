import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_LEVEL_CONFIG, LevelConfig } from '@/utils/levelConfig';
import { Json } from '@/integrations/supabase/types';

interface LevelReward {
  id: string;
  level: number;
  rewardType: 'course_unlock' | 'chat_access' | 'badge' | 'custom';
  rewardValue: string | null;
  description: string | null;
}

interface LevelConfigData {
  config: LevelConfig;
  rewards: LevelReward[];
}

function parseJsonToRecord(json: Json | null): Record<number, string | number> | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
  
  const result: Record<number, string | number> = {};
  for (const [key, value] of Object.entries(json)) {
    const numKey = parseInt(key, 10);
    if (!isNaN(numKey) && (typeof value === 'string' || typeof value === 'number')) {
      result[numKey] = value;
    }
  }
  return result;
}

export function useLevelConfig(communityId?: string) {
  return useQuery({
    queryKey: ['level-config', communityId],
    queryFn: async (): Promise<LevelConfigData> => {
      // Fetch level config
      let config: LevelConfig = DEFAULT_LEVEL_CONFIG;
      
      if (communityId) {
        const { data: configData } = await supabase
          .from('level_configs')
          .select('*')
          .eq('community_id', communityId)
          .single();

        if (configData && configData.enabled) {
          const levelNames = parseJsonToRecord(configData.level_names);
          const pointsRequired = parseJsonToRecord(configData.points_required);
          
          config = {
            levelNames: (levelNames as Record<number, string>) || DEFAULT_LEVEL_CONFIG.levelNames,
            pointsRequired: (pointsRequired as Record<number, number>) || DEFAULT_LEVEL_CONFIG.pointsRequired,
          };
        }
      }

      // Fetch rewards
      let rewards: LevelReward[] = [];
      
      if (communityId) {
        const { data: rewardsData } = await supabase
          .from('level_rewards')
          .select('*')
          .eq('community_id', communityId)
          .order('level', { ascending: true });

        if (rewardsData) {
          rewards = rewardsData.map(r => ({
            id: r.id,
            level: r.level,
            rewardType: r.reward_type as LevelReward['rewardType'],
            rewardValue: r.reward_value,
            description: r.description,
          }));
        }
      }

      return { config, rewards };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
