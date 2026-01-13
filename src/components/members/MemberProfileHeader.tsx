import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Linkedin, Facebook, Youtube, MessageCircle, UserPlus, UserMinus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LevelBadge } from '@/components/community/LevelBadge';
import { MemberProfile } from '@/hooks/useMemberProfile';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { Crown, Shield, ShieldCheck } from 'lucide-react';

interface MemberProfileHeaderProps {
  member: MemberProfile;
  isFollowing: boolean;
  isFollowLoading: boolean;
  onFollow: () => void;
  isOwnProfile: boolean;
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

const getStatusColor = (status: string | null) => {
  if (status === 'online') return 'bg-green-500';
  if (status === 'away') return 'bg-yellow-500';
  return null;
};

export const MemberProfileHeader: React.FC<MemberProfileHeaderProps> = ({
  member,
  isFollowing,
  isFollowLoading,
  onFollow,
  isOwnProfile,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const roleBadge = getRoleBadge(member.role);
  const statusColor = getStatusColor(member.presence_status);

  const handleMessage = () => {
    navigate('/messages', { state: { recipientId: member.user_id } });
  };

  const socialLinks = [
    { url: member.website_url, icon: Globe, label: 'Website' },
    { url: member.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
    { url: member.facebook_url, icon: Facebook, label: 'Facebook' },
    { url: member.youtube_url, icon: Youtube, label: 'YouTube' },
  ].filter(link => link.url);

  return (
    <div className="relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t.memberProfile.backButton}
      </Button>

      {/* Cover Background */}
      <div className="h-32 sm:h-40 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 rounded-t-xl" />

      {/* Profile Content */}
      <div className="relative px-4 sm:px-6 pb-6 -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || ''} />
              <AvatarFallback className="text-2xl">{member.full_name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            {statusColor && member.show_online_status && (
              <span className={cn(
                "absolute bottom-1 right-1 w-5 h-5 border-4 border-background rounded-full",
                statusColor
              )} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                {member.full_name || t.common.anonymous}
              </h1>
              <LevelBadge level={member.level || 1} />
              {roleBadge && (
                <Badge variant="outline" className={cn("gap-1", roleBadge.className)}>
                  <roleBadge.icon className="h-3 w-3" />
                  {roleBadge.label}
                </Badge>
              )}
            </div>

            {/* Position & Company */}
            {(member.position || member.company) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {member.position}{member.position && member.company && ' @ '}{member.company}
                </span>
              </div>
            )}

            {/* Bio */}
            {member.bio && (
              <p className="text-muted-foreground text-sm sm:text-base line-clamp-3">
                {member.bio}
              </p>
            )}

            {/* Location */}
            {member.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{member.location}</span>
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2">
                {socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                    title={link.label}
                  >
                    <link.icon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2 shrink-0 mt-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessage}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t.memberProfile.sendMessage}</span>
              </Button>
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={onFollow}
                disabled={isFollowLoading}
                className="gap-2"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.memberProfile.unfollow}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.memberProfile.follow}</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
