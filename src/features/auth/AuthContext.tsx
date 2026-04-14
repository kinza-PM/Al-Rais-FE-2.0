import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { usePasswordRecovery } from "./hooks/usePasswordRecovery";
import { useGuestUser } from "./hooks/useGuestUser";
import { useSessionManager } from "./hooks/useSessionManager";
import { authServiceSingleton } from "../../services/authServiceSingleton";

export type AuthContextValue = ReturnType<typeof buildAuthValue>;

function buildAuthValue(
  authState: ReturnType<typeof useAuthState>,
  guestUserManager: ReturnType<typeof useGuestUser>,
  sessionManager: ReturnType<typeof useSessionManager>,
  authActions: ReturnType<typeof useAuthActions>,
  passwordRecovery: ReturnType<typeof usePasswordRecovery>,
) {
  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isInitializing: authState.isInitializing,
    error: authState.error,
    loading: authState.loading,
    isGuest: authState.isGuest,
    session: authState.session,

    login: authActions.login,
    signup: authActions.signup,
    confirmSignUp: authActions.confirmSignUp,
    resendConfirmationCode: authActions.resendConfirmationCode,
    signOut: authActions.signOut,
    refreshAuth: authActions.refreshAuth,
    clearError: authState.clearError,
    resetAuthState: authState.resetAuthState,

    forgotPassword: passwordRecovery.forgotPassword,
    verifyResetCode: passwordRecovery.verifyResetCode,
    resetPassword: passwordRecovery.resetPassword,

    initializeGuestUser: guestUserManager.initializeGuestUser,
    convertGuestToRegistered: guestUserManager.convertGuestToRegistered,

    checkAuth: sessionManager.checkAuth,
    getCurrentUser: sessionManager.getCurrentUser,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthContextProviderInner({ children }: { children: ReactNode }) {
  const authState = useAuthState();

  const guestUserManager = useGuestUser({
    setGuestState: authState.setGuestState,
    setError: authState.setError,
  });

  const sessionManager = useSessionManager(
    { authCheckCompleted: authState.authCheckCompleted },
    {
      setAuthenticatedState: authState.setAuthenticatedState,
      setInitializationComplete: authState.setInitializationComplete,
      markAuthCheckCompleted: authState.markAuthCheckCompleted,
      initializeGuestUser: guestUserManager.initializeGuestUser,
      resetAuthState: authState.resetAuthState,
      resetAuthCheckCompleted: authState.resetAuthCheckCompleted,
    },
  );

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
    },
  );

  const passwordRecovery = usePasswordRecovery({
    updateLoading: authState.updateLoading,
    setError: authState.setError,
  });

  useEffect(() => {
    const wrapper = async (): Promise<void> => {
      try {
        await authActions.signOut();
      } catch (err) {
        console.error("global signOut wrapper failed:", err);
      }
    };

    authServiceSingleton.registerSignOutCallback(wrapper);

    return () => {
      authServiceSingleton.registerSignOutCallback(null);
    };
  }, [authActions.signOut]);

  const value = buildAuthValue(
    authState,
    guestUserManager,
    sessionManager,
    authActions,
    passwordRecovery,
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/** Mount once at app root so session / guest bootstrap does not run per component. */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContextProviderInner>{children}</AuthContextProviderInner>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
