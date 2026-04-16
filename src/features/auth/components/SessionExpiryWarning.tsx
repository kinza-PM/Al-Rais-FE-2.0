import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "antd";
import { fetchAuthSession } from "aws-amplify/auth";
import { TokenService } from "../../../services/tokenService";
import { authServiceSingleton } from "../../../services/authServiceSingleton";

type Props = {
  warningSeconds?: number; // default 120s
};

import { useAuth } from "../hooks/useAuth";

export default function SessionExpiryWarning({ warningSeconds = 120 }: Props) {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timersRef = useRef<number[]>([]);
  const expMsRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuth();
  const isAuthenticatedRef = useRef(isAuthenticated);
  const scheduleVersionRef = useRef(0);

  const warningMs = useMemo(() => warningSeconds * 1000, [warningSeconds]);
  // Keep ref in sync immediately to avoid timer callbacks using stale auth state.
  isAuthenticatedRef.current = isAuthenticated;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback(async () => {
    const version = scheduleVersionRef.current;
    clearTimers();
    setOpen(false);
    setSecondsLeft(0);
    expMsRef.current = null;

    try {
      // Guard: Never show or schedule warnings for guests
      if (!isAuthenticatedRef.current) return;
      const session = await fetchAuthSession();
      if (version !== scheduleVersionRef.current) return;
      if (!isAuthenticatedRef.current) return;
      const exp =
        (session.tokens?.idToken?.payload?.exp as number | undefined) ??
        (session.tokens?.accessToken?.payload?.exp as number | undefined);
      // console.log("exp", exp);
      if (!exp) return; // no session
      const expMs = exp * 1000;
      expMsRef.current = expMs;

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

      // open warning
      const warnIn = Math.max(msLeft - warningMs, 0);
      const warnTimer = window.setTimeout(() => {
        if (version !== scheduleVersionRef.current) return;
        if (!isAuthenticatedRef.current) return;
        const expNow = expMsRef.current;
        if (!expNow) return;
        const left = Math.max(Math.floor((expNow - Date.now()) / 1000), 0);
        setSecondsLeft(left);
        setOpen(true);

        // update countdown every second while modal open
        const tick = () => {
          if (version !== scheduleVersionRef.current) return;
          if (!isAuthenticatedRef.current) return;
          const e = expMsRef.current;
          if (!e) return;
          const s = Math.max(Math.floor((e - Date.now()) / 1000), 0);
          setSecondsLeft(s);
          if (s <= 0) return;
          timersRef.current.push(window.setTimeout(tick, 1000));
        };
        timersRef.current.push(window.setTimeout(tick, 1000));
      }, warnIn);
      timersRef.current.push(warnTimer);

      // hard logout at expiry
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
  }, [clearTimers, warningMs]);

  useEffect(() => {
    // When auth status changes (login/logout), invalidate any in-flight schedule and
    // clear timers so stale callbacks cannot show the modal later.
    scheduleVersionRef.current += 1;
    clearTimers();
    setOpen(false);
    setSecondsLeft(0);
    expMsRef.current = null;

    if (!isAuthenticated) return () => {};

    void schedule();
    return () => clearTimers();
  }, [clearTimers, isAuthenticated, schedule]);

  const handleStaySignedIn = async () => {
    try {
      await fetchAuthSession({ forceRefresh: true });
      // persist refreshed token snapshot so other parts of the app don’t hold stale values
      await TokenService.getCognitoToken();
    } catch (err) {
      console.log("err", err);
      // if refresh fails, fall back to logout
      await authServiceSingleton.signOut();
      window.location.href = "/auth";
      return;
    }

    scheduleVersionRef.current += 1;
    setOpen(false);
    void schedule();
  };

  const handleLogoutNow = async () => {
    await authServiceSingleton.signOut();
    window.location.href = "/auth";
  };

  // If user is not authenticated, never render the modal (prevents accidental flashes)
  if (!isAuthenticated) return null;

  return (
    <Modal
      title="Your session is about to expire"
      open={open}
      onCancel={() => setOpen(false)}
      footer={() => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={() => void handleLogoutNow()}
            style={{
              border: "1px solid #e5e7eb",
              background: "#fff",
              padding: "8px 12px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
          <button
            type="button"
            onClick={() => void handleStaySignedIn()}
            style={{
              border: "1px solid #2351A3",
              background: "#2351A3",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Stay signed in
          </button>
        </div>
      )}
    >
      <div style={{ color: "#374151", lineHeight: 1.6 }}>
        You’ll be logged out in <b>{secondsLeft}s</b>. If you’re in the middle
        of a booking, choose <b>Stay signed in</b> to avoid losing progress.
      </div>
    </Modal>
  );
}
