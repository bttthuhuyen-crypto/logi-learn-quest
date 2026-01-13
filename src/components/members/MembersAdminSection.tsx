import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { MemberCard } from './MemberCard';
import { useAdminMembers } from '@/hooks/useCommunityMembers';
import { Skeleton } from '@/components/ui/skeleton';

interface MembersAdminSectionProps {
  viewMode: 'grid' | 'list';
}

export const MembersAdminSection: React.FC<MembersAdminSectionProps> = ({ viewMode }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const { data: admins, isLoading } = useAdminMembers();

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!admins || admins.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-8">
      <CollapsibleTrigger className="flex items-center gap-2 w-full group">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t.members.admins} ({admins.length})
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {admins.map(admin => (
              <MemberCard key={admin.user_id} member={admin} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {admins.map(admin => (
              <MemberCard key={admin.user_id} member={admin} viewMode={viewMode} />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
