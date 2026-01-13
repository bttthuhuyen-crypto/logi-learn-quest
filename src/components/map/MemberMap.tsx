import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUserLocations, UserLocation } from "@/hooks/useUserLocations";
import { useMyLocation } from "@/hooks/useMyLocation";
import { useAuth } from "@/contexts/AuthContext";
import { MemberPopupContent, MemberPopupData } from "./MemberPopupContent";
import { MapControls } from "./MapControls";

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom member marker with avatar and online status
const createMemberIcon = (avatarUrl?: string | null, isOnline?: boolean) => {
  const onlineRing = isOnline ? 'ring-2 ring-green-500 ring-offset-1' : '';
  return L.divIcon({
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
};

// Your location marker (yellow/gold)
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

// Custom cluster icon
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

// Helper to convert UserLocation to MemberPopupData
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

interface MemberMapProps {
  flyToLocation?: [number, number] | null;
  onUserLocationFound?: (lat: number, lng: number) => void;
}

export const MemberMap = ({ flyToLocation, onUserLocationFound }: MemberMapProps) => {
  const { user } = useAuth();
  const { data: locations, isLoading } = useUserLocations();
  const { myLocation } = useMyLocation();
  const [selectedMember, setSelectedMember] = useState<UserLocation | null>(null);

  // Default center (Vietnam)
  const defaultCenter: [number, number] = [16.0, 108.0];
  const defaultZoom = 5;

  // Create memoized markers (excluding current user - shown separately)
  const memberMarkers = useMemo(() => {
    if (!locations) return [];
    return locations
      .filter(location => location.userId !== user?.id)
      .map((location) => ({
        ...location,
        icon: createMemberIcon(location.avatarUrl, location.isOnline),
      }));
  }, [locations, user?.id]);

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
        chunkedLoading
        maxClusterRadius={50}
        iconCreateFunction={createClusterCustomIcon}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={true}
        disableClusteringAtZoom={16}
      >
        {memberMarkers.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={location.icon}
            eventHandlers={{
              click: () => setSelectedMember(location),
            }}
          >
            <Popup className="member-popup" maxWidth={320} minWidth={280}>
              <MemberPopupContent 
                member={convertToPopupData(location)}
                isCurrentUser={false}
              />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

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
            />
          </Popup>
        </Marker>
      )}

      {/* Map controls */}
      <MapControls />
    </MapContainer>
  );
};
