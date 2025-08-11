
// Session-related type definitions
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

export interface CreateSessionRequest {
  user_id: string;
  is_guest?: boolean;
  expires_at?: string;
}

export interface UpdateSessionRequest {
  expires_at?: string;
  is_guest?: boolean;
  device_info?: string;
}
