import { useState, useRef } from 'react';
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

  // Helper functions to update state
  const updateLoading = (key: keyof LoadingState, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const clearError = () => setError(null);

  const setAuthenticatedState = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const resetAuthState = () => {
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
    setIsGuest(false);
    setError(null);
  };

  const setGuestState = (userData: User, sessionData: UserSession) => {
    setUser(userData);
    setSession(sessionData);
    setIsGuest(true);
    setIsAuthenticated(false);
  };

  const setInitializationComplete = () => {
    setIsInitializing(false);
  };

  const markAuthCheckCompleted = () => {
    authCheckCompleted.current = true;
  };

  const resetAuthCheckCompleted = () => {
    authCheckCompleted.current = false;
  };

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