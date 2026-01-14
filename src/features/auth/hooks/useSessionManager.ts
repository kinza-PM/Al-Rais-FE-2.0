import { useCallback, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { StorageService } from '../../../utils/storage';
import type { User } from '../types';

interface SessionManagerActions {
  setAuthenticatedState: (userData: User) => void;
  setInitializationComplete: () => void;
  markAuthCheckCompleted: () => void;
  initializeGuestUser: () => Promise<void>;
}

interface SessionManagerState {
  authCheckCompleted: boolean;
}

export const useSessionManager = (
  state: SessionManagerState,
  actions: SessionManagerActions
) => {
  const {
    setAuthenticatedState,
    setInitializationComplete,
    markAuthCheckCompleted,
    initializeGuestUser
  } = actions;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (state.authCheckCompleted) return;
        
        await checkAuth();
        markAuthCheckCompleted();
      } catch (error) {
        console.error('🚨 useSessionManager: Error during auth initialization:', error);
        setInitializationComplete();
      }
    };

    initializeAuth();
  }, [state.authCheckCompleted, markAuthCheckCompleted, setInitializationComplete]);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        const currentUser = await AuthService.getCurrentUser();
        
        if (currentUser) {
          setAuthenticatedState(currentUser);
          StorageService.saveUser(currentUser);
        } else {
          await initializeGuestUser();
        }
      } else {
        // ensure any stale auth flags/tokens are removed when session no longer exists
        StorageService.clearAuth();
        await initializeGuestUser();
      }
    } catch (error) {
      console.error('🚨 useSessionManager: Auth check failed:', error);
      await initializeGuestUser();
    } finally {
      setInitializationComplete();
    }
  }, [initializeGuestUser, setAuthenticatedState, setInitializationComplete]);

  // Cross-tab/session synchronization: when auth keys change in another tab, re-check auth.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (
        e.key === "al_rais_auth_status" ||
        e.key === "al_rais_user" ||
        e.key === "al_rais_auth_token"
      ) {
        void checkAuth();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [checkAuth]);

  // Check if user is authenticated
  const isAuthenticated = async () => {
    try {
      return await AuthService.isAuthenticated();
    } catch (error) {
      console.error('🚨 useSessionManager: Authentication check failed:', error);
      return false;
    }
  };

  // Get current authenticated user
  const getCurrentUser = async () => {
    try {
      return await AuthService.getCurrentUser();
    } catch (error) {
      console.error('🚨 useSessionManager: Get current user failed:', error);
      return null;
    }
  };

  // Refresh authentication status
  const refreshAuth = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setAuthenticatedState(currentUser);
          StorageService.saveUser(currentUser);
        }
      }
    } catch (error) {
      console.error('🚨 useSessionManager: Refresh auth failed:', error);
    }
  };

  return {
    checkAuth,
    isAuthenticated,
    getCurrentUser,
    refreshAuth,
  };
}; 