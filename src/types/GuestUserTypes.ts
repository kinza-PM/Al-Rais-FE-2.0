export interface GuestUser {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
}

export interface UserSession {
  id?: string;
  session_id?: string;
  user_id?: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  is_guest?: boolean;
  created_at?: string;
  last_seen_at?: string;
  expires_at?: string;
}

export interface CreateUserRequest {
  email?: string;
  full_name?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  phone?: string;
}

export interface CreateUserResponse {
  user: GuestUser;
  session: UserSession;
}