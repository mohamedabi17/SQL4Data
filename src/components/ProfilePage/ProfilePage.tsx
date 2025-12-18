import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useAppSelector } from "../../store/store";
import { BADGES, LEVELS, getLevelInfo, getXPForNextLevel } from "../../store/reducers/gameReducer";
import { tasksList } from "../../assets/tasks/tasks";
import { CloseIcon } from "../../assets/icons/CloseIcon";
import { Button } from "../Button/Button";

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${color} border border-white/20`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xl sm:text-2xl">{icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wide truncate">{label}</p>
          <p className="text-base sm:text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage({ isOpen, onClose, onUpgrade }: ProfilePageProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated, isPremium, logout } = useAuth();
  const gameState = useAppSelector((state) => state.game);
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'settings'>('stats');

  if (!isOpen) return null;

  const currentLevel = getLevelInfo(gameState.currentLevel);
  const nextLevelXP = getXPForNextLevel(gameState.currentLevel);
  const xpProgress = gameState.currentLevel < LEVELS.length
    ? ((gameState.totalXP - currentLevel.xpRequired) / (nextLevelXP - currentLevel.xpRequired)) * 100
    : 100;

  const completedTasks = gameState.completedTasks.length;
  const totalTasks = tasksList.length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const accuracy = gameState.totalAttempts > 0
    ? Math.round((gameState.correctAttempts / gameState.totalAttempts) * 100)
    : 100;

  // Calculate total time spent (from game state)
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-2 sm:my-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-3 sm:p-6 bg-gradient-to-r from-[#442a65] via-[#5a3d7a] to-[#87888a]">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || user.username}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-white/30"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-3 sm:border-4 border-white/30">
                  {isAuthenticated && user
                    ? (user.full_name || user.username).charAt(0).toUpperCase()
                    : '👤'}
                </div>
              )}
              {/* Level Badge */}
              <div
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white border-2 border-white shadow-lg"
                style={{ backgroundColor: currentLevel.color }}
              >
                {gameState.currentLevel}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg sm:text-2xl font-bold text-white truncate max-w-[200px] sm:max-w-none">
                {isAuthenticated && user ? (user.full_name || user.username) : t('profile.guest')}
              </h2>
              <p className="text-white/70 text-xs sm:text-sm">
                {currentLevel.name}
              </p>
              {isPremium && (
                <span className="inline-flex items-center gap-1 mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                  ⭐ Premium
                </span>
              )}
            </div>

            {/* XP Progress - Hidden on very small screens, shown inline on larger */}
            <div className="text-center sm:text-right mt-2 sm:mt-0">
              <p className="text-2xl sm:text-3xl font-bold text-white">{gameState.totalXP}</p>
              <p className="text-white/70 text-xs sm:text-sm">XP Total</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex justify-between text-[10px] sm:text-xs text-white/70 mb-1">
              <span>Level {gameState.currentLevel}</span>
              <span className="truncate ml-2">{gameState.currentLevel < LEVELS.length ? `${nextLevelXP - gameState.totalXP} XP to Lvl ${gameState.currentLevel + 1}` : 'Max Level'}</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          {[
            { id: 'stats', label: t('profile.stats'), icon: '📊' },
            { id: 'badges', label: t('profile.badges'), icon: '🏆' },
            { id: 'settings', label: t('profile.settings'), icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-0 px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'text-[#442a65] dark:text-purple-400 border-b-2 border-[#442a65] dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <span className="mr-1">{tab.icon}</span>
              <span className="text-[10px] xs:text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-240px)] sm:max-h-[calc(90vh-280px)]">
          {activeTab === 'stats' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Progress Overview */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('profile.progress_overview')}
                </h3>
                <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {completedTasks} / {totalTasks} {t('profile.tasks_completed')}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#442a65] dark:text-purple-400">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 sm:h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#442a65] to-[#87888a] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StatCard
                  icon="🔥"
                  label={t('profile.current_streak')}
                  value={gameState.currentStreak}
                  color="from-orange-500 to-red-500"
                />
                <StatCard
                  icon="⚡"
                  label={t('profile.best_streak')}
                  value={gameState.bestStreak}
                  color="from-yellow-500 to-orange-500"
                />
                <StatCard
                  icon="🎯"
                  label={t('profile.accuracy')}
                  value={`${accuracy}%`}
                  color="from-emerald-500 to-teal-500"
                />
                <StatCard
                  icon="⏱️"
                  label={t('profile.time_spent')}
                  value={formatTime(gameState.totalTimeSpent)}
                  color="from-blue-500 to-indigo-500"
                />
              </div>

              {/* Subscription CTA */}
              {!isPremium && (
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl">⭐</span>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                        {t('profile.upgrade_premium')}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {t('profile.premium_benefits')}
                      </p>
                    </div>
                    <Button variant="primary" size="small" onPress={onUpgrade}>
                      {t('profile.upgrade_now')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {BADGES.map(badge => {
                const isUnlocked = gameState.unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-200 ${isUnlocked
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700'
                        : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 opacity-50'
                      }`}
                  >
                    <span className={`text-2xl sm:text-4xl ${!isUnlocked && 'grayscale'}`}>
                      {isUnlocked ? badge.icon : '🔒'}
                    </span>
                    <h4 className="mt-1 sm:mt-2 font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {badge.name}
                    </h4>
                    <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Account Section */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('profile.account')}
                </h3>

                {isAuthenticated && user ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{user.email}</p>
                        </div>
                        <span className={`self-start sm:self-auto px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${isPremium
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                          }`}>
                          {isPremium ? 'Premium' : 'Free'}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="small"
                      fill="fillContainer"
                      onPress={() => logout()}
                    >
                      {t('auth.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                      {t('profile.login_to_save')}
                    </p>
                    <Button variant="primary" size="small" onPress={onClose}>
                      {t('auth.login')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Data Section */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('profile.data')}
                </h3>
                <div className="space-y-2">
                  <button className="w-full p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-left hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-base sm:text-lg">📥</span>
                      <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                        {t('profile.export_progress')}
                      </span>
                    </div>
                  </button>
                  <button className="w-full p-3 sm:p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-left hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-base sm:text-lg">🗑️</span>
                      <span className="text-sm sm:text-base text-rose-600 dark:text-rose-400 font-medium">
                        {t('profile.reset_progress')}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
