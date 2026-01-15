import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LevelBadge } from "@/components/community/LevelBadge";
import { useLevelConfig } from "@/hooks/useLevelConfig";
import { useLanguage } from "@/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Award } from "lucide-react";
import { DEFAULT_LEVEL_CONFIG } from "@/utils/levelConfig";

interface BadgesCardProps {
  currentLevel: number;
}

export function BadgesCard({ currentLevel }: BadgesCardProps) {
  const { data, isLoading } = useLevelConfig();
  const { language } = useLanguage();
  
  const levelNames = data?.config?.levelNames || DEFAULT_LEVEL_CONFIG.levelNames;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" />
            {language === "vi" ? "Huy hiệu" : "Badges"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const levels = Object.keys(levelNames || {}).map(Number).sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4 w-4" />
          {language === "vi" ? "Huy hiệu" : "Badges"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {levels.map((level) => (
            <div
              key={level}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                level <= currentLevel
                  ? "bg-primary/10"
                  : "opacity-40 grayscale"
              }`}
            >
              <LevelBadge level={level} size="md" />
              <span className="text-[10px] text-muted-foreground font-medium">
                Lv.{level}
              </span>
            </div>
          ))}
        </div>
        {levels.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {language === "vi" ? "Chưa có huy hiệu" : "No badges yet"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
