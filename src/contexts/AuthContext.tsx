/**
 * Auth Context for SQL4DATA
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  DailyLimits,
  getCurrentUser,
  getDailyLimits,
  logout as apiLogout,
  initiateOAuthLogin,
  handleOAuthCallback,
  isAuthenticated,
  clearTokens,
} from '../lib/authApi';

interface AuthContextType {
  // User state
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;

  // Daily limits
  limits: DailyLimits | null;

  // Actions
  login: (provider: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshLimits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [limits, setLimits] = useState<DailyLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for OAuth callback on mount
  useEffect(() => {
    const wasCallback = handleOAuthCallback();
    if (wasCallback) {
      // Refresh user after OAuth callback
      refreshUser();
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated()) {
          const userData = await getCurrentUser();
          setUser(userData);

          if (userData) {
            const limitsData = await getDailyLimits();
            setLimits(limitsData);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const refreshLimits = useCallback(async () => {
    try {
      const limitsData = await getDailyLimits();
      setLimits(limitsData);
    } catch (error) {
      console.error('Failed to refresh limits:', error);
    }
  }, []);

  const login = useCallback(async (provider: 'google' | 'github') => {
    try {
      const authUrl = await initiateOAuthLogin(provider);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setLimits(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPremium: user?.is_premium ?? false,
    limits,
    login,
    logout,
    refreshUser,
    refreshLimits,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking if a feature can be used
export function useCanUseFeature(feature: 'ai_feedback' | 'hints_level3' | 'solution_reveals'): {
  canUse: boolean;
  remaining: number;
  isPremium: boolean;
} {
  const { limits, isPremium } = useAuth();

  if (isPremium || !limits) {
    return { canUse: true, remaining: -1, isPremium };
  }

  const featureLimit = limits[feature];
  return {
    canUse: featureLimit.available > 0,
    remaining: featureLimit.available,
    isPremium: false,
  };
}
