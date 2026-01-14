import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUserLocations, UserLocation } from "@/hooks/useUserLocations";
import { useMyLocation } from "@/hooks/useMyLocation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { MemberPopupContent, MemberPopupData } from "./MemberPopupContent";
import { ClusterPopupContent } from "./ClusterPopupContent";
import { MapControls } from "./MapControls";

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Your location marker (yellow/gold) - static, defined at module level
const yourLocationIcon = L.divIcon({
  className: "your-location-marker",
  html: `
    <div class="relative">
      <div class="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg border-3 border-white animate-pulse">
        <span class="text-xl">📍</span>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 text-[10px] font-medium text-center bg-yellow-400 text-yellow-900 rounded px-1">
        Bạn
      </div>
    </div>
  `,
  iconSize: [48, 56],
  iconAnchor: [24, 56],
  popupAnchor: [0, -56],
});

// Custom cluster icon - static function at module level
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = "small";
  if (count >= 10) size = "medium";
  if (count >= 50) size = "large";

  return L.divIcon({
    html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
    className: "custom-cluster",
    iconSize: L.point(40, 40, true),
  });
};

// Component to handle map events and fly to location
interface MapEventsProps {
  onLocationFound?: (lat: number, lng: number) => void;
  flyToLocation?: [number, number] | null;
}

const MapEvents = ({ onLocationFound, flyToLocation }: MapEventsProps) => {
  const map = useMap();

  useMapEvents({
    locationfound: (e) => {
      if (onLocationFound) {
        onLocationFound(e.latlng.lat, e.latlng.lng);
      }
      map.flyTo(e.latlng, 14);
    },
  });

  useEffect(() => {
    if (flyToLocation) {
      map.flyTo(flyToLocation, 14);
    }
  }, [flyToLocation, map]);

  return null;
};

// Helper to convert UserLocation to MemberPopupData - pure function
const convertToPopupData = (location: UserLocation): MemberPopupData => ({
  userId: location.userId,
  fullName: location.fullName,
  avatarUrl: location.avatarUrl,
  level: location.level,
  levelName: location.levelName,
  isOnline: location.isOnline,
  bio: location.bio,
  displayName: location.displayName,
});

// Get common location name from cluster members - pure function
const getClusterLocationName = (members: UserLocation[]): string | undefined => {
  const cities = members.map(m => m.city).filter(Boolean);
  const uniqueCities = [...new Set(cities)];
  
  if (uniqueCities.length === 1) {
    return uniqueCities[0] || undefined;
  }
  
  const countries = members.map(m => m.country).filter(Boolean);
  const uniqueCountries = [...new Set(countries)];
  
  if (uniqueCountries.length === 1) {
    return uniqueCountries[0] || undefined;
  }
  
  return undefined;
};

interface ClusterPopupState {
  position: [number, number];
  members: UserLocation[];
}

interface MemberMapProps {
  flyToLocation?: [number, number] | null;
  onUserLocationFound?: (lat: number, lng: number) => void;
}

// Component to handle cluster popup with map access
const ClusterPopupHandler = ({
  clusterPopup,
  setClusterPopup,
  language,
  onNavigate,
}: {
  clusterPopup: ClusterPopupState | null;
  setClusterPopup: (popup: ClusterPopupState | null) => void;
  language: 'vi' | 'en';
  onNavigate: (path: string) => void;
}) => {
  const map = useMap();

  const handleViewAll = useCallback(() => {
    if (clusterPopup) {
      // Zoom in to uncluster the markers
      map.flyTo(clusterPopup.position, map.getZoom() + 2);
      setClusterPopup(null);
    }
  }, [clusterPopup, map, setClusterPopup]);

  const handleMemberClick = useCallback((member: UserLocation) => {
    setClusterPopup(null);
    map.flyTo([member.latitude, member.longitude], 16);
  }, [map, setClusterPopup]);

  const handleChatClick = useCallback((userId: string) => {
    setClusterPopup(null);
    onNavigate(`/messenger?user=${userId}`);
  }, [setClusterPopup, onNavigate]);

  if (!clusterPopup) return null;

  return (
    <Popup
      position={clusterPopup.position}
      className="cluster-popup"
      maxWidth={380}
      minWidth={320}
      eventHandlers={{
        remove: () => setClusterPopup(null),
      }}
    >
      <ClusterPopupContent
        members={clusterPopup.members}
        totalCount={clusterPopup.members.length}
        locationName={getClusterLocationName(clusterPopup.members)}
        language={language}
        onViewAll={handleViewAll}
        onMemberClick={handleMemberClick}
        onChatClick={handleChatClick}
      />
    </Popup>
  );
};

