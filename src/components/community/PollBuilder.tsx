import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Plus, GripVertical, BarChart3 } from 'lucide-react';

export interface PollData {
  question: string;
  options: string[];
  isMultipleChoice: boolean;
  endsAt: string | null;
}

interface PollBuilderProps {
  value: PollData;
  onChange: (data: PollData) => void;
  onRemove: () => void;
}

export const PollBuilder: React.FC<PollBuilderProps> = ({
  value,
  onChange,
  onRemove,
}) => {
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

  const setEndsAt = (date: string) => {
    onChange({ ...value, endsAt: date || null });
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="h-4 w-4 text-primary" />
          Tạo thăm dò ý kiến
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

      {/* Question */}
      <div className="space-y-2">
        <Label htmlFor="poll-question">Câu hỏi</Label>
        <Input
          id="poll-question"
          placeholder="Nhập câu hỏi thăm dò..."
          value={value.question}
          onChange={(e) => updateQuestion(e.target.value)}
          maxLength={200}
        />
      </div>

      {/* Options */}
      <div className="space-y-2">
        <Label>Các lựa chọn</Label>
        <div className="space-y-2">
          {value.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
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
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeOption(index)}
                >
                  <X className="h-4 w-4" />
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
      </div>

      {/* Settings */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-border">
        <div className="flex items-center space-x-2">
          <Switch
            id="multiple-choice"
            checked={value.isMultipleChoice}
            onCheckedChange={toggleMultipleChoice}
          />
          <Label htmlFor="multiple-choice" className="text-sm font-normal">
            Cho phép chọn nhiều
          </Label>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Label htmlFor="ends-at" className="text-sm font-normal whitespace-nowrap">
            Kết thúc:
          </Label>
          <Input
            id="ends-at"
            type="datetime-local"
            value={value.endsAt || ''}
            onChange={(e) => setEndsAt(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};
