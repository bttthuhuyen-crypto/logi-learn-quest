import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VolumeX, UserMinus, Ban, AlertTriangle, Volume2 } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberManagement, type CommunityRole, type MuteDuration } from '@/hooks/useMemberManagement';
import { MuteUserModal } from './MuteUserModal';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import { BanMemberDialog } from './BanMemberDialog';
import { LevelBadge } from '@/components/community/LevelBadge';

interface MemberProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  level?: number | null;
  points?: number | null;
  email?: string;
  joined_at?: string;
  last_active_at?: string | null;
  role?: CommunityRole;
  status?: string;
  has_billing_access?: boolean | null;
}

interface MemberSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberProfile;
  onUpdate?: () => void;
}

export function MemberSettingsModal({
  open,
  onOpenChange,
  member,
  onUpdate,
}: MemberSettingsModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<CommunityRole>(member.role || 'member');
  const [hasBillingAccess, setHasBillingAccess] = useState(member.has_billing_access || false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    activityStats,
    isLoadingStats,
    memberData,
    isLoadingMember,
    updateRole,
    toggleBillingAccess,
    muteUser,
    unmuteUser,
    removeFromCommunity,
    banPermanently,
  } = useMemberManagement({ userId: member.user_id });

  // Update local state when member data changes
  useEffect(() => {
    if (memberData) {
      setSelectedRole(memberData.role as CommunityRole);
      setHasBillingAccess(memberData.has_billing_access || false);
    }
  }, [memberData]);

  // Track changes
  useEffect(() => {
    const roleChanged = selectedRole !== (memberData?.role || member.role || 'member');
    const billingChanged = hasBillingAccess !== (memberData?.has_billing_access || false);
    setHasChanges(roleChanged || billingChanged);
  }, [selectedRole, hasBillingAccess, memberData, member.role]);

  const memberName = member.full_name || t.common.anonymous;
  const isMuted = memberData?.status === 'muted';

  const handleSave = async () => {
    try {
      const currentRole = memberData?.role || member.role || 'member';
      const currentBilling = memberData?.has_billing_access || false;

      if (selectedRole !== currentRole) {
        await updateRole.mutateAsync({ role: selectedRole });
      }
      if (hasBillingAccess !== currentBilling) {
        await toggleBillingAccess.mutateAsync({ hasBillingAccess });
      }
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving member settings:', error);
    }
  };

  const handleMute = async (duration: MuteDuration) => {
    await muteUser.mutateAsync({ duration });
    setShowMuteModal(false);
    onUpdate?.();
  };

  const handleUnmute = async () => {
    await unmuteUser.mutateAsync();
    onUpdate?.();
  };

  const handleRemove = async () => {
    await removeFromCommunity.mutateAsync();
    setShowRemoveDialog(false);
    onUpdate?.();
    onOpenChange(false);
  };

  const handleBan = async (reason?: string) => {
    if (!user?.id) return;
    await banPermanently.mutateAsync({
      email: member.email || '',
      reason,
      bannedBy: user.id,
    });
    setShowBanDialog(false);
    onUpdate?.();
    onOpenChange(false);
  };

  const roles: { value: CommunityRole; label: string; description: string }[] = [
    { value: 'member', label: t.memberSettings.roleMember, description: t.memberSettings.roleMemberDesc },
    { value: 'moderator', label: t.memberSettings.roleModerator, description: t.memberSettings.roleModeratorDesc },
    { value: 'admin', label: t.memberSettings.roleAdmin, description: t.memberSettings.roleAdminDesc },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.memberSettings.title}</DialogTitle>
          </DialogHeader>

          {/* Header with Avatar */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-14 w-14">
              <AvatarImage src={member.avatar_url || undefined} alt={memberName} />
              <AvatarFallback>{memberName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{memberName}</span>
                {isMuted && (
                  <Badge variant="secondary" className="text-xs">
                    <VolumeX className="h-3 w-3 mr-1" />
                    Muted
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LevelBadge level={member.level || 1} size="sm" />
                <span>•</span>
                <span>{(member.points || 0).toLocaleString()} {t.memberProfile.points}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Role Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              {t.memberSettings.roleSection}
            </h3>
            <RadioGroup
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as CommunityRole)}
              className="space-y-2"
            >
              {roles.map((role) => (
                <div
                  key={role.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={role.value} id={role.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={role.value} className="font-medium cursor-pointer">
                      {role.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {hasChanges && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4" />
                {t.memberSettings.roleWarning}
              </div>
            )}
          </div>

          {/* Billing Access (only for admin role) */}
          {selectedRole === 'admin' && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                  {t.memberSettings.billingAccess}
                </h3>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="billing-access"
                    checked={hasBillingAccess}
                    onCheckedChange={(checked) => setHasBillingAccess(checked === true)}
                  />
                  <Label htmlFor="billing-access" className="cursor-pointer">
                    {t.memberSettings.billingAccessLabel}
                  </Label>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              {t.memberSettings.actionsSection}
            </h3>
            <div className="flex flex-wrap gap-2">
              {isMuted ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnmute}
                  disabled={unmuteUser.isPending}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {t.memberSettings.unmuteUser}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMuteModal(true)}
                >
                  <VolumeX className="h-4 w-4 mr-2" />
                  {t.memberSettings.muteUser}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRemoveDialog(true)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                {t.memberSettings.removeFromCommunity}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBanDialog(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Ban className="h-4 w-4 mr-2" />
                {t.memberSettings.banPermanently}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Membership Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              {t.memberSettings.membershipInfo}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t.memberSettings.joinedDate}:</span>
                <span className="ml-2 font-medium">
                  {memberData?.joined_at || member.joined_at
                    ? format(new Date(memberData?.joined_at || member.joined_at!), 'dd/MM/yyyy')
                    : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.memberSettings.lastActive}:</span>
                <span className="ml-2 font-medium">
                  {memberData?.last_active_at || member.last_active_at
                    ? format(new Date(memberData?.last_active_at || member.last_active_at!), 'dd/MM/yyyy HH:mm')
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Summary */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              {t.memberSettings.activitySummary}
            </h3>
            {isLoadingStats ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{activityStats?.posts || 0}</div>
                  <div className="text-xs text-muted-foreground">{t.memberSettings.postsCount}</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{activityStats?.comments || 0}</div>
                  <div className="text-xs text-muted-foreground">{t.memberSettings.commentsCount}</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{activityStats?.likesReceived || 0}</div>
                  <div className="text-xs text-muted-foreground">{t.memberSettings.likesReceived}</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || updateRole.isPending || toggleBillingAccess.isPending}>
              {updateRole.isPending || toggleBillingAccess.isPending ? t.common.loading : t.common.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <MuteUserModal
        open={showMuteModal}
        onOpenChange={setShowMuteModal}
        memberName={memberName}
        onConfirm={handleMute}
        isLoading={muteUser.isPending}
      />
      <RemoveMemberDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        memberName={memberName}
        onConfirm={handleRemove}
        isLoading={removeFromCommunity.isPending}
      />
      <BanMemberDialog
        open={showBanDialog}
        onOpenChange={setShowBanDialog}
        memberName={memberName}
        onConfirm={handleBan}
        isLoading={banPermanently.isPending}
      />
    </>
  );
}
