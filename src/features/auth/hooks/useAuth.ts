import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { usePasswordRecovery } from './usePasswordRecovery';
import { useGuestUser } from './useGuestUser';
import { useSessionManager } from './useSessionManager';

export const useAuth = () => {
  // Initialize auth state
  const authState = useAuthState();

  // Initialize guest user management
  const guestUserManager = useGuestUser({
    setGuestState: authState.setGuestState,
    setError: authState.setError,
  });

  // Initialize session management
  const sessionManager = useSessionManager(
    { authCheckCompleted: authState.authCheckCompleted },
    {
      setAuthenticatedState: authState.setAuthenticatedState,
      setInitializationComplete: authState.setInitializationComplete,
      markAuthCheckCompleted: authState.markAuthCheckCompleted,
      initializeGuestUser: guestUserManager.initializeGuestUser,
    }
  );

  // Initialize authentication actions
  const authActions = useAuthActions(
    {
      user: authState.user,
      session: authState.session,
      isAuthenticated: authState.isAuthenticated,
      isGuest: authState.isGuest,
      loading: authState.loading,
      error: authState.error,
      authCheckCompleted: authState.authCheckCompleted,
    },
    {
      setAuthenticatedState: authState.setAuthenticatedState,
      resetAuthState: authState.resetAuthState,
      setGuestState: authState.setGuestState,
      updateLoading: authState.updateLoading,
      setError: authState.setError,
      resetAuthCheckCompleted: authState.resetAuthCheckCompleted,
      initializeGuestUser: guestUserManager.initializeGuestUser,
    }
  );

  // Initialize password recovery
  const passwordRecovery = usePasswordRecovery({
    updateLoading: authState.updateLoading,
    setError: authState.setError,
  });

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isInitializing: authState.isInitializing,
    error: authState.error,
    loading: authState.loading,
    // Guest user state
    isGuest: authState.isGuest,
    session: authState.session,
    
    // Authentication actions
    login: authActions.login,
    signup: authActions.signup,
    confirmSignUp: authActions.confirmSignUp,
    resendConfirmationCode: authActions.resendConfirmationCode,
    signOut: authActions.signOut,
    refreshAuth: authActions.refreshAuth,
    clearError: authState.clearError,
    
    // Password recovery actions
    forgotPassword: passwordRecovery.forgotPassword,
    verifyResetCode: passwordRecovery.verifyResetCode,
    resetPassword: passwordRecovery.resetPassword,
    
    // Guest user actions
    initializeGuestUser: guestUserManager.initializeGuestUser,
    convertGuestToRegistered: guestUserManager.convertGuestToRegistered,
    
    // Session management
    checkAuth: sessionManager.checkAuth,
    getCurrentUser: sessionManager.getCurrentUser,
  };
}; 