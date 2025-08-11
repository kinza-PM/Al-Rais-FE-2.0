import type {
  CognitoUserData,
  CreateUserProfileRequest,
  SyncUserResponse,
  UpdateUserProfileRequest,
  UserProfile,
} from '../../types/profileServiceTypes';
import { LocalStorageService } from "../storage/localStorageService";
import * as ApiClient from "./apiClient";
import * as SessionService from "./sessionService";

// --- Function-Based Methods ---
export async function createUserProfile(
  userData: CreateUserProfileRequest
): Promise<UserProfile | null> {
  try {
    const response = await ApiClient.post<UserProfile>("/users", userData);

    if (response.success && response.data) {
      LocalStorageService.setUserId(response.data.id);
      LocalStorageService.setUserData(response.data);
      return response.data;
    }
    console.error(
      "UserProfileService: Failed to create user profile:",
      response.error
    );
    return null;
  } catch (error) {
    console.error("UserProfileService: Error creating user profile:", error);
    return null;
  }
}

export async function getUserProfileById(
  userId: string
): Promise<UserProfile | null> {
  try {
    const response = await ApiClient.get<UserProfile>(`/users/${userId}`);
    return response.success ? response.data ?? null : null;
  } catch (error) {
    console.error("UserProfileService: Error getting user profile:", error);
    return null;
  }
}

export async function getUserProfileByEmail(
  email: string
): Promise<UserProfile | null> {
  try {
    const response = await ApiClient.get<UserProfile>(
      `/users/email?email=${encodeURIComponent(email)}`
    );
    return response.success ? response.data ?? null : null;
  } catch (error) {
    console.error(
      "UserProfileService: Error getting user profile by email:",
      error
    );
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: UpdateUserProfileRequest
): Promise<UserProfile | null> {
  try {
    const response = await ApiClient.put<UserProfile>(
      `/users/${userId}`,
      updates
    );

    if (response.success && response.data) {
      LocalStorageService.setUserData(response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("UserProfileService: Error updating user profile:", error);
    return null;
  }
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  try {
    const response = await ApiClient.del(`/users/${userId}`);
    if (response.success) {
      LocalStorageService.clearUserData();
      return true;
    }
    return false;
  } catch (error) {
    console.error("UserProfileService: Error deleting user profile:", error);
    return false;
  }
}

export function getCurrentUserProfile(): UserProfile | null {
  return LocalStorageService.getUserData<UserProfile>();
}

export function getCurrentUserId(): string | null {
  return LocalStorageService.getUserId();
}

export async function updateCurrentUserProfile(
  updates: UpdateUserProfileRequest
): Promise<UserProfile | null> {
  const userId = getCurrentUserId();
  return userId ? await updateUserProfile(userId, updates) : null;
}

export async function syncCognitoUser(
  cognitoUser: CognitoUserData
): Promise<SyncUserResponse | null> {
  try {
    const existingUser = await getUserProfileByEmail(cognitoUser.email);

    if (existingUser) {
      const session = await SessionService.createSession({
        user_id: existingUser.id,
        is_guest: false,
      });
      if (session) {
        LocalStorageService.clearUserData();
        LocalStorageService.setUserId(existingUser.id);
        LocalStorageService.setUserData(existingUser);
        return { user: existingUser, session };
      }
    } else {
      const newUser = await createUserProfile({
        email: cognitoUser.email,
        full_name: cognitoUser.name,
        phone: cognitoUser.phone_number,
      });

      if (newUser) {
        const session = await SessionService.createSession({
          user_id: newUser.id,
          is_guest: false,
        });
        if (session) {
          LocalStorageService.clearUserData();
          LocalStorageService.setUserId(newUser.id);
          LocalStorageService.setUserData(newUser);
          return { user: newUser, session };
        }
      }
    }

    return null;
  } catch (error) {
    console.error("UserProfileService: Error syncing Cognito user:", error);
    return null;
  }
}

export async function refreshCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const userId = getCurrentUserId();
    if (!userId) return null;

    const profile = await getUserProfileById(userId);
    if (profile) {
      LocalStorageService.setUserData(profile);
      return profile;
    }

    return null;
  } catch (error) {
    console.error("UserProfileService: Error refreshing user profile:", error);
    return null;
  }
}

export function hasCurrentUserProfile(): boolean {
  return getCurrentUserProfile() !== null;
}

export function clearCurrentUserProfile(): void {
  LocalStorageService.clearUserData();
}

export function getUserDisplayName(user?: UserProfile): string {
  const target = user || getCurrentUserProfile();
  return target?.full_name || target?.email || "Guest User";
}

export function isProfileComplete(user?: UserProfile): boolean {
  const target = user || getCurrentUserProfile();
  return !!(target?.email && target?.full_name);
}

export function getProfileCompletionPercentage(user?: UserProfile): number {
  const target = user || getCurrentUserProfile();
  if (!target) return 0;

  const fields = ["email", "full_name", "phone"];
  const completed = fields.filter(
    (field) => target[field as keyof UserProfile]
  );
  return Math.round((completed.length / fields.length) * 100);
}