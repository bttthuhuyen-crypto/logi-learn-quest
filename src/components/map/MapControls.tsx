import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Locate, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MapControlsProps {
  onLocate?: () => void;
  onStyleChange?: (style: string) => void;
}

export const MapControls = ({ onLocate, onStyleChange }: MapControlsProps) => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleLocate = () => {
    if (onLocate) {
      onLocate();
    } else {
      map.locate({ setView: true, maxZoom: 14 });
    }
  };

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="h-10 w-10 bg-background shadow-md hover:bg-muted"
        onClick={handleZoomIn}
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="h-10 w-10 bg-background shadow-md hover:bg-muted"
        onClick={handleZoomOut}
      >
        <Minus className="h-5 w-5" />
      </Button>
      
      {onStyleChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 bg-background shadow-md hover:bg-muted"
            >
              <Layers className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStyleChange("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange("satellite")}>
              Satellite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button
        variant="secondary"
        size="icon"
        className="h-10 w-10 bg-background shadow-md hover:bg-muted mt-2"
        onClick={handleLocate}
      >
        <Locate className="h-5 w-5" />
      </Button>
    </div>
  );
};
