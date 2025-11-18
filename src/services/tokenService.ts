import { fetchAuthSession } from 'aws-amplify/auth';
import { StorageService } from '../utils/storage';
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
 */
export class TokenService {
    private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

    /**
     * Get the appropriate token (Cognito for authenticated, guest token for guests)
     */
    static async getToken(): Promise<string | null> {
        try {
            const isAuthenticated = StorageService.isAuthenticated();

            if (isAuthenticated) {
                return await this.getCognitoToken();
            } else {
                return await this.getGuestToken();
            }
        } catch (error) {
            console.error('TokenService: Error getting token:', error);
            return null;
        }
    }

    /**
     * Get Cognito access token for authenticated users
     */
    static async getCognitoToken(): Promise<string | null> {
        try {
            const session = await fetchAuthSession();

            if (session.tokens?.accessToken) {
                const accessToken = session.tokens.accessToken.toString();
                const tokenData: TokenData = {
                    token: accessToken,
                    expiresAt: session.tokens.accessToken.payload?.exp
                        ? (session.tokens.accessToken.payload.exp as number) * 1000
                        : undefined,
                };
                LocalStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, tokenData);

                return accessToken;
            }

            return null;
        } catch (error) {
            console.error('TokenService: Error getting Cognito token:', error);
            return null;
        }
    }

    /**
     * Get or fetch guest token from API
     */
    static async getGuestToken(): Promise<string | null> {
        try {
            const cachedToken = LocalStorageService.getItem<TokenData>(STORAGE_KEYS.AUTH_TOKEN);

            if (cachedToken && this.isTokenValid(cachedToken)) {
                return cachedToken.token;
            }

            const response = await guestTokenClient.post<{
                token?: string;
                access_token?: string;
                expiresIn?: number | string;
                expires_in?: number | string;
            }>(
                GUEST_TOKEN_API_URL,
                {}
            );

            const token = response.data.token || response.data.access_token;
            if (!token) {
                console.error('TokenService: No token received from guest-token API');
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
                expiresAt = Date.now() + 24 * 60 * 60 * 1000;
            }
            const tokenData: TokenData = {
                token: token,
                expiresAt,
            };
            LocalStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, tokenData);

            return token;
        } catch (error) {
            console.error('TokenService: Error getting guest token:', error);
            return null;
        }
    }

    /**
     * Check if token is still valid (not expired)
     */
    private static isTokenValid(tokenData: TokenData): boolean {
        if (!tokenData.expiresAt) {
            return true;
        }

        return Date.now() < (tokenData.expiresAt - this.TOKEN_EXPIRY_BUFFER);
    }

    /**
     * Clear stored token
     */
    static clearToken(): void {
        LocalStorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Refresh token (get new token)
     */
    static async refreshToken(): Promise<string | null> {
        this.clearToken();
        return await this.getToken();
    }
}

