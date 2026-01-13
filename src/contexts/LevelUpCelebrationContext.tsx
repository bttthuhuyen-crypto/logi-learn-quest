import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LevelUpCelebrationModal, LevelReward } from '@/components/gamification/LevelUpCelebrationModal';
import { getLevelName } from '@/utils/levelConfig';
import { useLevelConfig } from '@/hooks/useLevelConfig';
import { useCreateNotification } from '@/hooks/useCreateNotification';
import { playLevelUpSound } from '@/utils/sounds';

interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  newLevelName: string;
  rewards: LevelReward[];
}

interface LevelUpCelebrationContextType {
  showCelebration: (data: LevelUpData) => void;
  dismissCelebration: () => void;
}

const LevelUpCelebrationContext = createContext<LevelUpCelebrationContextType | undefined>(undefined);

// Default community ID - should be fetched dynamically in production
const DEFAULT_COMMUNITY_ID = '00000000-0000-0000-0000-000000000001';

export function LevelUpCelebrationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [celebrationData, setCelebrationData] = useState<LevelUpData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const previousLevelRef = useRef<number | null>(null);
  const { data: levelConfig } = useLevelConfig(DEFAULT_COMMUNITY_ID);
  const { createNotificationAsync } = useCreateNotification();

  const showCelebration = useCallback((data: LevelUpData) => {
    setCelebrationData(data);
    setIsOpen(true);
    playLevelUpSound();
  }, []);

  const dismissCelebration = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation
    setTimeout(() => setCelebrationData(null), 300);
  }, []);

  // Fetch rewards for a specific level
  const fetchRewardsForLevel = useCallback(async (level: number): Promise<LevelReward[]> => {
    try {
      const { data, error } = await supabase
        .from('level_rewards')
        .select('id, reward_type, reward_value, description')
        .eq('community_id', DEFAULT_COMMUNITY_ID)
        .eq('level', level);

      if (error) throw error;

      return (data || []).map((r) => ({
        id: r.id,
        type: r.reward_type,
        value: r.reward_value,
        description: r.description,
      }));
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }
  }, []);

  // Handle level up
  const handleLevelUp = useCallback(
    async (oldLevel: number, newLevel: number) => {
      const newLevelName = getLevelName(newLevel, levelConfig?.config);
      const rewards = await fetchRewardsForLevel(newLevel);

      // Create in-app notification
      if (user?.id) {
        try {
          await createNotificationAsync({
            user_id: user.id,
            type: 'level_up',
            title: `🎉 Lên Level ${newLevel}!`,
            message: `Chúc mừng! Bạn đã đạt Level ${newLevel} - "${newLevelName}"`,
            data: {
              level: newLevel,
              level_name: newLevelName,
              reward_count: rewards.length,
            } as unknown as import('@/integrations/supabase/types').Json,
          });
        } catch (error) {
          console.error('Error creating level up notification:', error);
        }
      }

      showCelebration({
        oldLevel,
        newLevel,
        newLevelName,
        rewards,
      });
    },
    [levelConfig, fetchRewardsForLevel, showCelebration, user?.id, createNotificationAsync]
  );

  // Subscribe to realtime changes on community_members
  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial level
    const fetchInitialLevel = async () => {
      const { data } = await supabase
        .from('community_members')
        .select('level')
        .eq('user_id', user.id)
        .eq('community_id', DEFAULT_COMMUNITY_ID)
        .single();

      if (data) {
        previousLevelRef.current = data.level || 1;
      }
    };

    fetchInitialLevel();

    const channel = supabase
      .channel('level-up-detection')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_members',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newLevel = (payload.new as { level?: number })?.level || 1;
          const oldLevel = previousLevelRef.current || 1;

          if (newLevel > oldLevel) {
            // Level up detected!
            handleLevelUp(oldLevel, newLevel);
          }

          // Update ref
          previousLevelRef.current = newLevel;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, handleLevelUp]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dismissCelebration();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, dismissCelebration]);

  return (
    <LevelUpCelebrationContext.Provider value={{ showCelebration, dismissCelebration }}>
      {children}
      <LevelUpCelebrationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        newLevel={celebrationData?.newLevel || 1}
        newLevelName={celebrationData?.newLevelName || ''}
        rewards={celebrationData?.rewards || []}
      />
    </LevelUpCelebrationContext.Provider>
  );
}

export function useLevelUpCelebration() {
  const context = useContext(LevelUpCelebrationContext);
  if (context === undefined) {
    throw new Error('useLevelUpCelebration must be used within a LevelUpCelebrationProvider');
  }
  return context;
}
