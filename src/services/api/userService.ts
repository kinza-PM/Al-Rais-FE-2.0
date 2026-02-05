import * as ApiClient from "./apiClient";
import { LocalStorageService } from "../storage/localStorageService";
import * as GuestUserService from "./guestUserService";
import * as SessionService from "./sessionService";
import * as UserProfileService from "./userProfileService";

// Re-export types for compatibility
export type { ApiResponse } from "../../types/ApiClientTypes";

export type {
  GuestUser,
  UserSession,
  CreateUserRequest,
  UpdateUserRequest,
  CreateUserResponse,
} from "../../types/GuestUserTypes";

export type {
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  CognitoUserData,
  SyncUserResponse,
} from "../../types/ProfileServiceTypes";

export type {
  CreateSessionRequest,
  UpdateSessionRequest,
} from "../../types/SessionServiceTypes";

// Import types for function parameters
import type { UpdateSessionRequest } from "../../types/SessionServiceTypes";

// ========== GUEST USER OPERATIONS ==========

export const createGuestUser = GuestUserService.createGuestUser;
export const getGuestUser = GuestUserService.getGuestUser;
export const getGuestSession = GuestUserService.getGuestSession;
export const isGuestUser = GuestUserService.isGuestUser;
export const getUserId = GuestUserService.getUserId;
export const getSessionId = GuestUserService.getSessionId;
export const convertGuestToRegistered =
  GuestUserService.convertGuestToRegistered;
export const clearGuestData = GuestUserService.clearGuestData;
export const clearInvalidSessionData = GuestUserService.clearInvalidSessionData;
export const initializeGuestUser = GuestUserService.initializeGuestUser;

// ========== SESSION OPERATIONS ==========

export const isSessionValid = SessionService.validateCurrentSession;

export const updateSession = async (updates: UpdateSessionRequest) => {
  const sessionId = SessionService.getCurrentSessionId();
  if (!sessionId) return false;
  const result = await SessionService.updateSession(sessionId, updates);
  return result !== null;
};

export const extendSession = SessionService.extendCurrentSession;

// ========== USER PROFILE OPERATIONS ==========

export const createUserProfile = UserProfileService.createUserProfile;
export const getUserProfileById = UserProfileService.getUserProfileById;
export const getUserProfileByEmail = UserProfileService.getUserProfileByEmail;
export const getCurrentUserProfileId = UserProfileService.getCurrentUserId;
export const syncCognitoUser = UserProfileService.syncCognitoUser;
export const updateUserProfile = UserProfileService.updateCurrentUserProfile;
export const getCurrentUserProfile = UserProfileService.getCurrentUserProfile;
export const refreshCurrentUserProfile =
  UserProfileService.refreshCurrentUserProfile;
export const getUserDisplayName = UserProfileService.getUserDisplayName;
export const isProfileComplete = UserProfileService.isProfileComplete;
export const getProfileCompletionPercentage =
  UserProfileService.getProfileCompletionPercentage;

// ========== STORAGE OPERATIONS ==========

export const clearUserData = LocalStorageService.clearUserData;
export const clearAllData = LocalStorageService.clearAlRaisData;
export const isStorageAvailable = LocalStorageService.isAvailable;

export const getStorageInfo = () => ({
  size: LocalStorageService.getStorageSize(),
  keys: LocalStorageService.getAlRaisKeys(),
  isAvailable: LocalStorageService.isAvailable(),
});

// ========== UTILITY FUNCTIONS ==========

export const getApiClient = () => ApiClient;

export const getCurrentSessionInfo = () => ({
  session: SessionService.getCurrentSession(),
  sessionId: SessionService.getCurrentSessionId(),
  isGuest: SessionService.isGuestSession(),
  isExpired: SessionService.isSessionExpired(),
  expiration: SessionService.getSessionExpiration(),
  timeUntilExpiration: SessionService.getTimeUntilExpiration(),
});

export const getCurrentUserInfo = () => ({
  profile: UserProfileService.getCurrentUserProfile(),
  userId: UserProfileService.getCurrentUserId(),
  displayName: UserProfileService.getUserDisplayName(),
  isProfileComplete: UserProfileService.isProfileComplete(),
  completionPercentage: UserProfileService.getProfileCompletionPercentage(),
  hasProfile: UserProfileService.hasCurrentUserProfile(),
});

export const performCompleteCleanup = async () => {
  try {
    LocalStorageService.clearAlRaisData();
    SessionService.clearCurrentSession();
    UserProfileService.clearCurrentUserProfile();
    console.log("✅ performCompleteCleanup: Success");
    return true;
  } catch (error) {
    console.error(" performCompleteCleanup: Error", error);
    return false;
  }
};

export const initializeUserSystem = async () => {
  try {
    console.log("🔄 Initializing user system...");
    if (!LocalStorageService.isAvailable()) {
      console.error(" localStorage not available");
      return null;
    }

    const guestData = await GuestUserService.initializeGuestUser();
    if (guestData) {
      console.log("✅ Initialized user system");
      return guestData;
    }

    console.error(" Failed to initialize user system");
    return null;
  } catch (error) {
    console.error(" Error initializing user system:", error);
    return null;
  }
};

export const getSystemHealthStatus = async () => {
  try {
    const storage = LocalStorageService.isAvailable();
    const session = await SessionService.validateCurrentSession();
    const userProfile = UserProfileService.hasCurrentUserProfile();

    return {
      storage: {
        available: storage,
        size: storage ? LocalStorageService.getStorageSize() : 0,
        keys: storage ? LocalStorageService.getAlRaisKeys().length : 0,
      },
      session: {
        valid: session,
        isGuest: SessionService.isGuestSession(),
        expired: SessionService.isSessionExpired(),
        timeUntilExpiration: SessionService.getTimeUntilExpiration(),
      },
      userProfile: {
        exists: userProfile,
        complete: UserProfileService.isProfileComplete(),
        completionPercentage:
          UserProfileService.getProfileCompletionPercentage(),
      },
      overall: storage && (session || userProfile),
    };
  } catch (error) {
    console.error(" Error getting system health status:", error);
    return {
      storage: { available: false, size: 0, keys: 0 },
      session: {
        valid: false,
        isGuest: true,
        expired: true,
        timeUntilExpiration: 0,
      },
      userProfile: { exists: false, complete: false, completionPercentage: 0 },
      overall: false,
    };
  }
};
