import React, { useState, useEffect } from 'react';
import { Trophy, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LevelBadge } from '@/components/community/LevelBadge';
import { LevelRewardEditor } from './LevelRewardEditor';
import { useLevelConfigAdmin, LevelRewardAdmin } from '@/hooks/useLevelConfigAdmin';
import { useCourses } from '@/hooks/useCourses';
import { DEFAULT_LEVEL_CONFIG } from '@/utils/levelConfig';
import { useLanguage } from '@/i18n/LanguageContext';

interface FormState {
  enabled: boolean;
  levelNames: Record<number, string>;
  rewards: LevelRewardAdmin[];
}

export const AdminGamification: React.FC = () => {
  const { language } = useLanguage();
  const { data, isLoading, save, isSaving } = useLevelConfigAdmin();
  const { courses } = useCourses();

  const [formState, setFormState] = useState<FormState>({
    enabled: false,
    levelNames: { ...DEFAULT_LEVEL_CONFIG.levelNames },
    rewards: [],
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form state from fetched data
  useEffect(() => {
    if (data) {
      setFormState({
        enabled: data.enabled,
        levelNames: { ...DEFAULT_LEVEL_CONFIG.levelNames, ...data.levelNames },
        rewards: data.rewards,
      });
      setHasChanges(false);
    }
  }, [data]);

  const handleEnabledChange = (enabled: boolean) => {
    setFormState(prev => ({ ...prev, enabled }));
    setHasChanges(true);
  };

  const handleLevelNameChange = (level: number, name: string) => {
    if (name.length > 30) return;
    setFormState(prev => ({
      ...prev,
      levelNames: { ...prev.levelNames, [level]: name },
    }));
    setHasChanges(true);
    
    // Clear error if fixed
    if (level === 1 && name.trim()) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.level1;
        return next;
      });
    }
  };

  const handleAddReward = (level: number) => {
    const newReward: LevelRewardAdmin = {
      level,
      rewardType: 'course_unlock',
      rewardValue: null,
      description: null,
    };
    setFormState(prev => ({
      ...prev,
      rewards: [...prev.rewards, newReward],
    }));
    setHasChanges(true);
  };

  const handleRewardChange = (index: number, reward: LevelRewardAdmin) => {
    setFormState(prev => ({
      ...prev,
      rewards: prev.rewards.map((r, i) => (i === index ? reward : r)),
    }));
    setHasChanges(true);
  };

  const handleDeleteReward = (index: number) => {
    setFormState(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formState.levelNames[1]?.trim()) {
      newErrors.level1 = language === 'vi' 
        ? 'Tên Level 1 không được để trống' 
        : 'Level 1 name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    save(formState);
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (data) {
      setFormState({
        enabled: data.enabled,
        levelNames: { ...DEFAULT_LEVEL_CONFIG.levelNames, ...data.levelNames },
        rewards: data.rewards,
      });
      setHasChanges(false);
      setErrors({});
    }
  };

  const getRewardsForLevel = (level: number) => {
    return formState.rewards
      .map((r, index) => ({ ...r, index }))
      .filter(r => r.level === level);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">
          {language === 'vi' ? 'Cài đặt Gamification' : 'Gamification Settings'}
        </h1>
      </div>

      {/* Enable/Disable Section */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="gamification-enabled" className="text-base font-medium">
              {language === 'vi' ? 'Bật hệ thống Gamification' : 'Enable Gamification System'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {language === 'vi' 
                ? 'Quản lý cấp độ, điểm số và phần thưởng cho thành viên' 
                : 'Manage levels, points and rewards for members'}
            </p>
          </div>
          <Switch
            id="gamification-enabled"
            checked={formState.enabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>

        {!formState.enabled && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {language === 'vi'
                ? 'Khi tắt, Leaderboard sẽ ẩn khỏi menu và hệ thống điểm sẽ không hoạt động.'
                : 'When disabled, Leaderboard will be hidden and the point system will not work.'}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator className="my-6" />

      {/* Level Names Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">
          {language === 'vi' ? 'Tên cấp độ tùy chỉnh' : 'Custom Level Names'}
        </h2>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
            const levelRewards = getRewardsForLevel(level);
            const points = DEFAULT_LEVEL_CONFIG.pointsRequired[level];

            return (
              <div key={level} className="space-y-1">
                {/* Level Row */}
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-muted-foreground">
                    Level {level}
                  </span>
                  <Input
                    value={formState.levelNames[level] || ''}
                    onChange={e => handleLevelNameChange(level, e.target.value)}
                    placeholder={DEFAULT_LEVEL_CONFIG.levelNames[level]}
                    className={`w-40 ${errors.level1 && level === 1 ? 'border-destructive' : ''}`}
                    maxLength={30}
                  />
                  <LevelBadge level={level} size="md" />
                  <span className="text-sm text-muted-foreground">
                    {points.toLocaleString()} {language === 'vi' ? 'điểm' : 'pts'}
                  </span>
                  {level >= 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddReward(level)}
                      className="ml-auto text-primary"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {language === 'vi' ? 'Thêm reward' : 'Add reward'}
                    </Button>
                  )}
                </div>

                {/* Error message */}
                {level === 1 && errors.level1 && (
                  <p className="text-sm text-destructive pl-[76px]">{errors.level1}</p>
                )}

                {/* Rewards for this level */}
                {levelRewards.map(reward => (
                  <LevelRewardEditor
                    key={reward.id || `new-${reward.index}`}
                    reward={reward}
                    courses={courses}
                    onChange={updated => handleRewardChange(reward.index, updated)}
                    onDelete={() => handleDeleteReward(reward.index)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Points Preview Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">
          {language === 'vi' ? 'Bảng điểm cấp độ' : 'Level Points Table'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'vi'
            ? 'Điểm được tính tự động dựa trên số like nhận được. Bảng này chỉ để tham khảo.'
            : 'Points are calculated automatically based on likes received. This table is for reference only.'}
        </p>
        <div className="grid grid-cols-3 gap-2 max-w-md">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
            <div
              key={level}
              className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50"
            >
              <span className="text-sm font-medium">Lv.{level}</span>
              <span className="text-sm text-muted-foreground">
                {DEFAULT_LEVEL_CONFIG.pointsRequired[level].toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!hasChanges || isSaving}
        >
          {language === 'vi' ? 'Hủy' : 'Cancel'}
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {language === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
