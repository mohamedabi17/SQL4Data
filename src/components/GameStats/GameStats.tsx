import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  BADGES,
  LEVELS,
  getLevelInfo,
  getXPForNextLevel,
} from "../../store/reducers/gameReducer";

interface GameStatsProps {
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  bestStreak: number;
  completedTasks: number;
  totalTasks: number;
  unlockedBadges: string[];
  accuracy: number;
  onClose: () => void;
}

export function GameStats({
  totalXP,
  currentLevel,
  currentStreak,
  bestStreak,
  completedTasks,
  totalTasks,
  unlockedBadges,
  accuracy,
  onClose,
}: GameStatsProps) {
  const { t } = useTranslation();
  const levelInfo = getLevelInfo(currentLevel);
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const prevLevelXP = currentLevel > 1 ? LEVELS[currentLevel - 2].xpRequired : 0;
  const progressToNext = ((totalXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full my-2 sm:my-0 max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Level */}
        <div
          className="p-4 sm:p-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}99)` }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-white/80 text-xs sm:text-sm font-medium">{t("game.level")} {currentLevel}</p>
                <h2 className="text-xl sm:text-2xl font-bold">{levelInfo.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl sm:text-4xl font-bold">{totalXP}</p>
                <p className="text-white/80 text-xs sm:text-sm">XP</p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-3 sm:mt-4">
              <div className="flex justify-between text-xs sm:text-sm text-white/80 mb-1">
                <span>{t("game.progress_to_next")}</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <div className="h-2 sm:h-3 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/90 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>{totalXP} XP</span>
                <span>{nextLevelXP} XP</span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <span className="text-white text-lg sm:text-xl">×</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            icon="🎯"
            value={completedTasks}
            label={t("game.completed")}
            subtext={`/ ${totalTasks}`}
          />
          <StatCard
            icon="🔥"
            value={currentStreak}
            label={t("game.streak")}
            subtext={`${t("game.best")}: ${bestStreak}`}
            highlight={currentStreak >= 5}
          />
          <StatCard
            icon="🎖️"
            value={unlockedBadges.length}
            label={t("game.badges")}
            subtext={`/ ${BADGES.length}`}
          />
          <StatCard
            icon="🎯"
            value={`${accuracy}%`}
            label={t("game.accuracy")}
          />
        </div>

        {/* Badges Section */}
        <div className="px-3 sm:px-6 pb-3 sm:pb-6 overflow-y-auto max-h-[40vh]">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span>🏆</span> {t("game.achievements")}
          </h3>
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 sm:gap-2">
            {BADGES.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`
                    relative group aspect-square rounded-xl flex items-center justify-center text-2xl
                    transition-all duration-200 cursor-pointer
                    ${isUnlocked
                      ? 'bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/50 dark:to-yellow-900/50 shadow-md hover:scale-110'
                      : 'bg-gray-100 dark:bg-slate-800 opacity-40 grayscale'
                    }
                  `}
                  title={`${badge.name}: ${badge.description}`}
                >
                  <span className={isUnlocked ? '' : 'opacity-50'}>{badge.icon}</span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <p className="font-bold">{badge.name}</p>
                    <p className="text-gray-300">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level Progress */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📊</span> {t("game.levels")}
          </h3>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {LEVELS.map((level) => (
              <div
                key={level.level}
                className={`
                  flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold
                  transition-all duration-200
                  ${currentLevel >= level.level
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                  }
                `}
                style={currentLevel >= level.level ? { backgroundColor: level.color } : {}}
                title={level.name}
              >
                <span>{level.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StatCard({
  icon,
  value,
  label,
  subtext,
  highlight = false
}: {
  icon: string;
  value: string | number;
  label: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`
      p-2.5 sm:p-4 rounded-lg sm:rounded-xl text-center transition-all duration-200
      ${highlight
        ? 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30'
        : 'bg-gray-50 dark:bg-slate-800'
      }
    `}>
      <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">{icon}</div>
      <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
        {value}
        {subtext && <span className="text-xs sm:text-sm text-gray-400 font-normal ml-1">{subtext}</span>}
      </div>
      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{label}</div>
    </div>
  );
}
