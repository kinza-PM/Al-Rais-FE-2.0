import * as ApiClient from "./apiClient";
import { LocalStorageService } from "../storage/localStorageService";
import type {
  CreateUserResponse,
  GuestUser,
  UpdateUserRequest,
  UserSession,
} from "../../types/GuestUserTypes";

// -- Functional Methods --
export async function createGuestUser(): Promise<CreateUserResponse | null> {
  try {
    const response = await ApiClient.post<CreateUserResponse>("/users");

    if (response.success && response.data) {
      const { user, session } = response.data;

      LocalStorageService.setUserId(user.id);

      const sessionId = session.session_id || session.id;
      if (sessionId) LocalStorageService.setSessionId(sessionId);

      LocalStorageService.setUserData(user);
      LocalStorageService.setSessionData(session);

      return response.data;
    } else {
      console.error(
        "GuestUserService: Failed to create guest user:",
        response.error
      );
      return null;
    }
  } catch (error) {
    console.error("GuestUserService: Error creating guest user:", error);
    return null;
  }
}

export function getGuestUser(): GuestUser | null {
  return LocalStorageService.getUserData<GuestUser>();
}

export function getGuestSession(): UserSession | null {
  return LocalStorageService.getSessionData<UserSession>();
}

export function isGuestUser(): boolean {
  const session = getGuestSession();
  return session?.is_guest || false;
}

export function getUserId(): string | null {
  return LocalStorageService.getUserId();
}

export function getSessionId(): string | null {
  return LocalStorageService.getSessionId();
}

export async function convertGuestToRegistered(
  userDetails: UpdateUserRequest
): Promise<GuestUser | null> {
  try {
    const userId = getUserId();
    const sessionId = getSessionId();

    if (!userId || !sessionId) {
      console.error("GuestUserService: No guest user to convert");
      return null;
    }

    const userResponse = await ApiClient.put<GuestUser>(
      `/users/${userId}`,
      userDetails
    );

    if (userResponse.success && userResponse.data) {
      const sessionResponse = await ApiClient.put<UserSession>(
        `/sessions/${sessionId}`,
        {
          is_guest: false,
        }
      );

      if (sessionResponse.success && sessionResponse.data) {
        LocalStorageService.setUserData(userResponse.data);
        LocalStorageService.setSessionData(sessionResponse.data);

        return userResponse.data;
      }
    }

    console.error(
      "GuestUserService: Failed to convert guest user:",
      userResponse.error
    );
    return null;
  } catch (error) {
    console.error("GuestUserService: Error converting guest user:", error);
    return null;
  }
}

export async function updateGuestProfile(
  updates: UpdateUserRequest
): Promise<GuestUser | null> {
  try {
    const userId = getUserId();
    if (!userId) return null;

    const response = await ApiClient.put<GuestUser>(
      `/users/${userId}`,
      updates
    );

    if (response.success && response.data) {
      LocalStorageService.setUserData(response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("GuestUserService: Error updating guest profile:", error);
    return null;
  }
}

export function clearGuestData(): void {
  LocalStorageService.clearUserData();
}

export function clearInvalidSessionData(): void {
  try {
    const sessionData = getGuestSession();
    if (sessionData && !sessionData.session_id && !sessionData.id) {
      clearGuestData();
    }
  } catch (error) {
    console.error(
      "GuestUserService: Error clearing invalid session data:",
      error
    );
  }
}

export async function initializeGuestUser(): Promise<CreateUserResponse | null> {
  try {
    clearInvalidSessionData();

    const userId = getUserId();
    const sessionId = getSessionId();

    if (!userId || !sessionId) {
      return await createGuestUser();
    }

    const isValid = await isSessionValid();
    if (!isValid) {
      clearGuestData();
      return await createGuestUser();
    }

    const user = getGuestUser();
    const session = getGuestSession();

    if (user && session) {
      return { user, session };
    }

    return null;
  } catch (error) {
    console.error("GuestUserService: Error initializing guest user:", error);
    return null;
  }
}

export async function isSessionValid(): Promise<boolean> {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return false;

    const response = await ApiClient.get<UserSession>(`/sessions/${sessionId}`);

    if (response.success && response.data) {
      const expiresAt = new Date(response.data.expires_at || "");
      const isValid = expiresAt > new Date();

      if (isValid) {
        LocalStorageService.setSessionData(response.data);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("GuestUserService: Error validating session:", error);
    return false;
  }
}

export async function extendSession(): Promise<void> {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(); // 30 days

    const response = await ApiClient.put<UserSession>(
      `/sessions/${sessionId}`,
      {
        expires_at: expiresAt,
      }
    );

    if (response.success && response.data) {
      LocalStorageService.setSessionData(response.data);
    }
  } catch (error) {
    console.error("GuestUserService: Error extending session:", error);
  }
}
