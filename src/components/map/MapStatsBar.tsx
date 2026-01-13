import { Users, Radio, MapPin } from "lucide-react";
import { useUserLocations } from "@/hooks/useUserLocations";

interface MapStatsBarProps {
  nearbyCount?: number;
}

export const MapStatsBar = ({ nearbyCount = 0 }: MapStatsBarProps) => {
  const { data: locations } = useUserLocations();

  const totalMembers = locations?.length || 0;
  // This would need real online status integration
  const onlineCount = Math.floor(totalMembers * 0.1); // Placeholder

  return (
    <div className="bg-background border-t px-4 py-2 flex items-center justify-center gap-6 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{totalMembers.toLocaleString()} thành viên</span>
      </div>
      <div className="flex items-center gap-2 text-green-600">
        <Radio className="h-4 w-4" />
        <span>{onlineCount} đang online</span>
      </div>
      <div className="flex items-center gap-2 text-primary">
        <MapPin className="h-4 w-4" />
        <span>{nearbyCount} gần bạn</span>
      </div>
    </div>
  );
};
