import { useTranslation } from "react-i18next";
import { getLevelInfo, getXPForNextLevel, LEVELS } from "../../store/reducers/gameReducer";

interface ScoreDisplayProps {
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  currentPenalty?: number; // 0-100 percentage of XP that will be lost
  onClick?: () => void;
}

export function ScoreDisplay({ totalXP, currentLevel, currentStreak, currentPenalty = 0, onClick }: ScoreDisplayProps) {
  const { t } = useTranslation();
  const levelInfo = getLevelInfo(currentLevel);
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const prevLevelXP = currentLevel > 1 ? LEVELS[currentLevel - 2].xpRequired : 0;
  const progressToNext = ((totalXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 px-2 xs:px-2.5 sm:px-3 py-1.5 rounded-lg xs:rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
    >
      {/* Level Badge */}
      <div
        className="w-7 h-7 xs:w-8 xs:h-8 rounded-md xs:rounded-lg flex items-center justify-center text-white font-bold text-xs xs:text-sm shadow-md flex-shrink-0"
        style={{ backgroundColor: levelInfo.color }}
        title={levelInfo.name}
      >
        {currentLevel}
      </div>

      {/* XP & Progress */}
      <div className="flex flex-col min-w-[60px] xs:min-w-[70px] sm:min-w-[80px]">
        <div className="flex items-center gap-0.5 xs:gap-1">
          <span className="text-xs xs:text-sm font-bold text-gray-900 dark:text-white">{totalXP}</span>
          <span className="text-[10px] xs:text-xs text-gray-500">XP</span>
        </div>
        <div className="h-1 xs:h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden w-full">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progressToNext, 100)}%`,
              backgroundColor: levelInfo.color
            }}
          />
        </div>
      </div>

      {/* Current Penalty Badge */}
      {currentPenalty > 0 && (
        <div className={`hidden xs:flex items-center gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md xs:rounded-lg animate-pulse ${currentPenalty >= 100
            ? "bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30"
            : "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30"
          }`}>
          <span className="text-xs xs:text-sm">{currentPenalty >= 100 ? "⚠️" : "📉"}</span>
          <span className={`text-[10px] xs:text-xs font-bold ${currentPenalty >= 100
              ? "text-rose-600 dark:text-rose-400"
              : "text-amber-600 dark:text-amber-400"
            }`}>
            {currentPenalty >= 100 ? "0%" : `-${currentPenalty}%`}
          </span>
        </div>
      )}

      {/* Streak */}
      {currentStreak > 0 && (
        <div className="flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md xs:rounded-lg bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex-shrink-0">
          <span className="text-xs xs:text-sm">🔥</span>
          <span className="text-xs xs:text-sm font-bold text-orange-600 dark:text-orange-400">{currentStreak}</span>
        </div>
      )}
    </button>
  );
}
