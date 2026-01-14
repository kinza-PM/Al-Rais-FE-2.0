import { fetchAuthSession } from 'aws-amplify/auth';
import { LocalStorageService } from './storage/localStorageService';
import { STORAGE_KEYS } from '../types/StorageKeysTypes';
import axios from 'axios';

const GUEST_TOKEN_API_URL = 'https://gw8h2qdmwh.execute-api.eu-west-1.amazonaws.com/dev/guest-token';

// Create a separate axios instance for guest token API (without interceptors)
const guestTokenClient = axios.create({
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

interface TokenData {
    token: string;
    expiresAt?: number;
}

/**
 * Token Service to manage authentication tokens
 * - For authenticated users: Gets token from Cognito
 * - For guest users: Fetches token from guest-token API
 *
 * Improvements:
 * - In-memory cache to avoid repeated localStorage reads
 * - Single-flight promise so concurrent callers share one guest-token request
 * - ensureGuestToken() helper for app bootstrap/preload
 */
export class TokenService {
    private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
    private static _inMemoryToken?: TokenData;
    private static _fetchingGuestTokenPromise?: Promise<string | null>;

    static async getToken(): Promise<string | null> {
        try {
            // Prefer Cognito token if a session exists (works across refresh & tabs).
            const cognitoToken = await this.getCognitoToken();
            if (cognitoToken) return cognitoToken;

            // Fallback to guest token.
            return await this.getGuestToken();
        } catch (error) {
            console.error('TokenService: Error getting token:', error);
            return null;
        }
    }

    static async getCognitoToken(): Promise<string | null> {
        try {
            const session = await fetchAuthSession();
            if (session?.tokens?.idToken) {
                const idToken = session.tokens.idToken.toString();
                const tokenData: TokenData = {
                    token: idToken,
                    expiresAt: session.tokens.idToken.payload?.exp
                        ? (session.tokens.idToken.payload.exp as number) * 1000
                        : undefined,
                };
                this._inMemoryToken = tokenData;
                try {
                    LocalStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, tokenData);
                } catch (e) {
                    console.warn('TokenService: Failed to persist Cognito token to localStorage', e);
                }

                return idToken;
            }

            return null;
        } catch (error) {
            console.error('TokenService: Error getting Cognito token:', error);
            return null;
        }
    }

    /**
     * Get or fetch guest token from API
     * - Returns in-memory token if valid
     * - Falls back to localStorage if present & valid
     * - Uses single-flight promise to avoid multiple concurrent API calls
     */
    static async getGuestToken(): Promise<string | null> {
        // 1) return in-memory if valid
        if (this._inMemoryToken && this.isTokenValid(this._inMemoryToken)) {
            return this._inMemoryToken.token;
        }

        // 2) check localStorage cache
        try {
            const cachedToken = LocalStorageService.getItem<TokenData>(STORAGE_KEYS.GUEST_TOKEN);
            if (cachedToken && this.isTokenValid(cachedToken)) {
                this._inMemoryToken = cachedToken;
                return cachedToken.token;
            }
        } catch (e) {
            console.warn('TokenService: error reading cached token from localStorage', e);
        }

        // 3) if a fetch already in progress, wait for it (single-flight)
        if (this._fetchingGuestTokenPromise) {
            return this._fetchingGuestTokenPromise;
        }

        // 4) start fetch and store promise so others await it
        this._fetchingGuestTokenPromise = (async (): Promise<string | null> => {
            try {
                const response = await guestTokenClient.post<{
                    token?: string;
                    access_token?: string;
                    expiresIn?: number | string;
                    expires_in?: number | string;
                }>(GUEST_TOKEN_API_URL, {});

                const token = response.data.token || response.data.access_token;
                if (!token) {
                    console.error('TokenService: No token received from guest-token API', response.data);
                    return null;
                }

                const rawExpires = response.data.expiresIn ?? response.data.expires_in;
                let expiresAt: number | undefined;

                if (rawExpires !== undefined && rawExpires !== null) {
                    const expiresSeconds = typeof rawExpires === 'string' ? parseInt(rawExpires, 10) : Number(rawExpires);
                    if (!Number.isNaN(expiresSeconds) && expiresSeconds > 0) {
                        expiresAt = Date.now() + expiresSeconds * 1000;
                    }
                }

                if (!expiresAt) {
                    // fallback: 24 hours
                    expiresAt = Date.now() + 24 * 60 * 60 * 1000;
                }

                const tokenData: TokenData = {
                    token,
                    expiresAt,
                };

                this._inMemoryToken = tokenData;
                try {
                    LocalStorageService.setItem(STORAGE_KEYS.GUEST_TOKEN, tokenData);
                } catch (e) {
                    console.warn('TokenService: Failed to persist guest token to localStorage', e);
                }

                return token;
            } catch (error) {
                console.error('TokenService: Error fetching guest token', error);
                return null;
            } finally {
                // clear the in-flight promise so future calls can retry if needed
                this._fetchingGuestTokenPromise = undefined;
            }
        })();

        return this._fetchingGuestTokenPromise;
    }

    /**
     * Preload guest token (call on app init to avoid first-request races)
     */
    static async ensureGuestToken(): Promise<void> {
        try {
            await this.getGuestToken();
        } catch (e) {
            // ignore - requests will fetch when needed
        }
    }

    static clearToken(): void {
        try {
            // Clear both auth + guest tokens (logout / session reset should fully reset token state).
            LocalStorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            LocalStorageService.removeItem(STORAGE_KEYS.GUEST_TOKEN);
        } catch (e) {
            console.warn('TokenService: clearToken localStorage remove failed', e);
        }
        this._inMemoryToken = undefined;
        this._fetchingGuestTokenPromise = undefined;
    }

    private static isTokenValid(tokenData: TokenData): boolean {
        if (!tokenData?.expiresAt) return true;
        return Date.now() < (tokenData.expiresAt - this.TOKEN_EXPIRY_BUFFER);
    }

    /**
     * Refresh token simply clears existing token and fetches a new one
     */
    static async refreshToken(): Promise<string | null> {
        this.clearToken();
        return await this.getToken();
    }
}
