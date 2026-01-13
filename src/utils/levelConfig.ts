export interface LevelConfig {
  levelNames: Record<number, string>;
  pointsRequired: Record<number, number>;
}

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  levelNames: {
    1: 'Newcomer',
    2: 'Explorer',
    3: 'Contributor',
    4: 'Regular',
    5: 'Enthusiast',
    6: 'Expert',
    7: 'Master',
    8: 'Legend',
    9: 'Champion',
  },
  pointsRequired: {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000,
    6: 1500,
    7: 2100,
    8: 2800,
    9: 3600,
  },
};

export function getLevelName(level: number, config?: LevelConfig | null): string {
  const names = config?.levelNames || DEFAULT_LEVEL_CONFIG.levelNames;
  return names[level] || names[1];
}

export function getPointsForLevel(level: number, config?: LevelConfig | null): number {
  const points = config?.pointsRequired || DEFAULT_LEVEL_CONFIG.pointsRequired;
  return points[level] || 0;
}

export function getPointsForNextLevel(level: number, config?: LevelConfig | null): number {
  const nextLevel = Math.min(level + 1, 9);
  return getPointsForLevel(nextLevel, config);
}

export function calculateProgress(
  currentPoints: number,
  currentLevel: number,
  config?: LevelConfig | null
): {
  pointsToNextLevel: number;
  nextLevelPoints: number;
  progressPercent: number;
  isMaxLevel: boolean;
} {
  const isMaxLevel = currentLevel >= 9;
  
  if (isMaxLevel) {
    return {
      pointsToNextLevel: 0,
      nextLevelPoints: getPointsForLevel(9, config),
      progressPercent: 100,
      isMaxLevel: true,
    };
  }

  const currentLevelPoints = getPointsForLevel(currentLevel, config);
  const nextLevelPoints = getPointsForLevel(currentLevel + 1, config);
  const pointsInCurrentLevel = currentPoints - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;
  const progressPercent = Math.min(
    100,
    Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100)
  );
  const pointsToNextLevel = nextLevelPoints - currentPoints;

  return {
    pointsToNextLevel: Math.max(0, pointsToNextLevel),
    nextLevelPoints,
    progressPercent,
    isMaxLevel: false,
  };
}

export function getLevelColor(level: number): string {
  if (level >= 9) return 'text-yellow-500';
  if (level >= 7) return 'text-purple-500';
  if (level >= 5) return 'text-blue-500';
  if (level >= 3) return 'text-green-500';
  return 'text-muted-foreground';
}

export function getLevelBgColor(level: number): string {
  if (level >= 9) return 'bg-yellow-500/10 border-yellow-500/30';
  if (level >= 7) return 'bg-purple-500/10 border-purple-500/30';
  if (level >= 5) return 'bg-blue-500/10 border-blue-500/30';
  if (level >= 3) return 'bg-green-500/10 border-green-500/30';
  return 'bg-muted/50 border-border';
}
