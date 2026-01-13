import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, GripVertical, BarChart3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PollDuration = 'none' | '1d' | '3d' | '1w';

export interface PollData {
  question: string;
  options: string[];
  isMultipleChoice: boolean;
  endsAt: string | null;
  duration: PollDuration;
}

interface PollBuilderProps {
  value: PollData;
  onChange: (data: PollData) => void;
  onRemove: () => void;
}

const DURATION_OPTIONS: { value: PollDuration; label: string }[] = [
  { value: 'none', label: 'Không giới hạn' },
  { value: '1d', label: '1 ngày' },
  { value: '3d', label: '3 ngày' },
  { value: '1w', label: '1 tuần' },
];

export const calculateEndsAt = (duration: PollDuration): string | null => {
  if (duration === 'none') return null;
  const now = new Date();
  if (duration === '1d') now.setDate(now.getDate() + 1);
  if (duration === '3d') now.setDate(now.getDate() + 3);
  if (duration === '1w') now.setDate(now.getDate() + 7);
  return now.toISOString();
};

export const PollBuilder: React.FC<PollBuilderProps> = ({
  value,
  onChange,
  onRemove,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateQuestion = (question: string) => {
    onChange({ ...value, question });
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...value.options];
    newOptions[index] = text;
    onChange({ ...value, options: newOptions });
  };

  const addOption = () => {
    if (value.options.length < 10) {
      onChange({ ...value, options: [...value.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (value.options.length > 2) {
      const newOptions = value.options.filter((_, i) => i !== index);
      onChange({ ...value, options: newOptions });
    }
  };

  const toggleMultipleChoice = (checked: boolean) => {
    onChange({ ...value, isMultipleChoice: checked });
  };

  const setDuration = (duration: PollDuration) => {
    const endsAt = calculateEndsAt(duration);
    onChange({ ...value, duration, endsAt });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOptions = [...value.options];
    const draggedItem = newOptions[draggedIndex];
    newOptions.splice(draggedIndex, 1);
    newOptions.splice(index, 0, draggedItem);

    onChange({ ...value, options: newOptions });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const isQuestionEmpty = value.question.trim() === '';

  return (
    <div className="border border-border rounded-lg bg-muted/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="h-4 w-4 text-primary" />
          Tạo Poll
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Question */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="poll-question">
              Câu hỏi <span className="text-destructive">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {value.question.length}/200
            </span>
          </div>
          <Input
            id="poll-question"
            placeholder="Nhập câu hỏi..."
            value={value.question}
            onChange={(e) => updateQuestion(e.target.value)}
            maxLength={200}
            className={cn(
              isQuestionEmpty && 'border-destructive/50 focus-visible:ring-destructive/50'
            )}
          />
        </div>

        {/* Options */}
        <div className="space-y-2">
          <Label>Lựa chọn</Label>
          <div className="space-y-2">
            {value.options.map((option, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex items-center gap-2 transition-all duration-150',
                  draggedIndex === index && 'opacity-50',
                  dragOverIndex === index && 'translate-y-1'
                )}
              >
                <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  placeholder={`Lựa chọn ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  maxLength={100}
                  className="flex-1"
                />
                {value.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {value.options.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={addOption}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm lựa chọn
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            Tối thiểu 2, tối đa 10 lựa chọn
          </p>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Switch
              id="multiple-choice"
              checked={value.isMultipleChoice}
              onCheckedChange={toggleMultipleChoice}
            />
            <Label htmlFor="multiple-choice" className="text-sm font-normal cursor-pointer">
              Cho phép chọn nhiều đáp án
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-sm font-normal whitespace-nowrap">
              Thời hạn
            </Label>
            <Select value={value.duration} onValueChange={(val) => setDuration(val as PollDuration)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn thời hạn" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
