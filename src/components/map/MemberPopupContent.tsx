import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/community/LevelBadge";
import { StatusDot } from "./StatusDot";
import { DeleteLocationDialog } from "./DeleteLocationDialog";
import { ChangeLocationModal } from "./ChangeLocationModal";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFollow } from "@/hooks/useUserFollows";
import { useMyLocation } from "@/hooks/useMyLocation";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, UserPlus, UserCheck, User, RefreshCw, Trash2, MapPin } from "lucide-react";

export interface MemberPopupData {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  levelName?: string;
  isOnline?: boolean;
  bio?: string | null;
  displayName: string | null;
}

interface MemberPopupContentProps {
  member: MemberPopupData;
  isCurrentUser?: boolean;
}

export const MemberPopupContent = ({ 
  member, 
  isCurrentUser = false,
}: MemberPopupContentProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteLocation } = useMyLocation();
  const { isFollowing, toggle: toggleFollow, isLoading: isFollowLoading } = useFollow(member.userId);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  const handleChat = () => {
    navigate(`/messenger?user=${member.userId}`);
  };

  const handleFollow = () => {
    toggleFollow();
  };

  const handleViewProfile = () => {
    navigate(`/members/${member.userId}`);
  };

  const handleDeleteLocation = () => {
    deleteLocation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  const locationDisplay = member.displayName || (language === 'vi' ? 'Vị trí không xác định' : 'Unknown location');

  // Current user view
  if (isCurrentUser) {
    return (
      <>
        <div className="p-4 min-w-[280px]">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              {language === 'vi' ? 'Vị trí của bạn' : 'Your Location'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {locationDisplay}
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => setShowChangeModal(true)}
            >
              <RefreshCw className="h-4 w-4" />
              {language === 'vi' ? 'Thay đổi vị trí' : 'Change Location'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              {language === 'vi' ? 'Xóa khỏi bản đồ' : 'Remove from Map'}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            ⚠️ {language === 'vi' 
              ? 'Vị trí hiển thị với độ lệch ~16km để bảo vệ quyền riêng tư' 
              : 'Location displayed with ~16km offset for privacy'}
          </p>
        </div>

        <DeleteLocationDialog 
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteLocation}
          isDeleting={deleteLocation.isPending}
        />

        <ChangeLocationModal 
          open={showChangeModal}
          onOpenChange={setShowChangeModal}
        />
      </>
    );
  }

  // Other member view
  return (
    <div className="p-4 min-w-[280px]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="w-14 h-14 border-2 border-background shadow-sm">
          <AvatarImage src={member.avatarUrl || undefined} alt={member.fullName} />
          <AvatarFallback className="text-lg font-medium">
            {member.fullName?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base truncate">{member.fullName}</div>
          <div className="flex items-center gap-2 text-sm mt-0.5">
            <LevelBadge level={member.level} />
            {member.isOnline !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <StatusDot isOnline={member.isOnline} />
                {member.isOnline 
                  ? (language === 'vi' ? 'Online' : 'Online')
                  : (language === 'vi' ? 'Offline' : 'Offline')}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{locationDisplay}</span>
          </div>
        </div>
      </div>
      
      {/* Bio */}
      {member.bio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 italic">
          "{member.bio}"
        </p>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="default"
          className="flex-1 gap-1.5"
          onClick={handleChat}
        >
          <MessageCircle className="h-4 w-4" />
          {language === 'vi' ? 'Nhắn tin' : 'Message'}
        </Button>
        <Button 
          size="sm" 
          variant={isFollowing ? "secondary" : "outline"}
          className="flex-1 gap-1.5"
          onClick={handleFollow}
          disabled={isFollowLoading}
        >
          {isFollowing ? (
            <>
              <UserCheck className="h-4 w-4" />
              {language === 'vi' ? 'Đang theo dõi' : 'Following'}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              {language === 'vi' ? 'Theo dõi' : 'Follow'}
            </>
          )}
        </Button>
        <Button 
          size="sm" 
          variant="ghost"
          className="px-2"
          onClick={handleViewProfile}
          title={language === 'vi' ? 'Xem hồ sơ' : 'View Profile'}
        >
          <User className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
