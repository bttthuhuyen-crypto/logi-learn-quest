import { useState } from "react";
import { X, Users, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNearbyMembers, NearbyMember } from "@/hooks/useNearbyMembers";
import { cn } from "@/lib/utils";

interface NearbyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number | null;
  userLng: number | null;
  onMemberClick: (lat: number, lng: number) => void;
}

const RADIUS_OPTIONS = [
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
  { value: "100", label: "100 km" },
  { value: "500", label: "500 km" },
];

export const NearbyPanel = ({
  isOpen,
  onClose,
  userLat,
  userLng,
  onMemberClick,
}: NearbyPanelProps) => {
  const [radius, setRadius] = useState("50");
  const { data: nearbyMembers, isLoading } = useNearbyMembers(
    userLat,
    userLng,
    parseInt(radius)
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  return (
    <div
      className={cn(
        "absolute top-0 left-0 h-full w-80 bg-background border-r shadow-lg z-[1000] transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Thành viên gần bạn</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Radius selector */}
      <div className="p-4 border-b">
        <label className="text-sm text-muted-foreground mb-2 block">
          Bán kính tìm kiếm
        </label>
        <Select value={radius} onValueChange={setRadius}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RADIUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Members list */}
      <ScrollArea className="h-[calc(100%-140px)]">
        {!userLat || !userLng ? (
          <div className="p-8 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Bật vị trí để tìm thành viên gần bạn</p>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Đang tìm kiếm...</p>
          </div>
        ) : nearbyMembers && nearbyMembers.length > 0 ? (
          <div className="p-2">
            {nearbyMembers.map((member: NearbyMember) => (
              <button
                key={member.user_id}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                onClick={() => onMemberClick(member.latitude, member.longitude)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(member.display_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {member.display_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(member.distance_km)}
                  </p>
                </div>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Không tìm thấy thành viên nào</p>
            <p className="text-xs mt-1">Thử tăng bán kính tìm kiếm</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
