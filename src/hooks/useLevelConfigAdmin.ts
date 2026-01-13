import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_LEVEL_CONFIG, LevelConfig } from '@/utils/levelConfig';
import { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

// Fixed community ID for single-community setup
const DEFAULT_COMMUNITY_ID = '00000000-0000-0000-0000-000000000001';

export interface LevelRewardAdmin {
  id?: string;
  level: number;
  rewardType: 'course_unlock' | 'chat_access' | 'badge' | 'custom';
  rewardValue: string | null;
  description: string | null;
}

interface LevelConfigAdminData {
  enabled: boolean;
  levelNames: Record<number, string>;
  rewards: LevelRewardAdmin[];
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

async function getOrCreateCommunity(): Promise<string> {
  // Check if default community exists
  const { data: existing } = await supabase
    .from('communities')
    .select('id')
    .eq('id', DEFAULT_COMMUNITY_ID)
    .single();

  if (existing) return existing.id;

  // Get current user for owner_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  // Create default community
  const { data: newCommunity, error } = await supabase
    .from('communities')
    .insert({
      id: DEFAULT_COMMUNITY_ID,
      name: 'Default Community',
      slug: 'default',
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return newCommunity.id;
}

export function useLevelConfigAdmin() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['level-config-admin'],
    queryFn: async (): Promise<LevelConfigAdminData> => {
      const communityId = await getOrCreateCommunity();

      // Fetch level config
      const { data: configData } = await supabase
        .from('level_configs')
        .select('*')
        .eq('community_id', communityId)
        .single();

      let enabled = false;
      let levelNames: Record<number, string> = { ...DEFAULT_LEVEL_CONFIG.levelNames };

      if (configData) {
        enabled = configData.enabled ?? false;
        const parsedNames = parseJsonToRecord(configData.level_names);
        if (parsedNames) {
          levelNames = parsedNames as Record<number, string>;
        }
      }

      // Fetch rewards
      const { data: rewardsData } = await supabase
        .from('level_rewards')
        .select('*')
        .eq('community_id', communityId)
        .order('level', { ascending: true });

      const rewards: LevelRewardAdmin[] = (rewardsData || []).map(r => ({
        id: r.id,
        level: r.level,
        rewardType: r.reward_type as LevelRewardAdmin['rewardType'],
        rewardValue: r.reward_value,
        description: r.description,
      }));

      return { enabled, levelNames, rewards };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: LevelConfigAdminData) => {
      const communityId = await getOrCreateCommunity();

      // Upsert level_configs
      const { error: configError } = await supabase
        .from('level_configs')
        .upsert({
          community_id: communityId,
          enabled: data.enabled,
          level_names: data.levelNames as unknown as Json,
          points_required: DEFAULT_LEVEL_CONFIG.pointsRequired as unknown as Json,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'community_id' });

      if (configError) throw configError;

      // Get existing reward IDs
      const existingIds = data.rewards.filter(r => r.id).map(r => r.id);

      // Delete removed rewards
      if (existingIds.length > 0) {
        await supabase
          .from('level_rewards')
          .delete()
          .eq('community_id', communityId)
          .not('id', 'in', `(${existingIds.join(',')})`);
      } else {
        // Delete all if no existing IDs
        await supabase
          .from('level_rewards')
          .delete()
          .eq('community_id', communityId);
      }

      // Upsert rewards
      for (const reward of data.rewards) {
        if (reward.id) {
          await supabase
            .from('level_rewards')
            .update({
              level: reward.level,
              reward_type: reward.rewardType,
              reward_value: reward.rewardValue,
              description: reward.description,
            })
            .eq('id', reward.id);
        } else {
          await supabase
            .from('level_rewards')
            .insert({
              community_id: communityId,
              level: reward.level,
              reward_type: reward.rewardType,
              reward_value: reward.rewardValue,
              description: reward.description,
            });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['level-config-admin'] });
      queryClient.invalidateQueries({ queryKey: ['level-config'] });
      toast({
        title: 'Đã lưu cài đặt',
        description: 'Cài đặt gamification đã được lưu thành công.',
      });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}
