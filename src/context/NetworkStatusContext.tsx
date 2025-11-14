// src/context/NetworkStatusContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Detector } from 'react-detect-offline';

type NetworkStatusContextValue = {
  isOnline: boolean;
  isOffline: boolean;
  lastChecked: Date | null;
};

const NetworkStatusContext = createContext<NetworkStatusContextValue | undefined>(undefined);

type NetworkStatusProviderProps = {
  children: React.ReactNode;
};

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const checkTimeoutRef = useRef<number | null>(null);

  // Improved network check with multiple fallbacks
  const verifyConnection = useCallback(async (): Promise<boolean> => {
    const endpoints = [
      'https://www.google.com/favicon.ico',
      'https://cloudflare.com/favicon.ico',
      'https://www.gstatic.com/generate_204'
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      // Try first endpoint
      await fetch(endpoints[0], {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return true;
    } catch (err) {
      clearTimeout(timeoutId);

      // Try second endpoint as fallback
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 3000);

        await fetch(endpoints[1], {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller2.signal,
        });

        clearTimeout(timeoutId2);
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  const handleChange = useCallback((payload: any) => {
    const detectorOnline = typeof payload === 'boolean' ? payload : Boolean(payload?.online ?? payload);

    console.log(`Detector says: ${detectorOnline ? 'online' : 'offline'}, verifying...`);

    // Clear any pending check
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Debounce multiple rapid changes
    checkTimeoutRef.current = setTimeout(async () => {
      const actuallyOnline = await verifyConnection();

      console.log(`Verification result: ${actuallyOnline ? 'online' : 'offline'}`);

      setIsOnline(actuallyOnline);
      setLastChecked(new Date());
    }, 500);
  }, [verifyConnection]);

  // Initial check on mount
  useEffect(() => {
    (async () => {
      const online = await verifyConnection();
      setIsOnline(online);
      setLastChecked(new Date());
    })();

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [verifyConnection]);

  const value = useMemo(
    () => ({
      isOnline,
      isOffline: !isOnline,
      lastChecked,
    }),
    [isOnline, lastChecked]
  );

  return (
    <NetworkStatusContext.Provider value={value}>
      <Detector
        onChange={handleChange}
        polling={true}
        render={() => null}
      />
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = (): NetworkStatusContextValue => {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  return context;
};