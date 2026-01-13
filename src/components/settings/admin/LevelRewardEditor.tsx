import React from 'react';
import { BookOpen, MessageCircle, Award, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Course } from '@/hooks/useCourses';
import { LevelRewardAdmin } from '@/hooks/useLevelConfigAdmin';

interface LevelRewardEditorProps {
  reward: LevelRewardAdmin;
  courses: Course[];
  onChange: (reward: LevelRewardAdmin) => void;
  onDelete: () => void;
}

const REWARD_TYPE_ICONS = {
  course_unlock: BookOpen,
  chat_access: MessageCircle,
  badge: Award,
  custom: Pencil,
};

const REWARD_TYPE_LABELS = {
  course_unlock: 'Mở khóa khóa học',
  chat_access: 'Truy cập chat',
  badge: 'Huy hiệu',
  custom: 'Tùy chỉnh',
};

export const LevelRewardEditor: React.FC<LevelRewardEditorProps> = ({
  reward,
  courses,
  onChange,
  onDelete,
}) => {
  const Icon = REWARD_TYPE_ICONS[reward.rewardType];

  const handleTypeChange = (type: LevelRewardAdmin['rewardType']) => {
    let description = reward.description;
    let rewardValue = reward.rewardValue;

    // Reset values when type changes
    if (type === 'chat_access') {
      description = 'Mở khóa quyền chat với thành viên';
      rewardValue = null;
    } else if (type !== reward.rewardType) {
      rewardValue = null;
      description = null;
    }

    onChange({ ...reward, rewardType: type, rewardValue, description });
  };

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    onChange({
      ...reward,
      rewardValue: courseId,
      description: course ? `Mở khóa khóa học: ${course.title}` : null,
    });
  };

  return (
    <div className="flex items-center gap-2 pl-8 py-1.5">
      <span className="text-muted-foreground">└─</span>
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      <Select value={reward.rewardType} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[160px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(REWARD_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {reward.rewardType === 'course_unlock' && (
        <Select
          value={reward.rewardValue || ''}
          onValueChange={handleCourseChange}
        >
          <SelectTrigger className="flex-1 h-8">
            <SelectValue placeholder="Chọn khóa học..." />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {reward.rewardType === 'badge' && (
        <Input
          value={reward.rewardValue || ''}
          onChange={e => onChange({ ...reward, rewardValue: e.target.value })}
          placeholder="Tên huy hiệu..."
          className="flex-1 h-8"
          maxLength={30}
        />
      )}

      {reward.rewardType === 'custom' && (
        <Input
          value={reward.description || ''}
          onChange={e => onChange({ ...reward, description: e.target.value })}
          placeholder="Mô tả phần thưởng..."
          className="flex-1 h-8"
          maxLength={100}
        />
      )}

      {reward.rewardType === 'chat_access' && (
        <span className="text-sm text-muted-foreground flex-1">
          Mở khóa quyền chat với thành viên
        </span>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
