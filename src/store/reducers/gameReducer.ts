import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Badge definitions
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export const BADGES: Badge[] = [
  { id: "first_query", name: "First Steps", description: "Complete your first SQL query", icon: "🎯" },
  { id: "perfect_10", name: "Perfect 10", description: "Complete 10 queries on first try", icon: "🌟" },
  { id: "streak_5", name: "On Fire!", description: "5 correct answers in a row", icon: "🔥" },
  { id: "streak_10", name: "Unstoppable", description: "10 correct answers in a row", icon: "⚡" },
  { id: "streak_20", name: "SQL Master", description: "20 correct answers in a row", icon: "👑" },
  { id: "speed_demon", name: "Speed Demon", description: "Complete a query in under 10 seconds", icon: "🚀" },
  { id: "half_way", name: "Halfway There", description: "Complete 50% of all exercises", icon: "🏔️" },
  { id: "completionist", name: "Completionist", description: "Complete all exercises", icon: "🏆" },
  { id: "select_master", name: "SELECT Master", description: "Complete all SELECT exercises", icon: "📊" },
  { id: "join_master", name: "JOIN Master", description: "Complete all JOIN exercises", icon: "🔗" },
  { id: "aggregate_master", name: "Aggregate Pro", description: "Complete all aggregate exercises", icon: "📈" },
  { id: "night_owl", name: "Night Owl", description: "Practice SQL after midnight", icon: "🦉" },
  { id: "early_bird", name: "Early Bird", description: "Practice SQL before 7 AM", icon: "🐦" },
  { id: "persistent", name: "Persistent", description: "Try a query 5 times before succeeding", icon: "💪" },
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "⭐" },
  { id: "level_10", name: "SQL Expert", description: "Reach level 10", icon: "🌠" },
];

// Level definitions
export const LEVELS = [
  { level: 1, name: "SQL Novice", xpRequired: 0, color: "#94a3b8" },
  { level: 2, name: "Query Learner", xpRequired: 100, color: "#22c55e" },
  { level: 3, name: "Data Explorer", xpRequired: 250, color: "#3b82f6" },
  { level: 4, name: "Table Tamer", xpRequired: 500, color: "#8b5cf6" },
  { level: 5, name: "Join Journeyman", xpRequired: 800, color: "#f59e0b" },
  { level: 6, name: "Aggregate Ace", xpRequired: 1200, color: "#ef4444" },
  { level: 7, name: "Subquery Sage", xpRequired: 1700, color: "#ec4899" },
  { level: 8, name: "Index Wizard", xpRequired: 2300, color: "#14b8a6" },
  { level: 9, name: "Database Guru", xpRequired: 3000, color: "#f97316" },
  { level: 10, name: "SQL Master", xpRequired: 4000, color: "#ffd700" },
];

export interface TaskAttempt {
  taskId: string;
  attempts: number;
  completed: boolean;
  completedAt?: number;
  timeSpent: number; // in seconds
  firstTry: boolean;
  hintsUsed: number;
  solutionShown: boolean;
}

export interface GameState {
  // Core stats
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  bestStreak: number;

  // Task tracking
  taskAttempts: Record<string, TaskAttempt>;
  completedTasks: string[];

  // Achievements
  unlockedBadges: string[];

  // Session stats
  sessionStartTime: number | null;
  totalTimeSpent: number; // in seconds
  totalAttempts: number;
  correctAttempts: number;

  // Daily stats
  dailyXP: number;
  lastPlayedDate: string | null;
  daysPlayed: number;

  // Current task tracking
  currentTaskStartTime: number | null;
  currentTaskAttempts: number;
  currentHintLevel: number;
  currentSolutionShown: boolean;
}

const initialState: GameState = {
  totalXP: 0,
  currentLevel: 1,
  currentStreak: 0,
  bestStreak: 0,
  taskAttempts: {},
  completedTasks: [],
  unlockedBadges: [],
  sessionStartTime: null,
  totalTimeSpent: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  dailyXP: 0,
  lastPlayedDate: null,
  daysPlayed: 0,
  currentTaskStartTime: null,
  currentTaskAttempts: 0,
  currentHintLevel: 0,
  currentSolutionShown: false,
};

// Helper to calculate level from XP
export function calculateLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

// Helper to get XP for next level
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVELS.length) return LEVELS[LEVELS.length - 1].xpRequired;
  return LEVELS[currentLevel].xpRequired;
}

// Helper to get current level info
export function getLevelInfo(level: number) {
  return LEVELS.find(l => l.level === level) || LEVELS[0];
}

