import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DiscoverSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DiscoverSearchBar({ value, onChange, placeholder = 'Tìm kiếm cộng đồng...' }: DiscoverSearchBarProps) {
  return (
    <div className="relative max-w-lg mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 h-12 text-base rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
      />
    </div>
  );
}
