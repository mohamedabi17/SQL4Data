import { Key, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Item } from "react-stately";
import { CloseIcon } from "../../assets/icons/CloseIcon";
import { LogoIcon } from "../../assets/icons/LogoIcon";
import { LogoText } from "../../assets/icons/LogoText";
import { MoonIcon } from "../../assets/icons/MoonIcon";
import { MoreHorizontalIcon } from "../../assets/icons/MoreHorizontalIcon";
import { SunIcon } from "../../assets/icons/SunIcon";
import { Button } from "../../components/Button/Button";
import { Dialog } from "../../components/Dialog/Dialog";
import { ModalButton } from "../../components/ModalButton/ModalButton";
import { Select } from "../../components/Select/Select";
import { BackendStatus } from "../../components/BackendStatus/BackendStatus";
import { ScoreDisplay } from "../../components/ScoreDisplay/ScoreDisplay";
import { GameStats } from "../../components/GameStats/GameStats";
import { ProfilePage } from "../../components/ProfilePage/ProfilePage";
import { SubscriptionPage } from "../../components/SubscriptionPage/SubscriptionPage";
import { LanguageType, ThemeType } from "../../store/reducers/settingsReducer";
import { useAppSelector } from "../../store/store";
import { tasksList } from "../../assets/tasks/tasks";
import { useAuth } from "../../contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

interface RowProps {
  children: ReactNode;
  className?: string;
}

interface LogoRowProps {
  children: ReactNode;
  className?: string;
}

interface LanguageSelectProps {
  selectedLanguage: LanguageType;
  onSelect: (new_lang: LanguageType) => void;
}

interface ThemeButtonProps {
  selectedTheme: ThemeType;
  onClick: () => void;
}

export interface HeaderProps {
  selectedLanguage: LanguageType;
  onLanguageSelect: (new_lang: LanguageType) => void;
  selectedTheme: ThemeType;
  onThemeButtonClick: () => void;
  onLoginClick: () => void;
}

const LANGUAGES: { title: string; value: LanguageType }[] = [
  {
    title: "english",
    value: "en",
  },
  {
    title: "french",
    value: "fr",
  },
  {
    title: "arabic",
    value: "ar",
  },
  {
    title: "russian",
    value: "ru",
  },
];

function Layout({ children }: LayoutProps) {
  return <div className="w-full px-3 xs:px-4 sm:px-6 py-2 xs:py-3 flex flex-col">{children}</div>;
}

function Row({ children, className = "" }: RowProps) {
  return (
    <div className={`w-full py-2 flex flex-row justify-between items-center ${className}`}>
      {children}
    </div>
  );
}

function LogoRow({ children, className = "" }: LogoRowProps) {
  return (
    <Row className={className}>
      <div className="flex flex-row gap-1.5 xs:gap-2 justify-start items-center group cursor-pointer">
        <div className="relative">
          <LogoIcon className="w-10 h-10 xs:w-12 xs:h-12 flex-shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-[#442a65]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <LogoText className="w-[120px] h-[30px] xs:w-[160px] xs:h-[40px] flex-shrink-0" />
      </div>
      {children}
    </Row>
  );
}

function LanguageSelect({
  selectedLanguage,
  onSelect: onLanguageSelect,
}: LanguageSelectProps) {
  const { t } = useTranslation();

  const languageItems = LANGUAGES.map(({ title, value }) => (
    <Item key={value}>{t(title)}</Item>
  ));

  return (
    <Select
      name="language"
      label=""
      aria-label="Language select"
      selectedKey={selectedLanguage}
      onSelectionChange={(selectedKey: Key) =>
        onLanguageSelect(selectedKey as LanguageType)
      }
    >
      {languageItems}
    </Select>
  );
}

