// authServiceSingleton.ts
class AuthServiceSingleton {
    private static instance: AuthServiceSingleton;
    private signOutCallback: (() => Promise<void>) | null = null;

    static getInstance(): AuthServiceSingleton {
        if (!AuthServiceSingleton.instance) {
            AuthServiceSingleton.instance = new AuthServiceSingleton();
        }
        return AuthServiceSingleton.instance;
    }

    // Accept nullable callback so callers can unregister by passing null
    registerSignOutCallback(callback: (() => Promise<void>) | null) {
        this.signOutCallback = callback;
    }

    async signOut() {
        if (this.signOutCallback) {
            try {
                await this.signOutCallback();
            } catch (err) {
                console.warn('AuthServiceSingleton.signOut: callback failed', err);
            }
        } else {
            console.warn('AuthServiceSingleton: No signOut callback registered');
        }
    }
}

export const authServiceSingleton = AuthServiceSingleton.getInstance();
