import { useCallback, useEffect, useMemo, useRef } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { TokenService } from "../../../services/tokenService";
import { authServiceSingleton } from "../../../services/authServiceSingleton";
import { useAuth } from "../hooks/useAuth";

type Props = {
  /**
   * When fewer than this many seconds remain until token expiry, refresh the Cognito session in the
   * background (no modal). Default 5 minutes works well with typical ~1h token lifetime.
   */
  refreshBeforeExpirySeconds?: number;
};

/**
 * Headless session maintenance: silently refreshes tokens before expiry so users are not interrupted.
 */
export default function SessionExpiryWarning({
  refreshBeforeExpirySeconds = 300,
}: Props) {
  const timersRef = useRef<number[]>([]);
  const { isAuthenticated } = useAuth();
  const isAuthenticatedRef = useRef(isAuthenticated);
  const scheduleVersionRef = useRef(0);

  const refreshBeforeExpiryMs = useMemo(
    () => refreshBeforeExpirySeconds * 1000,
    [refreshBeforeExpirySeconds]
  );

  isAuthenticatedRef.current = isAuthenticated;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const silentRefresh = useCallback(async (): Promise<boolean> => {
    try {
      await fetchAuthSession({ forceRefresh: true });
      await TokenService.getCognitoToken();
      return true;
    } catch {
      return false;
    }
  }, []);

  const schedule = useCallback(async () => {
    const version = scheduleVersionRef.current;
    clearTimers();

    try {
      if (!isAuthenticatedRef.current) return;
      const session = await fetchAuthSession();
      if (version !== scheduleVersionRef.current) return;
      if (!isAuthenticatedRef.current) return;

      const exp =
        (session.tokens?.idToken?.payload?.exp as number | undefined) ??
        (session.tokens?.accessToken?.payload?.exp as number | undefined);
      if (!exp) return;

      const expMs = exp * 1000;

      const now = Date.now();
      const msLeft = expMs - now;
      if (msLeft <= 0) {
        if (version !== scheduleVersionRef.current) return;
        if (isAuthenticatedRef.current) {
          await authServiceSingleton.signOut();
          window.location.href = "/auth";
        }
        return;
      }

      const refreshIn = Math.max(msLeft - refreshBeforeExpiryMs, 0);
      const refreshTimer = window.setTimeout(() => {
        void (async () => {
          if (version !== scheduleVersionRef.current) return;
          if (!isAuthenticatedRef.current) return;

          // Drop the hard-logout timer before awaiting refresh so a slow network response cannot
          // sign the user out while tokens are still being renewed.
          scheduleVersionRef.current += 1;
          clearTimers();

          const ok = await silentRefresh();
          if (!isAuthenticatedRef.current) return;
          if (!ok) {
            await authServiceSingleton.signOut();
            window.location.href = "/auth";
            return;
          }
          void schedule();
        })();
      }, refreshIn);
      timersRef.current.push(refreshTimer);

      const hardTimer = window.setTimeout(async () => {
        if (version !== scheduleVersionRef.current) return;
        if (!isAuthenticatedRef.current) return;
        try {
          await authServiceSingleton.signOut();
        } finally {
          window.location.href = "/auth";
        }
      }, msLeft);
      timersRef.current.push(hardTimer);
    } catch {
      // ignore
    }
  }, [clearTimers, refreshBeforeExpiryMs, silentRefresh]);

  useEffect(() => {
    scheduleVersionRef.current += 1;
    clearTimers();

    if (!isAuthenticated) return () => {};

    void schedule();
    return () => clearTimers();
  }, [clearTimers, isAuthenticated, schedule]);

  if (!isAuthenticated) return null;
  return null;
}
