/**
 * Authentication API client for SQL4DATA
 * Handles OAuth login, token management, and user operations
 */

const API_BASE_URL = 'http://localhost:8001';

// Token storage keys
const ACCESS_TOKEN_KEY = 'sql4data_access_token';
const REFRESH_TOKEN_KEY = 'sql4data_refresh_token';

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store tokens after login
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * Clear tokens on logout
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Get authorization headers
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

// User types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  subscription_tier: 'free' | 'premium';
  created_at: string;
  gdpr_consent: boolean;
}

export interface DailyLimits {
  is_premium: boolean;
  ai_feedback: {
    used: number;
    limit: number;
    available: number;
  };
  hints_level3: {
    used: number;
    limit: number;
    available: number;
  };
  solution_reveals: {
    used: number;
    limit: number;
    available: number;
  };
  ads_watched_today: number;
  resets_at: string;
}

export interface UnlockResponse {
  success: boolean;
  unlock_type: string;
  amount_unlocked: number;
  new_limit: number;
  message: string;
}

/**
 * Initiate OAuth login flow
 */
export async function initiateOAuthLogin(provider: 'google' | 'github'): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login/${provider}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `Failed to initiate ${provider} login`);
  }

  const data = await response.json();
  return data.auth_url;
}

/**
 * Development-only login (for testing without OAuth)
 */
export async function devLogin(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Dev login failed');
  }

  const data = await response.json();
  setTokens(data.access_token, data.refresh_token);
  return data.user;
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearTokens();
        return null;
      }
      throw new Error('Failed to get user info');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } finally {
    clearTokens();
  }
}

/**
 * Get daily limits
 */
export async function getDailyLimits(): Promise<DailyLimits> {
  const response = await fetch(`${API_BASE_URL}/api/ads/limits`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to get daily limits');
  }

  return response.json();
}

/**
 * Unlock feature by watching ad
 */
export async function unlockFeature(
  unlockType: 'ai_feedback' | 'hints_level3' | 'solution_reveals'
): Promise<UnlockResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ads/unlock`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      unlock_type: unlockType,
      ad_unit_completed: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to unlock feature');
  }

  return response.json();
}

/**
 * Record feature usage
 */
export async function useFeature(
  featureType: 'ai_feedback' | 'hints_level3' | 'solution_reveals'
): Promise<{ success: boolean; remaining: number }> {
  const response = await fetch(`${API_BASE_URL}/api/ads/use/${featureType}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Feature limit reached');
  }

  return response.json();
}

/**
 * Update GDPR consent
 */
export async function updateGDPRConsent(consent: boolean): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/gdpr-consent`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ consent }),
  });

  if (!response.ok) {
    throw new Error('Failed to update GDPR consent');
  }
}

/**
 * Handle OAuth callback - extract tokens from URL
 */
export function handleOAuthCallback(): boolean {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const refresh = params.get('refresh');

  if (token) {
    setTokens(token, refresh || undefined);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }

  return false;
}

// Progress types
export interface TaskProgress {
  task_id: string;
  database_id: string;
  is_completed: boolean;
  completed_at?: string;
  score: number;
  xp_earned: number;
  attempts: number;
  hints_used: number;
  solution_revealed: boolean;
  best_query?: string;
  execution_time_ms?: number;
}

export interface UserStatsData {
  total_xp: number;
  total_score: number;
  tasks_completed: number;
  tasks_attempted: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  badges: string[];
}

export interface UserProgressResponse {
  progress: TaskProgress[];
  stats: UserStatsData | null;
}

/**
 * Get all user progress from server
 */
export async function getUserProgress(): Promise<UserProgressResponse | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearTokens();
        return null;
      }
      throw new Error('Failed to get user progress');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
}

/**
 * Save task progress to server
 */
export async function saveTaskProgress(progress: TaskProgress): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/task`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(progress),
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving task progress:', error);
    return false;
  }
}

/**
 * Save multiple task progress records at once (for syncing)
 */
export async function saveBulkProgress(progressList: TaskProgress[]): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ progress: progressList }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving bulk progress:', error);
    return false;
  }
}

/**
 * Save user stats to server
 */
export async function saveUserStats(stats: UserStatsData): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/stats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stats),
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving user stats:', error);
    return false;
  }
}

/**
 * Get user stats from server
 */
export async function getUserStats(): Promise<UserStatsData | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}

/**
 * Reset all user progress
 */
export async function resetUserProgress(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/reset`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return response.ok;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
}
