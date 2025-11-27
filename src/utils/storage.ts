import type { User } from '../features/auth/types';

const STORAGE_KEYS = {
  USER: 'al_rais_user',
  AUTH_STATUS: 'al_rais_auth_status',
  LAST_LOGIN: 'al_rais_last_login',
  AUTH_TOKEN: 'al_rais_auth_token',
} as const;

export const StorageService = {
  saveUser: (user: User): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');
      localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  },

  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      if (userData) {
        const user = JSON.parse(userData) as User;
        return user;
      }
      return null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    try {
      const authStatus = localStorage.getItem(STORAGE_KEYS.AUTH_STATUS);
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return authStatus === 'true' && userData !== null;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return false;
    }
  },

  clearAuth: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.AUTH_STATUS);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  },

  getLastLogin: (): Date | null => {
    try {
      const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
      return lastLogin ? new Date(lastLogin) : null;
    } catch (error) {
      console.error('Failed to get last login:', error);
      return null;
    }
  },

  isStoredDataValid: (): boolean => {
    const lastLogin = StorageService.getLastLogin();
    if (!lastLogin) return false;

    const now = new Date();
    const hoursSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    return hoursSinceLogin < 24; // Valid for 24 hours
  },
}; 