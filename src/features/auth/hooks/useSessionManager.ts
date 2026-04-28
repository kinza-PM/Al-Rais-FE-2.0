import { useCallback, useEffect, useRef } from 'react';
import { AuthService } from '../services/authService';
import { StorageService } from '../../../utils/storage';
import { TokenService } from '../../../services/tokenService';
import type { User } from '../types';

interface SessionManagerActions {
  setAuthenticatedState: (userData: User) => void;
  setInitializationComplete: () => void;
  markAuthCheckCompleted: () => void;
  initializeGuestUser: () => Promise<void>;
  resetAuthState: () => void;
  resetAuthCheckCompleted: () => void;
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
    initializeGuestUser,
    resetAuthState,
    resetAuthCheckCompleted
  } = actions;

  // Check authentication status (declared before mount effect so deps and closures are valid)
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

  // Store latest function references in refs to ensure listener is registered only once
  const resetAuthStateRef = useRef(resetAuthState);
  const resetAuthCheckCompletedRef = useRef(resetAuthCheckCompleted);
  const initializeGuestUserRef = useRef(initializeGuestUser);
  const checkAuthRef = useRef(checkAuth);

  // Initialize auth state once per "not yet completed" cycle. Dependencies must stay
  // referentially stable (useAuthState/useGuestUser useCallback); otherwise this effect
  // re-ran every render and spammed POST /users for guest creation.
  useEffect(() => {
    if (state.authCheckCompleted) return;

    const initializeAuth = async () => {
      try {
        await checkAuth();
        markAuthCheckCompleted();
      } catch (error) {
        console.error('🚨 useSessionManager: Error during auth initialization:', error);
        setInitializationComplete();
      }
    };

    void initializeAuth();
  }, [state.authCheckCompleted, checkAuth, markAuthCheckCompleted, setInitializationComplete]);

  // Update refs when functions change
  useEffect(() => {
    resetAuthStateRef.current = resetAuthState;
    resetAuthCheckCompletedRef.current = resetAuthCheckCompleted;
    initializeGuestUserRef.current = initializeGuestUser;
    checkAuthRef.current = checkAuth;
  }, [resetAuthState, resetAuthCheckCompleted, initializeGuestUser, checkAuth]);

  // Cross-tab/session synchronization: when auth keys change in another tab, re-check auth.
  // Listener is registered only once and uses refs to access latest functions
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      
      // Handle logout from another tab - must be immediate and synchronous
      if (e.key === "logout" && e.newValue) {
        // Immediately clear in-memory auth state (React state)
        resetAuthStateRef.current();
        // Clear localStorage and tokens
        StorageService.clearAuth();
        TokenService.clearToken();
        // Reset auth check to allow re-initialization
        resetAuthCheckCompletedRef.current();
        // Initialize guest user to maintain app functionality
        void initializeGuestUserRef.current();
        return;
      }
      
      // Handle login/auth changes from another tab
      if (
        e.key === "al_rais_auth_status" ||
        e.key === "al_rais_user" ||
        e.key === "al_rais_auth_token"
      ) {
        void checkAuthRef.current();
      }
    };
    
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []); // Empty dependency array - listener registered only once

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