import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortOption } from '@/hooks/usePosts';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Mặc định' },
  { value: 'new', label: 'Mới nhất' },
  { value: 'top_week', label: 'Top tuần' },
  { value: 'top_month', label: 'Top tháng' },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] h-9">
        <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
