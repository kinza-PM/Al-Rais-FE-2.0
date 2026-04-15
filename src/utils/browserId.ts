import { generateUUID } from "./helpers";

const BROWSER_ID_STORAGE_KEY = "browserId";

/**
 * Returns a stable per-browser id from localStorage, creating and persisting one if missing.
 */
export function ensureBrowserId(): string {
  if (typeof window === "undefined" || !window.localStorage) {
    return generateUUID();
  }
  try {
    const existing = localStorage.getItem(BROWSER_ID_STORAGE_KEY)?.trim();
    if (existing) return existing;
    const id = generateUUID();
    localStorage.setItem(BROWSER_ID_STORAGE_KEY, id);
    return id;
  } catch {
    return generateUUID();
  }
}
