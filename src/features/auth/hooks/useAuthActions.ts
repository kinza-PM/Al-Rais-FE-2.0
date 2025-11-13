import { AuthService } from '../services/authService';
import { StorageService } from '../../../utils/storage';
import * as UserService from '../../../services/api/userService';
import type { User, LoginForm, SignupForm, UserSession } from '../types';

interface AuthState {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: {
    login: boolean;
    signup: boolean;
    logout: boolean;
    forgotPassword: boolean;
    verifyOTP: boolean;
    resetPassword: boolean;
  };
  error: string | null;
  authCheckCompleted: boolean;
}

interface AuthActions {
  setAuthenticatedState: (userData: User) => void;
  resetAuthState: () => void;
  setGuestState: (userData: User, sessionData: UserSession) => void;
  updateLoading: (key: keyof AuthState['loading'], value: boolean) => void;
  setError: (error: string | null) => void;
  resetAuthCheckCompleted: () => void;
  initializeGuestUser: () => Promise<void>;
}

export const useAuthActions = (state: AuthState, actions: AuthActions) => {
  const {
    setAuthenticatedState,
    resetAuthState,
    setGuestState,
    updateLoading,
    setError,
    resetAuthCheckCompleted,
    initializeGuestUser
  } = actions;

  // Sync user with backend
  const syncUserWithBackend = async (userData: User) => {
    try {
      if (userData.email) {
        await UserService.syncCognitoUser({
          email: userData.email,
          name: userData.name || userData.full_name,
        });
      }
    } catch (error) {
      console.error(' useAuthActions: Error syncing user with backend:', error);
    }
  };

  // Login user
  const login = async (credentials: LoginForm) => {
    setError(null);
    updateLoading('login', true);
    
    try {
      const response = await AuthService.signIn(credentials);
      
      if (response.success && response.user) {
        // Clear guest data and sync with backend
        UserService.clearGuestData();
        
        // Sync Cognito user with backend
        const backendData = await UserService.syncCognitoUser({
          email: response.user.email || '',
          name: response.user.name,
        });
        
        if (backendData) {
          const authenticatedUser: User = {
            id: backendData.user.id,
            email: backendData.user.email,
            full_name: backendData.user.full_name,
            phone: backendData.user.phone,
            created_at: backendData.user.created_at,
            updated_at: backendData.user.updated_at,
            last_seen_at: backendData.user.last_seen_at,
            isGuest: false,
          };
          
          setAuthenticatedState(authenticatedUser);
          setGuestState(authenticatedUser, backendData.session);
          
          // Also save to old storage for backwards compatibility
          StorageService.saveUser(authenticatedUser);
        } else {
          // Fallback to AWS Cognito user data
          setAuthenticatedState(response.user);
          syncUserWithBackend(response.user).catch(() => {});
        }
        
        // Auto-reload for clean state
        // window.location.reload();
        
        return { success: true, message: 'Login successful!' };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      updateLoading('login', false);
    }
  };

  // Signup user
  const signup = async (userData: SignupForm) => {
    setError(null);
    updateLoading('signup', true);
    
    try {
      const response = await AuthService.signUp(userData);
      
      if (response.success) {
        // Handle case where user needs email confirmation
        if (response.requiresConfirmation) {
          return { 
            success: true, 
            message: response.message,
            requiresConfirmation: true 
          };
        }
        
        // Handle case where signup is complete and user exists
        if (response.user) {
          // Check if user was a guest and needs conversion
          const isGuest = UserService.isGuestUser();
          
          if (isGuest) {
            const convertedUser = await UserService.convertGuestToRegistered({
              email: userData.email,
              full_name: userData.name,
            });
            
            if (convertedUser) {
              const authenticatedUser: User = {
                id: convertedUser.id,
                email: convertedUser.email,
                full_name: convertedUser.full_name,
                phone: convertedUser.phone,
                created_at: convertedUser.created_at,
                updated_at: convertedUser.updated_at,
                last_seen_at: convertedUser.last_seen_at,
                isGuest: false,
              };
              
              setAuthenticatedState(authenticatedUser);
              
              // Also save to old storage for backwards compatibility
              StorageService.saveUser(authenticatedUser);
            }
          }
          
          // Auto-login after signup
          const loginResponse = await AuthService.signIn({
            email: userData.email,
            password: userData.password
          });
          
          if (loginResponse.success && loginResponse.user) {
            // Clear guest data and sync with backend
            UserService.clearGuestData();
            
            // Sync Cognito user with backend
            const backendData = await UserService.syncCognitoUser({
              email: loginResponse.user.email || '',
              name: loginResponse.user.name,
            });
            
            if (backendData) {
              const authenticatedUser: User = {
                id: backendData.user.id,
                email: backendData.user.email,
                full_name: backendData.user.full_name,
                phone: backendData.user.phone,
                created_at: backendData.user.created_at,
                updated_at: backendData.user.updated_at,
                last_seen_at: backendData.user.last_seen_at,
                isGuest: false,
              };
              
              setAuthenticatedState(authenticatedUser);
              setGuestState(authenticatedUser, backendData.session);
              
              // Also save to old storage for backwards compatibility
              StorageService.saveUser(authenticatedUser);
            } else {
              // Fallback to AWS Cognito user data
              setAuthenticatedState(loginResponse.user);
              syncUserWithBackend(loginResponse.user).catch(() => {});
            }
            
            // Auto-reload for clean state
            window.location.reload();
            
            return { success: true, message: 'Account created and logged in successfully!' };
          } else {
            return { success: true, message: 'Account created successfully! Please login to continue.' };
          }
        }
        
        // Fallback for other successful cases
        return { success: true, message: response.message || 'Account created successfully!' };
      } else {
        // Handle failure cases
        setError(response.message || 'Signup failed');
        return { success: false, message: response.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = 'Signup failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      updateLoading('signup', false);
    }
  };

  // Confirm signup
  const confirmSignUp = async (email: string, confirmationCode: string, password?: string) => {
    setError(null);
    
    try {
      const response = await AuthService.confirmSignUp(email, confirmationCode);
      
      if (response.success) {
        if (password) {          
          const loginResponse = await AuthService.signIn({
            email: email,
            password: password,
          });
          
          if (loginResponse.success && loginResponse.user) {
            setAuthenticatedState(loginResponse.user);
            
            // Sync with backend
            syncUserWithBackend(loginResponse.user).catch(() => {});
            
            // Auto-reload page
            // window.location.reload();
            
            return { success: true, message: 'Account confirmed and logged in successfully!' };
          } else {
            resetAuthState();
          }
        }
        
        return { success: true, message: 'Account confirmed! Please login to continue.' };
      } else {
        setError(response.message || 'Confirmation failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('OTP confirmation error:', error);
      const errorMessage = 'Confirmation failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Resend confirmation code
  const resendConfirmationCode = async (email: string) => {
    setError(null);
    
    try {
      const response = await AuthService.resendConfirmationCode(email);
      return response;
    } catch (error) {
      console.error('Resend error:', error);
      const errorMessage = 'Failed to resend code. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Sign out
  const signOut = async () => {
    updateLoading('logout', true);
    
    try {
      // Clear AWS session (only if not a guest user)
      if (!state.isGuest) {
        await AuthService.signOut();
      }
      // Clear all authentication state
      resetAuthState();
      UserService.clearGuestData();
      StorageService.clearAuth();
      
      // Create new guest user after logout
      resetAuthCheckCompleted(); // Allow re-initialization
      await initializeGuestUser();

      setError(null);
      
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if AWS signOut fails
      resetAuthState();
      UserService.clearGuestData();
      resetAuthCheckCompleted();
      StorageService.clearAuth();
      // Try to create guest user even if logout had errors
      try {
        await initializeGuestUser();
      } catch (guestError) {
        console.error('Failed to create guest user after logout:', guestError);
      }
      return { success: true, message: 'Logout completed (with warnings)' };
    } finally {
      updateLoading('logout', false);
    }
  };

  // Refresh auth
  const refreshAuth = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setAuthenticatedState(currentUser);
        } else {
          resetAuthState();
        }
      } else {
        resetAuthState();
      }
    } catch (error) {
      console.error('Refresh error:', error);
      resetAuthState();
    }
  };

  return {
    login,
    signup,
    confirmSignUp,
    resendConfirmationCode,
    signOut,
    refreshAuth,
  };
}; 