function ThemeToggler({ selectedTheme, onClick }: ThemeButtonProps) {
  const { t } = useTranslation();

  const isDarkTheme =
    selectedTheme === "dark" ||
    (selectedTheme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={onClick}
      aria-label={t("toggle_color_scheme") || undefined}
      className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-slate-700 dark:to-slate-800 
                 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105
                 border border-indigo-200/50 dark:border-slate-600/50"
    >
      <div className={`absolute transition-all duration-300 ${isDarkTheme ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}>
        <SunIcon className="w-5 h-5 text-amber-500" />
      </div>
      <div className={`absolute transition-all duration-300 ${isDarkTheme ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}>
        <MoonIcon className="w-5 h-5 text-indigo-400" />
      </div>
    </button>
  );
}

export function Header(props: HeaderProps) {
  const { t } = useTranslation();
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const { user, logout, isAuthenticated, isPremium } = useAuth();

  const {
    selectedLanguage,
    onLanguageSelect,
    selectedTheme,
    onThemeButtonClick,
    onLoginClick,
  } = props;

  // Game state
  const gameState = useAppSelector((state) => state.game);
  const accuracy = gameState.totalAttempts > 0
    ? Math.round((gameState.correctAttempts / gameState.totalAttempts) * 100)
    : 100;

  // Calculate current penalty based on hints used
  const calculateCurrentPenalty = () => {
    if (gameState.currentSolutionShown) return 100;
    if (gameState.currentHintLevel === 0) return 0;
    // Penalties: level 1 = 25%, level 2 = 50%, level 3 = 75%
    const penalties = [25, 50, 75];
    return penalties[Math.min(gameState.currentHintLevel - 1, penalties.length - 1)] || 0;
  };

  const currentPenalty = calculateCurrentPenalty();

  return (
    <>
      <Layout>
        <LogoRow className="sm:hidden">
          <div className="flex items-center gap-2">
            <ScoreDisplay
              totalXP={gameState.totalXP}
              currentLevel={gameState.currentLevel}
              currentStreak={gameState.currentStreak}
              currentPenalty={currentPenalty}
              onClick={() => setShowProfile(true)}
            />
            <ModalButton
              buttonProps={{
                leftIcon: <MoreHorizontalIcon />,
                variant: "tertiary",
                size: "medium",
                "aria-label": t("open_main_menu") || undefined,
              }}
              isDismissable
              position="topFullWidth"
            >
              {(onCloseClick) => (
                <Dialog>
                  <Layout>
                    <LogoRow>
                      <Button
                        variant="tertiary"
                        onPress={onCloseClick}
                        leftIcon={<CloseIcon />}
                      />
                    </LogoRow>
                    <Row>
                      <LanguageSelect
                        selectedLanguage={selectedLanguage}
                        onSelect={onLanguageSelect}
                      />
                      <ThemeToggler
                        selectedTheme={selectedTheme}
                        onClick={onThemeButtonClick}
                      />
                    </Row>
                    <Row className="border-t rounded-t-none border-gray-200 dark:border-gray-700">
                      {isAuthenticated && user ? (
                        <Button
                          variant="secondary"
                          size="medium"
                          fill="fillContainer"
                          onPress={() => {
                            onCloseClick();
                            setShowProfile(true);
                          }}
                        >
                          {t('profile.my_profile')}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="medium"
                          fill="fillContainer"
                          onPress={() => {
                            onCloseClick();
                            onLoginClick();
                          }}
                        >
                          {t('auth.login')}
                        </Button>
                      )}
                    </Row>
                  </Layout>
                </Dialog>
              )}
            </ModalButton>
          </div>
        </LogoRow>
        <LogoRow className="hidden sm:flex">
          <div className="flex flex-row gap-3 items-center">
            <ScoreDisplay
              totalXP={gameState.totalXP}
              currentLevel={gameState.currentLevel}
              currentStreak={gameState.currentStreak}
              currentPenalty={currentPenalty}
              onClick={() => setShowProfile(true)}
            />
            <BackendStatus />
            <LanguageSelect
              selectedLanguage={selectedLanguage}
              onSelect={onLanguageSelect}
            />
            <ThemeToggler
              selectedTheme={selectedTheme}
              onClick={onThemeButtonClick}
            />
            {/* Auth Button */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-slate-700 dark:to-slate-800 
                           border border-indigo-200/50 dark:border-slate-600/50 transition-all duration-200 hover:shadow-md hover:scale-105"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || user.username}
                      className="w-6 h-6 rounded-full border border-white/50"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {(user.full_name || user.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                    {(user.full_name || user.username).split(' ')[0]}
                  </span>
                  {isPremium && (
                    <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-md font-bold">
                      PRO
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="medium"
                onPress={onLoginClick}
              >
                {t("auth.login")}
              </Button>
            )}
          </div>
        </LogoRow>
      </Layout>

      {/* Game Stats Modal */}
      {showStats && (
        <GameStats
          totalXP={gameState.totalXP}
          currentLevel={gameState.currentLevel}
          currentStreak={gameState.currentStreak}
          bestStreak={gameState.bestStreak}
          completedTasks={gameState.completedTasks.length}
          totalTasks={tasksList.length}
          unlockedBadges={gameState.unlockedBadges}
          accuracy={accuracy}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Profile Page */}
      <ProfilePage
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onUpgrade={() => {
          setShowProfile(false);
          setShowSubscription(true);
        }}
      />

      {/* Subscription Page */}
      <SubscriptionPage
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
      />
    </>
  );
}
