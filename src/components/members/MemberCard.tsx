import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LevelBadge } from '@/components/community/LevelBadge';
import { MemberData } from '@/hooks/useCommunityMembers';
import { useLanguage } from '@/i18n/LanguageContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { MemberSettingsModal } from './MemberSettingsModal';
import { cn } from '@/lib/utils';
import { Crown, Shield, ShieldCheck, Building2, Settings } from 'lucide-react';

interface MemberCardProps {
  member: MemberData;
  viewMode: 'grid' | 'list';
}

const getRoleBadge = (role: string | null) => {
  switch (role) {
    case 'owner':
      return { icon: Crown, label: 'Owner', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    case 'admin':
      return { icon: ShieldCheck, label: 'Admin', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    case 'moderator':
      return { icon: Shield, label: 'Mod', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
    default:
      return null;
  }
};

const isOnlineRecently = (lastSeenAt: string | null, showStatus: boolean | null): boolean => {
  if (!showStatus || !lastSeenAt) return false;
  const lastSeen = new Date(lastSeenAt);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return lastSeen > fiveMinutesAgo;
};

const getStatusColor = (status: string | null, lastSeenAt: string | null, showStatus: boolean | null) => {
  if (!showStatus) return null;
  if (status === 'online' && isOnlineRecently(lastSeenAt, showStatus)) return 'bg-green-500';
  if (status === 'away') return 'bg-yellow-500';
  return null;
};

export const MemberCard: React.FC<MemberCardProps> = ({ member, viewMode }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const roleBadge = getRoleBadge(member.role);
  const statusColor = getStatusColor(member.presence_status, member.last_seen_at, member.show_online_status);
  const isOwnProfile = user?.id === member.user_id;
  const canManage = isAdmin && !isOwnProfile;

  const handleClick = () => {
    navigate(`/profile/${member.user_id}`);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSettingsModal(true);
  };

  if (viewMode === 'list') {
    return (
      <>
        <div 
          onClick={handleClick}
          className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || ''} />
              <AvatarFallback>{member.full_name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            {statusColor && (
              <span className={cn(
                "absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full",
                statusColor
              )} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium truncate">{member.full_name || t.common.anonymous}</p>
              {roleBadge && (
                <Badge variant="outline" className={cn("text-xs gap-1", roleBadge.className)}>
                  <roleBadge.icon className="h-3 w-3" />
                  {roleBadge.label}
                </Badge>
              )}
              <LevelBadge level={member.level || 1} />
            </div>
            {member.bio && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">{member.bio}</p>
            )}
            {(member.position || member.company) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Building2 className="h-3 w-3" />
                <span className="truncate">
                  {member.position}{member.position && member.company && ' @ '}{member.company}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {member.points || 0} {t.common.points}
            </span>
            {canManage && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSettingsClick}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {showSettingsModal && (
          <MemberSettingsModal
            open={showSettingsModal}
            onOpenChange={setShowSettingsModal}
            member={{
              user_id: member.user_id,
              full_name: member.full_name,
              avatar_url: member.avatar_url,
              level: member.level,
              points: member.points,
              role: member.role as any,
            }}
          />
        )}
      </>
    );
  }

  // Grid view
  return (
    <>
      <div 
        onClick={handleClick}
        className="border rounded-lg p-4 hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer relative group"
      >
        {canManage && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleSettingsClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || ''} />
              <AvatarFallback>{member.full_name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            {statusColor && (
              <span className={cn(
                "absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full",
                statusColor
              )} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm truncate">{member.full_name || t.common.anonymous}</p>
              <LevelBadge level={member.level || 1} />
            </div>
            
            {roleBadge && (
              <Badge variant="outline" className={cn("text-xs gap-1 mt-1", roleBadge.className)}>
                <roleBadge.icon className="h-3 w-3" />
                {roleBadge.label}
              </Badge>
            )}
          </div>
        </div>

        {member.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-3">{member.bio}</p>
        )}

        {(member.position || member.company) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {member.position}{member.position && member.company && ' @ '}{member.company}
            </span>
          </div>
        )}
      </div>
      
      {showSettingsModal && (
        <MemberSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          member={{
            user_id: member.user_id,
            full_name: member.full_name,
            avatar_url: member.avatar_url,
            level: member.level,
            points: member.points,
            role: member.role as any,
          }}
        />
      )}
    </>
  );
};
