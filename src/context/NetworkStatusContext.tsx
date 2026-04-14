// src/context/NetworkStatusContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NetworkStatusContextValue = {
  isOnline: boolean;
  isOffline: boolean;
  lastChecked: Date | null;
  checkNow: () => Promise<void>;
};

const NetworkStatusContext = createContext<
  NetworkStatusContextValue | undefined
>(undefined);

type Props = {
  children: React.ReactNode;
  pingPath?: string;
  timeoutMs?: number;
  navOnLinePollMs?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
};

export const NetworkStatusProvider: React.FC<Props> = ({
  children,
  pingPath = "https://www.google.com/favicon.ico",
  timeoutMs = 3000,
  navOnLinePollMs = 1000,
  initialBackoffMs = 1000,
  maxBackoffMs = 30000,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const backoffRef = useRef<number>(initialBackoffMs);
  const lastNavigatorOnlineRef = useRef<boolean>(navigator.onLine);

  const suspendedRef = useRef<boolean>(!navigator.onLine);

  const clearAbort = () => {
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch { }
      abortRef.current = null;
    }
  };

  const clearTimers = () => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    clearAbort();
  };

  const verifyConnection = useCallback(async (): Promise<boolean> => {
    if (suspendedRef.current) return false;

    clearAbort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(pingPath, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      abortRef.current = null;
      if (res && (res.ok || res.type === "opaque" || res.status >= 0)) {
        return true;
      }
      return false;
    } catch {
      clearTimeout(timeoutId);
      abortRef.current = null;
      return false;
    }
  }, [pingPath, timeoutMs]);

  const scheduleRetry = useCallback(() => {
    if (suspendedRef.current) return;
    if (retryTimerRef.current !== null) return;
    const wait = Math.min(backoffRef.current, maxBackoffMs);
    retryTimerRef.current = window.setTimeout(async () => {
      retryTimerRef.current = null;

      if (!navigator.onLine) {
        backoffRef.current = initialBackoffMs;
        suspendedRef.current = true;
        return;
      }
      backoffRef.current = Math.min(backoffRef.current * 2, maxBackoffMs);
      try {
        await runCheck();
      } catch { }
    }, wait);
  }, [maxBackoffMs, initialBackoffMs]);

  const runCheck = useCallback(async () => {
    if (!mountedRef.current) return;

    if (!navigator.onLine) {
      suspendedRef.current = true;
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      clearAbort();
      backoffRef.current = initialBackoffMs;
      setIsOnline(false);
      setLastChecked(new Date());
      return;
    }

    if (suspendedRef.current && navigator.onLine) {
      suspendedRef.current = false;
      backoffRef.current = initialBackoffMs;
    }

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    const ok = await verifyConnection();
    if (!mountedRef.current) return;

    setIsOnline(ok);
    setLastChecked(new Date());

    if (ok) {
      backoffRef.current = initialBackoffMs;
    } else {
      scheduleRetry();
    }
  }, [verifyConnection, scheduleRetry, initialBackoffMs]);

  const triggerDebouncedCheck = useCallback(() => {
    if (suspendedRef.current) return;
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      runCheck().catch(() => { });
    }, 300);
  }, [runCheck]);

  useEffect(() => {
    mountedRef.current = true;

    const onOnline = () => {
      suspendedRef.current = false;
      triggerDebouncedCheck();
    };

    const onOffline = () => {
      suspendedRef.current = true;
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      clearAbort();
      backoffRef.current = initialBackoffMs;
      setIsOnline(false);
      setLastChecked(new Date());
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        triggerDebouncedCheck();
      }
    };
    const onFocus = () => {
      triggerDebouncedCheck();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    const navConn: any = (navigator as any).connection;
    let connHandler: (() => void) | undefined;
    if (navConn && typeof navConn.addEventListener === "function") {
      connHandler = () => {
        triggerDebouncedCheck();
      };
      try {
        navConn.addEventListener("change", connHandler);
      } catch {
        navConn.onchange = connHandler;
      }
    }

    lastNavigatorOnlineRef.current = navigator.onLine;

    pollTimerRef.current = window.setInterval(() => {
      const current = navigator.onLine;
      if (current !== lastNavigatorOnlineRef.current) {
        lastNavigatorOnlineRef.current = current;
        if (!current) {
          suspendedRef.current = true;
          if (debounceTimerRef.current !== null) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
          }
          if (retryTimerRef.current !== null) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
          }
          clearAbort();
          backoffRef.current = initialBackoffMs;
          setIsOnline(false);
          setLastChecked(new Date());
        } else {
          suspendedRef.current = false;
          triggerDebouncedCheck();
        }
      }
    }, navOnLinePollMs);

    (async () => {
      if (!navigator.onLine) {
        suspendedRef.current = true;
        setIsOnline(false);
        setLastChecked(new Date());
      } else {
        suspendedRef.current = false;
        await runCheck();
      }
    })();

    return () => {
      mountedRef.current = false;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      if (navConn && connHandler) {
        try {
          navConn.removeEventListener("change", connHandler);
        } catch {
          navConn.onchange = null;
        }
      }
      clearTimers();
    };
  }, [triggerDebouncedCheck, runCheck, navOnLinePollMs, initialBackoffMs]);

  const checkNow = useCallback(async () => {
    if (suspendedRef.current && !navigator.onLine) return;
    await runCheck();
  }, [runCheck]);

  const value = useMemo(
    () => ({
      isOnline,
      isOffline: !isOnline,
      lastChecked,
      checkNow,
    }),
    [isOnline, lastChecked, checkNow]
  );

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = (): NetworkStatusContextValue => {
  const ctx = useContext(NetworkStatusContext);
  if (!ctx) {
    throw new Error("useNetworkStatus must be used within NetworkStatusProvider");
  }
  return ctx;
};

/*
EXPLANATION (what each part does):

1) Public API
   - NetworkStatusProvider: wrap your app to provide network status.
   - useNetworkStatus(): returns { isOnline, isOffline, lastChecked, checkNow }.

2) Defaults
   - pingPath: default '/favicon.ico' (prefer same-origin lightweight endpoint).
   - timeoutMs: fetch timeout for reachability checks.
   - navOnLinePollMs: how often to poll navigator.onLine (cheap, local check).
   - Backoff settings control retry behavior when reachability checks fail.

3) Core behavior
   - Uses navigator.onLine and window 'online'/'offline' events when available.
   - Polls navigator.onLine at a small interval to catch environments where events don't fire.
   - On significant events (online, visibility, focus, connection change, navigator.onLine toggle) it runs a debounced reachability check.
   - verifyConnection performs a lightweight GET to `pingPath`. Treats a resolved fetch (including opaque responses) as online.
   - If verifyConnection fails, it schedules retries using exponential backoff (to avoid flooding the network).
   - On success, backoff is reset.

4) Robustness & cleanup
   - All timers and AbortControllers are tracked and cleared on unmount.
   - Debounce coalesces rapid events.
   - The provider exposes checkNow() to force a verification.

5) Recommendations
   - Prefer a same-origin pingPath (e.g., '/health' or '/generate_204') to avoid CORS/no-cors oddities.
   - Tune timeoutMs and navOnLinePollMs for your app's needs.
   - If running inside a native WebView that doesn't update navigator.onLine, have the host app notify the web app (postMessage) and call checkNow().
*/
