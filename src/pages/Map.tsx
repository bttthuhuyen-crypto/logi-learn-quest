import { useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MemberMap } from "@/components/map/MemberMap";
import { MapSearchBar } from "@/components/map/MapSearchBar";
import { NearbyPanel } from "@/components/map/NearbyPanel";
import { MapStatsBar } from "@/components/map/MapStatsBar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNearbyMembers } from "@/hooks/useNearbyMembers";

const MapPage = () => {
  const [nearbyPanelOpen, setNearbyPanelOpen] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get nearby members count for stats
  const { data: nearbyMembers } = useNearbyMembers(
    userLocation?.lat || null,
    userLocation?.lng || null,
    50
  );

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setFlyToLocation([lat, lng]);
    // Reset after flying
    setTimeout(() => setFlyToLocation(null), 1000);
  }, []);

  const handleUserLocationFound = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
  }, []);

  const handleMemberClick = useCallback((lat: number, lng: number) => {
    setFlyToLocation([lat, lng]);
    setNearbyPanelOpen(false);
    setTimeout(() => setFlyToLocation(null), 1000);
  }, []);

  return (
    <MainLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Search bar */}
        <MapSearchBar onLocationSelect={handleLocationSelect} />

        {/* Map container */}
        <div className="flex-1 relative">
          <MemberMap 
            flyToLocation={flyToLocation}
            onUserLocationFound={handleUserLocationFound}
          />

          {/* Nearby panel */}
          <NearbyPanel
            isOpen={nearbyPanelOpen}
            onClose={() => setNearbyPanelOpen(false)}
            userLat={userLocation?.lat || null}
            userLng={userLocation?.lng || null}
            onMemberClick={handleMemberClick}
          />

          {/* Toggle nearby panel button */}
          <Button
            className="absolute top-4 left-4 z-[1000] shadow-lg"
            onClick={() => setNearbyPanelOpen(!nearbyPanelOpen)}
          >
            <Users className="h-4 w-4 mr-2" />
            Gần bạn
            {nearbyMembers && nearbyMembers.length > 0 && (
              <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs">
                {nearbyMembers.length}
              </span>
            )}
          </Button>
        </div>

        {/* Stats bar */}
        <MapStatsBar nearbyCount={nearbyMembers?.length || 0} />
      </div>
    </MainLayout>
  );
};

export default MapPage;
