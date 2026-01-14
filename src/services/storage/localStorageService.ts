import { STORAGE_KEYS, type StorageItem } from "../../types/StorageKeysTypes";

export const LocalStorageService = {
  /**
   * Set an item in localStorage with optional expiration
   */
  setItem<T>(key: string, value: T, expirationMinutes?: number): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expires: expirationMinutes
          ? Date.now() + expirationMinutes * 60 * 1000
          : undefined,
      };

      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(" setItem:", error);
      return false;
    }
  },

  /**
   * Get an item from localStorage with expiration check
   */
  getItem<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item: StorageItem<T> = JSON.parse(itemStr);
      if (item.expires && Date.now() > item.expires) {
        this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error(" getItem:", error);
      return null;
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(" removeItem:", error);
      return false;
    }
  },

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error(" clear:", error);
      return false;
    }
  },

  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },

  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error(" getAllKeys:", error);
      return [];
    }
  },

  getStorageSize(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += (localStorage[key]?.length || 0) + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error(" getStorageSize:", error);
      return 0;
    }
  },

  setUserId(userId: string): boolean {
    return this.setItem(STORAGE_KEYS.USER_ID, userId);
  },

  getUserId(): string | null {
    return this.getItem<string>(STORAGE_KEYS.USER_ID);
  },

  setSessionId(sessionId: string): boolean {
    return this.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  },

  getSessionId(): string | null {
    return this.getItem<string>(STORAGE_KEYS.SESSION_ID);
  },

  setUserData<T>(userData: T): boolean {
    return this.setItem<T>(STORAGE_KEYS.USER_DATA, userData);
  },

  getUserData<T>(): T | null {
    return this.getItem<T>(STORAGE_KEYS.USER_DATA);
  },

  setSessionData<T>(sessionData: T): boolean {
    return this.setItem<T>(STORAGE_KEYS.SESSION_DATA, sessionData);
  },

  getSessionData<T>(): T | null {
    return this.getItem<T>(STORAGE_KEYS.SESSION_DATA);
  },

  clearUserData(): boolean {
    try {
      this.removeItem(STORAGE_KEYS.USER_ID);
      this.removeItem(STORAGE_KEYS.SESSION_ID);
      this.removeItem(STORAGE_KEYS.USER_DATA);
      this.removeItem(STORAGE_KEYS.SESSION_DATA);
      this.removeItem(STORAGE_KEYS.AUTH_USER);
      this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      this.removeItem(STORAGE_KEYS.GUEST_TOKEN);
      return true;
    } catch (error) {
      console.error(" clearUserData:", error);
      return false;
    }
  },

  isAvailable(): boolean {
    try {
      const testKey = "__test_storage__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error(" isAvailable:", error);
      return false;
    }
  },

  getAlRaisKeys(): string[] {
    return this.getAllKeys().filter((key) => key.startsWith("al_rais_"));
  },

  clearAlRaisData(): boolean {
    try {
      const alRaisKeys = this.getAlRaisKeys();
      alRaisKeys.forEach((key) => this.removeItem(key));
      return true;
    } catch (error) {
      console.error(" clearAlRaisData:", error);
      return false;
    }
  },
};