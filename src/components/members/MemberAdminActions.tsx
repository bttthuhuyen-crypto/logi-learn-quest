import React from 'react';
import { Settings, Calendar, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberProfile } from '@/hooks/useMemberProfile';
import { useLanguage } from '@/i18n/LanguageContext';
import { format, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface MemberAdminActionsProps {
  member: MemberProfile;
  onOpenSettings?: () => void;
}

export const MemberAdminActions: React.FC<MemberAdminActionsProps> = ({
  member,
  onOpenSettings,
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? vi : enUS;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm', { locale });
  };

  return (
    <Card className="mt-6 border-dashed border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            {t.memberProfile.adminSection}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {t.memberProfile.adminSettings}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">{t.memberProfile.memberSince}</p>
            <p className="text-sm font-medium">{formatDate(member.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">{t.memberProfile.lastActive}</p>
            <p className="text-sm font-medium">{formatDate(member.last_seen_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t.memberProfile.role}</p>
            <Badge variant="secondary" className="mt-1">
              {member.role || 'member'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t.memberProfile.status}</p>
            <Badge 
              variant={member.presence_status === 'online' ? 'default' : 'secondary'}
              className="mt-1"
            >
              {member.presence_status || 'offline'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
