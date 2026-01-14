import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LevelBadge } from "@/components/community/LevelBadge";
import { StatusDot } from "./StatusDot";
import { UserLocation } from "@/hooks/useUserLocations";
import { MapPin, MessageCircle, Users, ChevronRight } from "lucide-react";

interface ClusterPopupContentProps {
  members: UserLocation[];
  totalCount: number;
  locationName?: string;
  language?: 'vi' | 'en';
  onViewAll?: () => void;
  onMemberClick?: (member: UserLocation) => void;
  onChatClick?: (userId: string) => void;
}

export const ClusterPopupContent = ({
  members,
  totalCount,
  locationName,
  language = 'vi',
  onViewAll,
  onMemberClick,
  onChatClick,
}: ClusterPopupContentProps) => {
  // Show first 5 members
  const displayMembers = members.slice(0, 5);
  const hasMore = totalCount > 5;
  
  const handleChat = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick?.(userId);
  };

  const handleMemberClick = (member: UserLocation) => {
    onMemberClick?.(member);
  };

  return (
    <div className="p-4 min-w-[320px] max-w-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold">
              {totalCount} {language === 'vi' ? 'thành viên' : 'members'}
            </div>
            {locationName && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationName}
              </div>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {totalCount}
        </Badge>
      </div>
      
      {/* Member List */}
      <ScrollArea className="max-h-[250px]">
        <div className="space-y-1">
          {displayMembers.map((member) => (
            <div 
              key={member.userId}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleMemberClick(member)}
            >
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={member.avatarUrl || undefined} />
                <AvatarFallback className="text-sm">
                  {member.fullName?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {member.fullName}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LevelBadge level={member.level} size="sm" />
                  <StatusDot isOnline={member.isOnline} size="sm" />
                  <span>{member.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 shrink-0"
                onClick={(e) => handleChat(member.userId, e)}
                title={language === 'vi' ? 'Nhắn tin' : 'Message'}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* View All Button */}
      {hasMore && (
        <Button 
          variant="outline" 
          className="w-full mt-4 gap-2"
          onClick={onViewAll}
        >
          {language === 'vi' 
            ? `Xem tất cả ${totalCount} thành viên` 
            : `View all ${totalCount} members`}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
