import type { UserSession } from "./SessionServiceTypes";

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
}

export interface CreateUserProfileRequest {
  email?: string;
  full_name?: string;
  phone?: string;
}

export interface UpdateUserProfileRequest {
  email?: string;
  full_name?: string;
  phone?: string;
}

export interface CognitoUserData {
  email: string;
  name?: string;
  phone_number?: string;
}

export interface SyncUserResponse {
  user: UserProfile;
  session: UserSession;
}
