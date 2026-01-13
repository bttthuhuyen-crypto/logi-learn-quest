import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/community/LevelBadge";
import { UserLocation } from "@/hooks/useUserLocations";
import { MessageCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MemberPopupProps {
  member: UserLocation;
}

export const MemberPopup = ({ member }: MemberPopupProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const locationText = member.displayName || 
    [member.city, member.country].filter(Boolean).join(', ') || 
    'Không xác định';

  return (
    <div className="p-2 min-w-[200px]">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.avatarUrl || undefined} alt={member.fullName} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(member.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{member.fullName}</span>
            <LevelBadge level={member.level} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground truncate">{locationText}</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          className="flex-1 text-xs"
          onClick={() => navigate(`/members/${member.userId}`)}
        >
          <User className="h-3 w-3 mr-1" />
          Xem hồ sơ
        </Button>
        <Button 
          size="sm"
          className="flex-1 text-xs"
          onClick={() => navigate(`/messenger?user=${member.userId}`)}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Nhắn tin
        </Button>
      </div>
    </div>
  );
};
