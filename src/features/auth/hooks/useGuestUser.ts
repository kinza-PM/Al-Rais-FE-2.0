import * as UserService from '../../../services/api/userService';
import type { User, UserSession } from '../types';

interface GuestUserActions {
  setGuestState: (userData: User, sessionData: UserSession) => void;
  setError: (error: string | null) => void;
}

export const useGuestUser = (actions: GuestUserActions) => {
  const { setGuestState, setError } = actions;

  // Initialize guest user
  const initializeGuestUser = async () => {
    try {
      const guestData = await UserService.initializeGuestUser();
      
      if (guestData) {
        const guestUser: User = {
          id: guestData.user.id,
          email: guestData.user.email,
          full_name: guestData.user.full_name,
          phone: guestData.user.phone,
          created_at: guestData.user.created_at,
          updated_at: guestData.user.updated_at,
          last_seen_at: guestData.user.last_seen_at,
          isGuest: true,
        };
        
        setGuestState(guestUser, guestData.session);
      } else {
        console.error(' useGuestUser: Failed to initialize guest user');
        // setError('Failed to initialize guest session');
      }
    } catch (error) {
      console.error(' useGuestUser: Error initializing guest user:', error);
      // setError('Failed to initialize guest session');
    }
  };

  // Get current guest user data
  const getGuestUserData = () => {
    return UserService.getGuestUser();
  };

  // Get current guest session
  const getGuestSession = () => {
    return UserService.getGuestSession();
  };

  // Check if current user is a guest
  const isGuestUser = () => {
    return UserService.isGuestUser();
  };

  // Clear guest data
  const clearGuestData = () => {
    UserService.clearGuestData();
  };

  // Convert guest to registered user
  const convertGuestToRegistered = async (userDetails: { email: string; full_name?: string; phone?: string }) => {
    try {
      const convertedUser = await UserService.convertGuestToRegistered(userDetails);
      
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
        
        return authenticatedUser;
      }
      
      return null;
    } catch (error) {
      console.error(' useGuestUser: Error converting guest user:', error);
      setError('Failed to convert guest user');
      return null;
    }
  };

  // Extend guest session
  const extendGuestSession = async () => {
    try {
      await UserService.extendSession();
    } catch (error) {
      console.error(' useGuestUser: Error extending guest session:', error);
    }
  };

  return {
    initializeGuestUser,
    getGuestUserData,
    getGuestSession,
    isGuestUser,
    clearGuestData,
    convertGuestToRegistered,
    extendGuestSession,
  };
}; 