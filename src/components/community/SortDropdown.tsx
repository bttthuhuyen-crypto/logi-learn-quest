import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortOption } from '@/hooks/usePosts';
import { ArrowUpDown, Users } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const sortOptions: { value: SortOption; label: string; icon?: React.ReactNode; requiresAuth?: boolean }[] = [
    { value: 'default', label: t.follow?.sortDefault || 'Mặc định' },
    { value: 'new', label: t.follow?.sortNew || 'Mới nhất' },
    { value: 'top_week', label: t.follow?.sortTopWeek || 'Top tuần' },
    { value: 'top_month', label: t.follow?.sortTopMonth || 'Top tháng' },
    { value: 'following', label: t.follow?.filterFollowing || 'Từ người theo dõi', icon: <Users className="h-3.5 w-3.5 mr-1.5" />, requiresAuth: true },
  ];

  // Filter out auth-required options if not logged in
  const availableOptions = sortOptions.filter(option => !option.requiresAuth || user);

  const selectedOption = availableOptions.find(opt => opt.value === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] h-9">
        <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
        <SelectValue>{selectedOption?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center">
              {option.icon}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
