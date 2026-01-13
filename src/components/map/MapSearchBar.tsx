import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface MapSearchBarProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export const MapSearchBar = ({ onLocationSelect }: MapSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search with Nominatim (OpenStreetMap)
  useEffect(() => {
    const searchLocation = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5`
        );
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchLocation();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon));
    setQuery(result.display_name.split(",")[0]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={wrapperRef} className="relative bg-background border-b px-4 py-3">
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Tìm kiếm địa điểm..."
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-[1001] max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors border-b last:border-0"
                onClick={() => handleSelect(result)}
              >
                <span className="line-clamp-1">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
