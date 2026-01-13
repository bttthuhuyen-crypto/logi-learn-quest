import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageContext";
import { useMyLocation, MyLocationData } from "@/hooks/useMyLocation";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChangeLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangeLocationModal = ({
  open,
  onOpenChange,
}: ChangeLocationModalProps) => {
  const { language } = useLanguage();
  const { updateLocation } = useMyLocation();
  const { toast } = useToast();
  
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: language === 'vi' ? "Không hỗ trợ" : "Not supported",
        description: language === 'vi' 
          ? "Trình duyệt của bạn không hỗ trợ định vị GPS" 
          : "Your browser doesn't support GPS location",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding using Nominatim (free, no API key)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          const locationData: MyLocationData = {
            latitude,
            longitude,
            city: data.address?.city || data.address?.town || data.address?.village || "",
            region: data.address?.state || "",
            country: data.address?.country || "",
            country_code: data.address?.country_code?.toUpperCase() || "",
            display_name: `${data.address?.city || data.address?.town || ""}, ${data.address?.country || ""}`,
            is_visible: true,
          };

          updateLocation.mutate(locationData, {
            onSuccess: () => {
              onOpenChange(false);
              setCity("");
              setCountry("");
            },
          });
        } catch (error) {
          // If geocoding fails, still save coordinates
          updateLocation.mutate({
            latitude,
            longitude,
            is_visible: true,
          }, {
            onSuccess: () => {
              onOpenChange(false);
            },
          });
        }
        setIsDetecting(false);
      },
      (error) => {
        setIsDetecting(false);
        toast({
          title: language === 'vi' ? "Lỗi định vị" : "Location error",
          description: language === 'vi' 
            ? "Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí." 
            : "Could not get your location. Please allow location access.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualSubmit = async () => {
    if (!city.trim()) {
      toast({
        title: language === 'vi' ? "Thiếu thông tin" : "Missing information",
        description: language === 'vi' ? "Vui lòng nhập tên thành phố" : "Please enter a city name",
        variant: "destructive",
      });
      return;
    }

    // Geocoding using Nominatim
    try {
      const query = `${city}, ${country}`.trim();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data.length === 0) {
        toast({
          title: language === 'vi' ? "Không tìm thấy" : "Not found",
          description: language === 'vi' 
            ? "Không tìm thấy địa điểm này. Vui lòng thử lại." 
            : "Location not found. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const locationData: MyLocationData = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        city: city.trim(),
        country: country.trim(),
        display_name: `${city.trim()}${country ? `, ${country.trim()}` : ""}`,
        is_visible: true,
      };

      updateLocation.mutate(locationData, {
        onSuccess: () => {
          onOpenChange(false);
          setCity("");
          setCountry("");
        },
      });
    } catch (error) {
      toast({
        title: language === 'vi' ? "Lỗi" : "Error",
        description: language === 'vi' 
          ? "Không thể tìm kiếm địa điểm. Vui lòng thử lại." 
          : "Could not search for location. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'vi' ? 'Thay đổi vị trí' : 'Change Location'}
          </DialogTitle>
          <DialogDescription>
            {language === 'vi' 
              ? 'Cập nhật vị trí của bạn trên bản đồ cộng đồng' 
              : 'Update your location on the community map'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Auto-detect option */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleDetectLocation}
            disabled={isDetecting || updateLocation.isPending}
          >
            {isDetecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {language === 'vi' ? 'Sử dụng vị trí hiện tại' : 'Use current location'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {language === 'vi' ? 'Hoặc nhập thủ công' : 'Or enter manually'}
              </span>
            </div>
          </div>

          {/* Manual input */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="city">
                {language === 'vi' ? 'Thành phố' : 'City'} *
              </Label>
              <Input
                id="city"
                placeholder={language === 'vi' ? 'Ví dụ: Hà Nội' : 'e.g., New York'}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">
                {language === 'vi' ? 'Quốc gia' : 'Country'}
              </Label>
              <Input
                id="country"
                placeholder={language === 'vi' ? 'Ví dụ: Việt Nam' : 'e.g., USA'}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateLocation.isPending}
          >
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Button>
          <Button
            onClick={handleManualSubmit}
            disabled={updateLocation.isPending || !city.trim()}
            className="gap-2"
          >
            {updateLocation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {language === 'vi' ? 'Lưu vị trí' : 'Save Location'}
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center">
          ⚠️ {language === 'vi' 
            ? 'Vị trí hiển thị với độ lệch ~16km để bảo vệ quyền riêng tư' 
            : 'Location is displayed with ~16km offset for privacy'}
        </p>
      </DialogContent>
    </Dialog>
  );
};
