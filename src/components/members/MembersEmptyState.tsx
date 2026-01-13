import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Users, X } from 'lucide-react';

interface MembersEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const MembersEmptyState: React.FC<MembersEmptyStateProps> = ({
  hasActiveFilters,
  onClearFilters,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{t.members.noMembersFound}</h3>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-4 gap-1"
        >
          <X className="h-4 w-4" />
          {t.members.clearFilters}
        </Button>
      )}
    </div>
  );
};
