import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../../context/NetworkStatusContext';

const NetworkStatusBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [visible, setVisible] = useState<boolean>(!isOnline ? true : false);

  useEffect(() => {
    if (!isOnline) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOnline]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className="fixed top-4 inset-x-0 z-50 pointer-events-none flex justify-center"
    >
      <div
        className={
          'pointer-events-auto ' +
          'transition-all duration-350 ease-out transform-gpu ' +
          (visible
            ? 'opacity-100 translate-y-0'
            : '-translate-y-6 opacity-0')
        }
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="bg-amber-100 text-[#3D2E00] text-sm px-4 py-2 rounded-lg shadow-md border border-amber-300 flex items-center gap-3">
          <span className="leading-tight">
            You’re offline. Please check your internet connection and try again.
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusBanner;