// Calculate points for completing a task
export function calculatePoints(
  isFirstTry: boolean,
  streak: number,
  timeSpent: number, // in seconds
  difficulty: "beginner" | "intermediate" | "advanced" = "beginner"
): number {
  // Base points by difficulty
  const basePoints = {
    beginner: 10,
    intermediate: 20,
    advanced: 35,
  }[difficulty];

  let points = basePoints;

  // First try bonus (50%)
  if (isFirstTry) {
    points += Math.floor(basePoints * 0.5);
  }

  // Streak bonus (10% per streak, max 100%)
  const streakBonus = Math.min(streak * 0.1, 1.0);
  points += Math.floor(basePoints * streakBonus);

  // Speed bonus (if under 30 seconds, up to 50% bonus)
  if (timeSpent < 30) {
    const speedBonus = ((30 - timeSpent) / 30) * 0.5;
    points += Math.floor(basePoints * speedBonus);
  }

  return points;
}

// Calculate XP with hint penalty
export function calculateXPWithPenalty(
  baseXP: number,
  hintLevel: number,
  solutionShown: boolean
): number {
  if (solutionShown) {
    return 0; // No XP if solution was shown
  }

  const penalties = [0, 0.25, 0.5, 0.75]; // 0%, 25%, 50%, 75%
  const penalty = penalties[Math.min(hintLevel, penalties.length - 1)] || 0;

  return Math.floor(baseXP * (1 - penalty));
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // Start a new session
    startSession(state) {
      state.sessionStartTime = Date.now();

      // Check if it's a new day
      const today = new Date().toDateString();
      if (state.lastPlayedDate !== today) {
        state.dailyXP = 0;
        state.lastPlayedDate = today;
        state.daysPlayed += 1;
      }
    },

    // Start tracking a task
    startTask(state, action: PayloadAction<string>) {
      state.currentTaskStartTime = Date.now();
      state.currentTaskAttempts = 0;
      state.currentHintLevel = 0;
      state.currentSolutionShown = false;

      // Initialize task attempt if not exists
      if (!state.taskAttempts[action.payload]) {
        state.taskAttempts[action.payload] = {
          taskId: action.payload,
          attempts: 0,
          completed: false,
          timeSpent: 0,
          firstTry: true,
          hintsUsed: 0,
          solutionShown: false,
        };
      } else {
        // Reset hint tracking for re-attempt
        state.currentHintLevel = state.taskAttempts[action.payload].hintsUsed || 0;
        state.currentSolutionShown = state.taskAttempts[action.payload].solutionShown || false;
      }
    },

    // Use a hint
    useHint(state, action: PayloadAction<{ taskId: string; level: number }>) {
      const { taskId, level } = action.payload;
      state.currentHintLevel = level;

      const taskAttempt = state.taskAttempts[taskId];
      if (taskAttempt) {
        taskAttempt.hintsUsed = Math.max(taskAttempt.hintsUsed || 0, level);
      }
    },

    // Show solution
    showSolution(state, action: PayloadAction<string>) {
      state.currentSolutionShown = true;

      const taskAttempt = state.taskAttempts[action.payload];
      if (taskAttempt) {
        taskAttempt.solutionShown = true;
      }
    },

    // Record an attempt (wrong answer)
    recordAttempt(state, action: PayloadAction<string>) {
      state.currentTaskAttempts += 1;
      state.totalAttempts += 1;

      const taskAttempt = state.taskAttempts[action.payload];
      if (taskAttempt) {
        taskAttempt.attempts += 1;
        if (taskAttempt.attempts > 1) {
          taskAttempt.firstTry = false;
        }
      }

      // Reset streak on wrong answer
      state.currentStreak = 0;
    },

    // Complete a task successfully
    completeTask(
      state,
      action: PayloadAction<{
        taskId: string;
        difficulty?: "beginner" | "intermediate" | "advanced";
        totalTasks?: number;
        topicTasksCompleted?: { topic: string; total: number; completed: number };
      }>
    ) {
      const { taskId, difficulty = "beginner", totalTasks = 114, topicTasksCompleted } = action.payload;

      // Calculate time spent
      const timeSpent = state.currentTaskStartTime
        ? Math.floor((Date.now() - state.currentTaskStartTime) / 1000)
        : 60;

      // Update task attempt
      const taskAttempt = state.taskAttempts[taskId] || {
        taskId,
        attempts: 1,
        completed: false,
        timeSpent: 0,
        firstTry: state.currentTaskAttempts === 0,
        hintsUsed: 0,
        solutionShown: false,
      };

      const isFirstCompletion = !taskAttempt.completed;
      const isFirstTry = taskAttempt.firstTry && state.currentTaskAttempts === 0;
      const hintsUsed = state.currentHintLevel;
      const solutionShown = state.currentSolutionShown;

      taskAttempt.completed = true;
      taskAttempt.completedAt = Date.now();
      taskAttempt.timeSpent += timeSpent;
      taskAttempt.hintsUsed = hintsUsed;
      taskAttempt.solutionShown = solutionShown;
      state.taskAttempts[taskId] = taskAttempt;

      // Only award points for first completion
      if (isFirstCompletion) {
        // Update completed tasks
        if (!state.completedTasks.includes(taskId)) {
          state.completedTasks.push(taskId);
        }

        // Update streak (only if no solution shown)
        if (!solutionShown) {
          state.currentStreak += 1;
          if (state.currentStreak > state.bestStreak) {
            state.bestStreak = state.currentStreak;
          }
        } else {
          // Reset streak if solution was shown
          state.currentStreak = 0;
        }

        // Calculate base XP and apply penalty
        const basePoints = calculatePoints(isFirstTry, state.currentStreak, timeSpent, difficulty);
        const points = calculateXPWithPenalty(basePoints, hintsUsed, solutionShown);
        state.totalXP += points;
        state.dailyXP += points;

        // Update level
        state.currentLevel = calculateLevel(state.totalXP);

        // Update stats
        state.correctAttempts += 1;
        state.totalAttempts += 1;
        state.totalTimeSpent += timeSpent;

        // Check for badges
        const newBadges: string[] = [];

        // First query badge
        if (state.completedTasks.length === 1 && !state.unlockedBadges.includes("first_query")) {
          newBadges.push("first_query");
        }

        // Perfect 10 badge (only without hints/solution)
        const perfectTries = Object.values(state.taskAttempts).filter(
          t => t.completed && t.firstTry && !t.hintsUsed && !t.solutionShown
        ).length;
        if (perfectTries >= 10 && !state.unlockedBadges.includes("perfect_10")) {
          newBadges.push("perfect_10");
        }

        // Streak badges
        if (state.currentStreak >= 5 && !state.unlockedBadges.includes("streak_5")) {
          newBadges.push("streak_5");
        }
        if (state.currentStreak >= 10 && !state.unlockedBadges.includes("streak_10")) {
          newBadges.push("streak_10");
        }
        if (state.currentStreak >= 20 && !state.unlockedBadges.includes("streak_20")) {
          newBadges.push("streak_20");
        }

        // Speed demon badge
        if (timeSpent < 10 && !state.unlockedBadges.includes("speed_demon")) {
          newBadges.push("speed_demon");
        }

        // Progress badges
        const completionRate = state.completedTasks.length / totalTasks;
        if (completionRate >= 0.5 && !state.unlockedBadges.includes("half_way")) {
          newBadges.push("half_way");
        }
        if (completionRate >= 1 && !state.unlockedBadges.includes("completionist")) {
          newBadges.push("completionist");
        }

        // Level badges
        if (state.currentLevel >= 5 && !state.unlockedBadges.includes("level_5")) {
          newBadges.push("level_5");
        }
        if (state.currentLevel >= 10 && !state.unlockedBadges.includes("level_10")) {
          newBadges.push("level_10");
        }

        // Persistent badge (5 attempts before success)
        if (taskAttempt.attempts >= 5 && !state.unlockedBadges.includes("persistent")) {
          newBadges.push("persistent");
        }

        // Time-based badges
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5 && !state.unlockedBadges.includes("night_owl")) {
          newBadges.push("night_owl");
        }
        if (hour >= 5 && hour < 7 && !state.unlockedBadges.includes("early_bird")) {
          newBadges.push("early_bird");
        }

        // Topic master badges
        if (topicTasksCompleted) {
          const { topic, total, completed } = topicTasksCompleted;
          if (completed >= total) {
            if (topic === "select" && !state.unlockedBadges.includes("select_master")) {
              newBadges.push("select_master");
            }
            if (topic === "join" && !state.unlockedBadges.includes("join_master")) {
              newBadges.push("join_master");
            }
            if (topic === "aggregate" && !state.unlockedBadges.includes("aggregate_master")) {
              newBadges.push("aggregate_master");
            }
          }
        }

        // Add new badges
        state.unlockedBadges.push(...newBadges);
      }

      // Reset current task tracking
      state.currentTaskStartTime = null;
      state.currentTaskAttempts = 0;
      state.currentHintLevel = 0;
      state.currentSolutionShown = false;
    },

    // Reset game progress
    resetProgress(state) {
      return { ...initialState, sessionStartTime: Date.now() };
    },

    // Load saved state
    loadState(state, action: PayloadAction<Partial<GameState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  startSession,
  startTask,
  useHint,
  showSolution,
  recordAttempt,
  completeTask,
  resetProgress,
  loadState,
} = gameSlice.actions;

export default gameSlice.reducer;
