/**
 * Progress Synchronization Hook
 * Syncs local game state with server when user is authenticated
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loadState, GameState } from '../store/reducers/gameReducer';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserProgress,
  saveTaskProgress,
  saveUserStats,
  saveBulkProgress,
  TaskProgress,
  UserStatsData,
} from '../lib/authApi';

// Convert server progress to local format
function serverToLocalProgress(serverProgress: TaskProgress[]): Partial<GameState> {
  const taskAttempts: GameState['taskAttempts'] = {};
  const completedTasks: string[] = [];

  for (const p of serverProgress) {
    taskAttempts[p.task_id] = {
      taskId: p.task_id,
      attempts: p.attempts,
      completed: p.is_completed,
      completedAt: p.completed_at ? new Date(p.completed_at).getTime() : undefined,
      timeSpent: Math.floor((p.execution_time_ms || 0) / 1000),
      firstTry: p.attempts <= 1 && !p.hints_used && !p.solution_revealed,
      hintsUsed: p.hints_used,
      solutionShown: p.solution_revealed,
    };

    if (p.is_completed) {
      completedTasks.push(p.task_id);
    }
  }

  return { taskAttempts, completedTasks };
}

// Convert server stats to local format
function serverToLocalStats(serverStats: UserStatsData | null): Partial<GameState> {
  if (!serverStats) return {};

  return {
    totalXP: serverStats.total_xp,
    currentLevel: serverStats.level,
    currentStreak: serverStats.current_streak,
    bestStreak: serverStats.longest_streak,
    unlockedBadges: serverStats.badges || [],
  };
}

// Convert local task to server format
function localToServerProgress(
  taskId: string,
  attempt: GameState['taskAttempts'][string],
  databaseId: string
): TaskProgress {
  return {
    task_id: taskId,
    database_id: databaseId,
    is_completed: attempt.completed,
    completed_at: attempt.completedAt ? new Date(attempt.completedAt).toISOString() : undefined,
    score: attempt.completed ? 100 : 0,
    xp_earned: attempt.completed ? 10 : 0, // Will be calculated properly by server
    attempts: attempt.attempts,
    hints_used: attempt.hintsUsed,
    solution_revealed: attempt.solutionShown,
    best_query: undefined,
    execution_time_ms: attempt.timeSpent * 1000,
  };
}

export function useProgressSync() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const gameState = useAppSelector((state) => state.game);
  const lastSyncRef = useRef<number>(0);
  const syncInProgressRef = useRef<boolean>(false);

  // Load progress from server when user logs in
  const loadFromServer = useCallback(async () => {
    if (!isAuthenticated || syncInProgressRef.current) return;

    try {
      syncInProgressRef.current = true;
      const serverData = await getUserProgress();
      
      if (serverData) {
        const progressData = serverToLocalProgress(serverData.progress);
        const statsData = serverToLocalStats(serverData.stats);

        // Merge with existing local data (prefer server for completed tasks)
        const mergedState: Partial<GameState> = {
          ...progressData,
          ...statsData,
        };

        // Merge task attempts - keep local attempts that aren't on server
        const localAttempts = gameState.taskAttempts;
        const serverAttempts = progressData.taskAttempts || {};
        
        const mergedAttempts = { ...localAttempts };
        for (const [taskId, serverAttempt] of Object.entries(serverAttempts)) {
          const localAttempt = localAttempts[taskId];
          
          // If server has completion and local doesn't, use server
          // If both have completion, use server
          // If only local has it, keep local
          if (serverAttempt.completed || !localAttempt?.completed) {
            mergedAttempts[taskId] = serverAttempt;
          }
        }
        mergedState.taskAttempts = mergedAttempts;

        // Merge completed tasks
        const mergedCompleted = new Set([
          ...(gameState.completedTasks || []),
          ...(progressData.completedTasks || []),
        ]);
        mergedState.completedTasks = Array.from(mergedCompleted);

        // Merge badges
        const mergedBadges = new Set([
          ...(gameState.unlockedBadges || []),
          ...(statsData.unlockedBadges || []),
        ]);
        mergedState.unlockedBadges = Array.from(mergedBadges);

        // Use higher values for XP and streaks
        if (statsData.totalXP !== undefined) {
          mergedState.totalXP = Math.max(gameState.totalXP || 0, statsData.totalXP);
        }
        if (statsData.bestStreak !== undefined) {
          mergedState.bestStreak = Math.max(gameState.bestStreak || 0, statsData.bestStreak);
        }

        dispatch(loadState(mergedState));
        lastSyncRef.current = Date.now();
      }
    } catch (error) {
      console.error('Failed to load progress from server:', error);
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isAuthenticated, dispatch, gameState.taskAttempts, gameState.completedTasks, gameState.unlockedBadges, gameState.totalXP, gameState.bestStreak]);

  // Save a single task progress to server
  const saveTaskToServer = useCallback(async (
    taskId: string,
    databaseId: string = 'unknown'
  ) => {
    if (!isAuthenticated) return;

    const attempt = gameState.taskAttempts[taskId];
    if (!attempt) return;

    try {
      const progress = localToServerProgress(taskId, attempt, databaseId);
      await saveTaskProgress(progress);
    } catch (error) {
      console.error('Failed to save task progress:', error);
    }
  }, [isAuthenticated, gameState.taskAttempts]);

  // Save all stats to server
  const saveStatsToServer = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const stats: UserStatsData = {
        total_xp: gameState.totalXP,
        total_score: gameState.completedTasks.length * 100,
        tasks_completed: gameState.completedTasks.length,
        tasks_attempted: Object.keys(gameState.taskAttempts).length,
        current_streak: gameState.currentStreak,
        longest_streak: gameState.bestStreak,
        level: gameState.currentLevel,
        badges: gameState.unlockedBadges,
      };
      await saveUserStats(stats);
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }, [isAuthenticated, gameState]);

  // Sync all progress to server
  const syncAllToServer = useCallback(async () => {
    if (!isAuthenticated || syncInProgressRef.current) return;

    try {
      syncInProgressRef.current = true;

      // Save all task progress
      const progressList: TaskProgress[] = [];
      for (const [taskId, attempt] of Object.entries(gameState.taskAttempts)) {
        const databaseId = taskId.split('_')[0] || 'unknown';
        progressList.push(localToServerProgress(taskId, attempt, databaseId));
      }

      if (progressList.length > 0) {
        await saveBulkProgress(progressList);
      }

      // Save stats
      await saveStatsToServer();
      
      lastSyncRef.current = Date.now();
    } catch (error) {
      console.error('Failed to sync all progress:', error);
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isAuthenticated, gameState.taskAttempts, saveStatsToServer]);

  // Load from server when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFromServer();
    }
  }, [isAuthenticated, user?.id]);

  // Auto-save periodically when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // Only sync if there have been changes (check if last sync was more than 30 seconds ago)
      const now = Date.now();
      if (now - lastSyncRef.current > 30000) {
        syncAllToServer();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, syncAllToServer]);

  // Save on window close/refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleBeforeUnload = () => {
      // Use navigator.sendBeacon for reliable save on close
      const stats: UserStatsData = {
        total_xp: gameState.totalXP,
        total_score: gameState.completedTasks.length * 100,
        tasks_completed: gameState.completedTasks.length,
        tasks_attempted: Object.keys(gameState.taskAttempts).length,
        current_streak: gameState.currentStreak,
        longest_streak: gameState.bestStreak,
        level: gameState.currentLevel,
        badges: gameState.unlockedBadges,
      };

      const token = localStorage.getItem('sql4data_access_token');
      if (token) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        navigator.sendBeacon(
          `${apiUrl}/api/progress/stats`,
          new Blob([JSON.stringify(stats)], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, gameState]);

  return {
    loadFromServer,
    saveTaskToServer,
    saveStatsToServer,
    syncAllToServer,
  };
}
