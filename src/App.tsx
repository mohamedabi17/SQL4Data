import { useEffect, useState, useCallback } from "react";
import { Task, tasksList } from "./assets/tasks/tasks";
import { Header } from "./blocks/Header/Header";
import { SolutionEditor } from "./blocks/SolutionEditor/SolutionEditor";
import { Subheader } from "./blocks/Subheader/Subheader";
import {
  LanguageType,
  setLanguage,
  toggleTheme,
} from "./store/reducers/settingsReducer";
import { upsertSolution } from "./store/reducers/solutionsReducer";
import {
  startSession,
  startTask,
  recordAttempt,
  completeTask,
  calculatePoints,
  calculateXPWithPenalty,
  useHint,
  showSolution,
} from "./store/reducers/gameReducer";
import {
  selectSolutionById,
  useAppDispatch,
  useAppSelector,
} from "./store/store";
import { checkAnswer } from "./store/thunks/checkAnswerThunk";
import { selectTask } from "./store/thunks/selectTaskThunk";
import { XPPopup } from "./components/XPPopup/XPPopup";
import { BadgeUnlock } from "./components/BadgeUnlock/BadgeUnlock";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginModal } from "./components/LoginModal/LoginModal";
import { AdUnlockModal } from "./components/AdUnlockModal/AdUnlockModal";
import { useProgressSync } from "./hooks/useProgressSync";

