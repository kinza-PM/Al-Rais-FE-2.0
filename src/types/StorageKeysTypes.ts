export const STORAGE_KEYS = {
  USER_ID: 'al_rais_guest_user_id',
  SESSION_ID: 'al_rais_guest_session_id',
  USER_DATA: 'al_rais_guest_user_data',
  SESSION_DATA: 'al_rais_guest_session_data',
  AUTH_USER: 'al_rais_auth_user',
  AUTH_TOKEN: 'al_rais_auth_token',
} as const;

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  expires?: number;
}