import * as ApiClient from "./apiClient";
import { LocalStorageService } from "../storage/localStorageService";
import type {
  CreateSessionRequest,
  UpdateSessionRequest,
  UserSession,
} from "../../types/SessionServiceTypes";

// -- Functional Methods --
export async function createSession(
  request: CreateSessionRequest
): Promise<UserSession | null> {
  try {
    const response = await ApiClient.post<UserSession>("/sessions", request);

    if (response.success && response.data) {
      const sessionId = response.data.session_id || response.data.id;
      if (sessionId) {
        LocalStorageService.setSessionId(sessionId);
      }
      LocalStorageService.setSessionData(response.data);
      return response.data;
    }

    console.error("SessionService: Failed to create session:", response.error);
    return null;
  } catch (error) {
    console.error("SessionService: Error creating session:", error);
    return null;
  }
}

export async function getSessionById(
  sessionId: string
): Promise<UserSession | null> {
  try {
    const response = await ApiClient.get<UserSession>(`/sessions/${sessionId}`);
    return response.success ? response.data ?? null : null;
  } catch (error) {
    console.error("SessionService: Error getting session:", error);
    return null;
  }
}

export async function updateSession(
  sessionId: string,
  updates: UpdateSessionRequest
): Promise<UserSession | null> {
  try {
    const response = await ApiClient.put<UserSession>(
      `/sessions/${sessionId}`,
      updates
    );

    if (response.success && response.data) {
      LocalStorageService.setSessionData(response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("SessionService: Error updating session:", error);
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    const response = await ApiClient.del(`/sessions/${sessionId}`);

    if (response.success) {
      clearCurrentSession();
      return true;
    }

    return false;
  } catch (error) {
    console.error("SessionService: Error deleting session:", error);
    return false;
  }
}

export function getCurrentSession(): UserSession | null {
  return LocalStorageService.getSessionData<UserSession>();
}

export function getCurrentSessionId(): string | null {
  return LocalStorageService.getSessionId();
}

export async function validateCurrentSession(): Promise<boolean> {
  try {
    const sessionId = getCurrentSessionId();
    if (!sessionId) return false;

    const session = await getSessionById(sessionId);

    if (session) {
      const expiresAt = new Date(session.expires_at || "");
      const isValid = expiresAt > new Date();

      if (isValid) {
        LocalStorageService.setSessionData(session);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("SessionService: Error validating session:", error);
    return false;
  }
}

export async function extendCurrentSession(
  extensionDays: number = 30
): Promise<boolean> {
  try {
    const sessionId = getCurrentSessionId();
    if (!sessionId) return false;

    const expiresAt = new Date(
      Date.now() + extensionDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const updatedSession = await updateSession(sessionId, {
      expires_at: expiresAt,
    });
    return updatedSession !== null;
  } catch (error) {
    console.error("SessionService: Error extending session:", error);
    return false;
  }
}

export async function markAsRegistered(sessionId?: string): Promise<boolean> {
  try {
    const targetSessionId = sessionId || getCurrentSessionId();
    if (!targetSessionId) return false;

    const updatedSession = await updateSession(targetSessionId, {
      is_guest: false,
    });
    return updatedSession !== null;
  } catch (error) {
    console.error(
      "SessionService: Error marking session as registered:",
      error
    );
    return false;
  }
}

export function isGuestSession(): boolean {
  const session = getCurrentSession();
  return session?.is_guest || false;
}

export function clearCurrentSession(): void {
  LocalStorageService.removeItem("al_rais_guest_session_id");
  LocalStorageService.removeItem("al_rais_guest_session_data");
}

export function getSessionExpiration(): Date | null {
  const session = getCurrentSession();
  return session?.expires_at ? new Date(session.expires_at) : null;
}

export function isSessionExpired(): boolean {
  const expiration = getSessionExpiration();
  return expiration ? expiration <= new Date() : true;
}

export function getTimeUntilExpiration(): number | null {
  const expiration = getSessionExpiration();
  if (!expiration) return null;

  const now = new Date();
  const diff = expiration.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60))); // minutes
}

export async function autoExtendIfNeeded(
  thresholdMinutes: number = 60
): Promise<boolean> {
  try {
    const timeUntilExpiration = getTimeUntilExpiration();

    if (
      timeUntilExpiration !== null &&
      timeUntilExpiration <= thresholdMinutes
    ) {
      return await extendCurrentSession();
    }

    return true;
  } catch (error) {
    console.error("SessionService: Error auto-extending session:", error);
    return false;
  }
}