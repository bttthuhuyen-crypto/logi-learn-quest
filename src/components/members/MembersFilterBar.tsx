import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MemberFilters } from '@/hooks/useCommunityMembers';

interface MembersFilterBarProps {
  filters: MemberFilters;
  onFilterChange: (key: keyof MemberFilters, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const MembersFilterBar: React.FC<MembersFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Role Filter */}
      <Select
        value={filters.role || 'all'}
        onValueChange={(value) => onFilterChange('role', value)}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder={t.members.allRoles} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.members.allRoles}</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">{t.members.filterRoleAdmin}</SelectItem>
          <SelectItem value="moderator">{t.members.filterRoleModerator}</SelectItem>
          <SelectItem value="member">{t.members.filterRoleMember}</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => onFilterChange('status', value)}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder={t.members.allStatus} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.members.allStatus}</SelectItem>
          <SelectItem value="online">{t.members.filterOnline}</SelectItem>
          <SelectItem value="away">{t.members.filterAway}</SelectItem>
          <SelectItem value="offline">{t.members.filterOffline}</SelectItem>
        </SelectContent>
      </Select>

      {/* Level Filter */}
      <Select
        value={filters.levelRange || 'all'}
        onValueChange={(value) => onFilterChange('levelRange', value)}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder={t.members.allLevels} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.members.allLevels}</SelectItem>
          <SelectItem value="1-3">{t.members.filterLevel13}</SelectItem>
          <SelectItem value="4-6">{t.members.filterLevel46}</SelectItem>
          <SelectItem value="7-9">{t.members.filterLevel79}</SelectItem>
        </SelectContent>
      </Select>

      {/* Joined Filter */}
      <Select
        value={filters.joinedPeriod || 'all'}
        onValueChange={(value) => onFilterChange('joinedPeriod', value)}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder={t.members.allJoined} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.members.allJoined}</SelectItem>
          <SelectItem value="week">{t.members.filterJoinedWeek}</SelectItem>
          <SelectItem value="month">{t.members.filterJoinedMonth}</SelectItem>
          <SelectItem value="3months">{t.members.filterJoined3Months}</SelectItem>
          <SelectItem value="6months">{t.members.filterJoined6Months}</SelectItem>
          <SelectItem value="year">{t.members.filterJoinedYear}</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={filters.sortBy || 'recent'}
        onValueChange={(value) => onFilterChange('sortBy', value)}
      >
        <SelectTrigger className="w-[170px] h-9">
          <SelectValue placeholder={t.members.sortRecent} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">{t.members.sortRecent}</SelectItem>
          <SelectItem value="newest">{t.members.sortNewest}</SelectItem>
          <SelectItem value="level">{t.members.sortLevel}</SelectItem>
          <SelectItem value="name">{t.members.sortName}</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          {t.members.clearFilters}
        </Button>
      )}
    </div>
  );
};