export const MemberMap = ({ flyToLocation, onUserLocationFound }: MemberMapProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: locations, isLoading } = useUserLocations();
  const { myLocation } = useMyLocation();
  const [selectedMember, setSelectedMember] = useState<UserLocation | null>(null);
  const [clusterPopup, setClusterPopup] = useState<ClusterPopupState | null>(null);

  // Icon cache to prevent recreating icons on every render
  const iconCache = useRef<Map<string, L.DivIcon>>(new Map());

  // Memoized icon creator with caching
  const createMemberIcon = useCallback((avatarUrl?: string | null, isOnline?: boolean) => {
    const cacheKey = `${avatarUrl || 'default'}-${isOnline ? '1' : '0'}`;
    
    if (iconCache.current.has(cacheKey)) {
      return iconCache.current.get(cacheKey)!;
    }
    
    const onlineRing = isOnline ? 'ring-2 ring-green-500 ring-offset-1' : '';
    const icon = L.divIcon({
      className: "member-marker",
      html: `
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white ${onlineRing}">
          ${avatarUrl 
            ? `<img src="${avatarUrl}" class="w-full h-full rounded-full object-cover" />`
            : `<span class="text-sm text-primary-foreground font-bold">👤</span>`
          }
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
    
    iconCache.current.set(cacheKey, icon);
    return icon;
  }, []);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Default center (Vietnam)
  const defaultCenter: [number, number] = [16.0, 108.0];
  const defaultZoom = 5;

  // Check if data is ready for rendering
  const isDataReady = !isLoading && !!locations;

  // Step 1: Filter locations (stable reference when user.id doesn't change)
  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    return locations.filter(location => location.userId !== user?.id);
  }, [locations, user?.id]);

  // Step 2: Create markers with cached icons (only recomputes when filteredLocations changes)
  const memberMarkers = useMemo(() => {
    return filteredLocations.map((location) => ({
      ...location,
      icon: createMemberIcon(location.avatarUrl, location.isOnline),
    }));
  }, [filteredLocations, createMemberIcon]);

  // Handle cluster click
  const handleClusterClick = useCallback((e: L.LeafletMouseEvent) => {
    const cluster = e.layer as any;
    
    // Check if this is actually a cluster (has getAllChildMarkers method)
    if (cluster && typeof cluster.getAllChildMarkers === 'function') {
      const childMarkers = cluster.getAllChildMarkers();
      
      // Extract member data from markers
      const clusterMembers: UserLocation[] = childMarkers
        .map((marker: any) => marker.options?.memberData)
        .filter(Boolean);
      
      if (clusterMembers.length > 0) {
        setClusterPopup({
          position: [e.latlng.lat, e.latlng.lng],
          members: clusterMembers,
        });
      }
    }
  }, []);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      className="h-full w-full"
      scrollWheelZoom={true}
      zoomControl={false}
    >
      {/* OpenStreetMap Tile Layer - FREE */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Map events handler */}
      <MapEvents 
        onLocationFound={onUserLocationFound}
        flyToLocation={flyToLocation}
      />

      {/* Clustered member markers */}
      <MarkerClusterGroup
        chunkedLoading={true}
        chunkDelay={50}
        chunkInterval={200}
        removeOutsideVisibleBounds={true}
        maxClusterRadius={50}
        iconCreateFunction={createClusterCustomIcon}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={true}
        disableClusteringAtZoom={16}
        zoomToBoundsOnClick={false}
        onClick={handleClusterClick}
      >
        {isDataReady && memberMarkers.length > 0 && memberMarkers.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={location.icon}
            // @ts-ignore - Store member data for cluster access
            memberData={location}
            eventHandlers={{
              click: () => setSelectedMember(location),
            }}
          >
            <Popup className="member-popup" maxWidth={320} minWidth={280}>
              <MemberPopupContent 
                member={convertToPopupData(location)}
                isCurrentUser={false}
                language={language}
                onNavigate={handleNavigate}
              />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* Cluster popup */}
      <ClusterPopupHandler
        clusterPopup={clusterPopup}
        setClusterPopup={setClusterPopup}
        language={language}
        onNavigate={handleNavigate}
      />

      {/* Your location marker */}
      {myLocation && myLocation.latitude && myLocation.longitude && (
        <Marker
          position={[myLocation.latitude, myLocation.longitude]}
          icon={yourLocationIcon}
          zIndexOffset={1000}
        >
          <Popup className="member-popup" maxWidth={320} minWidth={280}>
            <MemberPopupContent 
              member={{
                userId: user?.id || '',
                fullName: 'You',
                avatarUrl: null,
                level: 1,
                displayName: myLocation.display_name || 
                  [myLocation.city, myLocation.country].filter(Boolean).join(', ') ||
                  null,
              }}
              isCurrentUser={true}
              language={language}
              onNavigate={handleNavigate}
            />
          </Popup>
        </Marker>
      )}

      {/* Map controls */}
      <MapControls />
    </MapContainer>
  );
};