function AppContent() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const gameState = useAppSelector((state) => state.game);
  const { isAuthenticated } = useAuth();
  const { saveTaskToServer, saveStatsToServer } = useProgressSync();
  const {
    dbStatus,
    selected: selectedTask,
    tables: taskTables,
    expectedResult,
    lastAnswerResult,
  } = useAppSelector((state) => state.task);
  const solution = useAppSelector((state) =>
    selectSolutionById(state, selectedTask as unknown as string)
  );

  // Game popup states
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isFirstTry, setIsFirstTry] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [previousBadgesCount, setPreviousBadgesCount] = useState(gameState.unlockedBadges.length);

  // Auth modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adUnlockType, setAdUnlockType] = useState<'ai_feedback' | 'hints_level3' | 'solution_reveals'>('ai_feedback');

  const selectedTaskIndex = tasksList.findIndex(
    ({ id }) => id === selectedTask
  );

  // Initialize game session
  useEffect(() => {
    dispatch(startSession());
  }, [dispatch]);

  // Set RTL direction for Arabic language
  useEffect(() => {
    const isRTL = settings.language === "ar";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  useEffect(() => {
    if (!selectedTask) {
      console.log("Task is not selected. The first task was selected");
      dispatch(selectTask(tasksList[0].id));
    }
  }, [selectedTask]);

  useEffect(() => {
    if (selectedTask && dbStatus === "NOT_INITIALIZED") {
      console.log(
        "Task is selected, but database is not initialized. Reinitializing database."
      );
      dispatch(selectTask(selectedTask));
    }
  }, [dbStatus, selectedTask]);

  const onLanguageSelect = (new_lang: LanguageType) => {
    dispatch(setLanguage(new_lang));
  };

  const onThemeButtonClick = () => {
    dispatch(toggleTheme());
  };

  const onSelectTask = (newTask: Task["id"]) => {
    dispatch(selectTask(newTask));
    dispatch(startTask(newTask));
  };

  const onAnswerCheck = async () => {
    await dispatch(checkAnswer());
  };

  // Hint handlers
  const onUseHint = useCallback((level: number) => {
    if (selectedTask) {
      dispatch(useHint({ taskId: selectedTask, level }));
    }
  }, [dispatch, selectedTask]);

  const onShowSolution = useCallback(() => {
    if (selectedTask) {
      dispatch(showSolution(selectedTask));
    }
  }, [dispatch, selectedTask]);

  // Watch for status changes to trigger game events
  useEffect(() => {
    if (!selectedTask || !solution) return;

    const wasAlreadyCompleted = gameState.completedTasks.includes(selectedTask);

    if (solution.status === "CORRECT" && !wasAlreadyCompleted) {
      // Calculate and show XP with hint penalty
      const timeSpent = gameState.currentTaskStartTime
        ? Math.floor((Date.now() - gameState.currentTaskStartTime) / 1000)
        : 60;
      const firstTry = gameState.currentTaskAttempts === 0;
      const baseXP = calculatePoints(firstTry, gameState.currentStreak + 1, timeSpent, "beginner");
      const xp = calculateXPWithPenalty(baseXP, gameState.currentHintLevel, gameState.currentSolutionShown);

      setEarnedXP(xp);
      setIsFirstTry(firstTry && !gameState.currentSolutionShown && gameState.currentHintLevel === 0);
      setShowXPPopup(true);
      setPreviousBadgesCount(gameState.unlockedBadges.length);

      // Complete the task in game state
      dispatch(completeTask({
        taskId: selectedTask,
        difficulty: "beginner",
        totalTasks: tasksList.length,
      }));

      // Save to server if authenticated
      if (isAuthenticated) {
        const databaseId = selectedTask.split('_')[0] || 'unknown';
        saveTaskToServer(selectedTask, databaseId);
        saveStatsToServer();
      }
    } else if (solution.status === "INCORRECT") {
      dispatch(recordAttempt(selectedTask));
    }
  }, [solution?.status, selectedTask]);

  // Check for new badges after game state updates
  useEffect(() => {
    if (gameState.unlockedBadges.length > previousBadgesCount) {
      const newlyUnlocked = gameState.unlockedBadges.slice(previousBadgesCount);
      setNewBadges(newlyUnlocked);
      setCurrentBadgeIndex(0);
    }
  }, [gameState.unlockedBadges.length, previousBadgesCount]);

  const handleXPPopupComplete = useCallback(() => {
    setShowXPPopup(false);
  }, []);

  const handleBadgeComplete = useCallback(() => {
    if (currentBadgeIndex < newBadges.length - 1) {
      setCurrentBadgeIndex(prev => prev + 1);
    } else {
      setNewBadges([]);
      setCurrentBadgeIndex(0);
    }
  }, [currentBadgeIndex, newBadges.length]);

  const onChangeTextArea = (value: string) => {
    if (selectedTask) {
      dispatch(
        upsertSolution({
          taskId: selectedTask,
          query: value,
          status: "UNKNOWN",
        })
      );
    }
  };

  const onSelectNextTask = () => {
    onSelectTask(tasksList[selectedTaskIndex + 1].id);
  };

  // Auth handlers
  const onLoginClick = () => {
    setShowLoginModal(true);
  };

  const onShowAdModal = (type: 'ai_feedback' | 'hint' | 'solution') => {
    // Map the type to unlock type
    const typeMap: Record<string, 'ai_feedback' | 'hints_level3' | 'solution_reveals'> = {
      'ai_feedback': 'ai_feedback',
      'hint': 'hints_level3',
      'solution': 'solution_reveals',
    };
    setAdUnlockType(typeMap[type]);
    setShowAdModal(true);
  };

  const onAdUnlockComplete = () => {
    setShowAdModal(false);
    // Refresh limits after ad unlock
  };

  return (
    <div className="flex flex-col w-full min-h-screen overflow-x-hidden">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-gray-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="w-full lg:container mx-auto">
          <Header
            selectedLanguage={settings.language}
            onLanguageSelect={onLanguageSelect}
            selectedTheme={settings.theme}
            onThemeButtonClick={onThemeButtonClick}
            onLoginClick={onLoginClick}
          />
        </div>
      </header>

      {/* Navigation/Subheader */}
      <nav className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-gray-100/50 dark:border-slate-800/50">
        <div className="w-full lg:container mx-auto px-4 sm:px-6">
          <Subheader selectedTask={selectedTask} onSelectTask={onSelectTask} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="w-full lg:container mx-auto">
        <SolutionEditor
          selectedTask={selectedTask}
          taskTables={taskTables}
          expectedTable={expectedResult}
          userResultTable={lastAnswerResult}
          status={solution?.status || "UNKNOWN"}
          textAreaValue={solution?.query || ""}
          onChangeTextArea={onChangeTextArea}
          onAnswerCheck={onAnswerCheck}
          onSelectNextTask={onSelectNextTask}
          errorMessage={solution?.error}
          currentHintLevel={gameState.currentHintLevel}
          solutionShown={gameState.currentSolutionShown}
          onUseHint={onUseHint}
          onShowSolution={onShowSolution}
          onShowAdModal={onShowAdModal}
        />
        </div>
      </main>

      {/* Game Popups */}
      {showXPPopup && (
        <XPPopup
          xp={earnedXP}
          isFirstTry={isFirstTry}
          streak={gameState.currentStreak}
          onComplete={handleXPPopupComplete}
        />
      )}

      {newBadges.length > 0 && !showXPPopup && (
        <BadgeUnlock
          badgeId={newBadges[currentBadgeIndex]}
          onComplete={handleBadgeComplete}
        />
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <AdUnlockModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        unlockType={adUnlockType}
        onUnlocked={onAdUnlockComplete}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
