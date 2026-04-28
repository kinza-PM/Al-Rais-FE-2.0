import { useState, useRef, useCallback } from 'react';
import type { User, UserSession } from '../types';

interface LoadingState {
  login: boolean;
  signup: boolean;
  logout: boolean;
  forgotPassword: boolean;
  verifyOTP: boolean;
  resetPassword: boolean;
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    login: false,
    signup: false,
    logout: false,
    forgotPassword: false,
    verifyOTP: false,
    resetPassword: false,
  });
  const [isGuest, setIsGuest] = useState(false);
  
  // Use ref to track if auth check has completed
  const authCheckCompleted = useRef(false);

  // Stable identities — these are listed in useEffect deps across auth hooks; inline
  // functions caused the session init effect to re-run every render and flood /users.
  const updateLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const setAuthenticatedState = useCallback((userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsGuest(false);
  }, []);

  const resetAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
    setIsGuest(false);
    setError(null);
  }, []);

  const setGuestState = useCallback((userData: User, sessionData: UserSession) => {
    setUser(userData);
    setSession(sessionData);
    setIsGuest(true);
    setIsAuthenticated(false);
  }, []);

  const setInitializationComplete = useCallback(() => {
    setIsInitializing(false);
  }, []);

  const markAuthCheckCompleted = useCallback(() => {
    authCheckCompleted.current = true;
  }, []);

  const resetAuthCheckCompleted = useCallback(() => {
    authCheckCompleted.current = false;
  }, []);

  return {
    // State
    user,
    session,
    isAuthenticated,
    isInitializing,
    error,
    loading,
    isGuest,
    authCheckCompleted: authCheckCompleted.current,
    
    // State setters
    setUser,
    setSession,
    setIsAuthenticated,
    setIsInitializing,
    setError,
    setLoading,
    setIsGuest,
    
    // Helper functions
    updateLoading,
    clearError,
    setAuthenticatedState,
    resetAuthState,
    setGuestState,
    setInitializationComplete,
    markAuthCheckCompleted,
    resetAuthCheckCompleted,
  };
}; 