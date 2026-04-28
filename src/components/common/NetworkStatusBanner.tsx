import React, { useEffect, useState } from "react";
import { useNetworkStatus } from "../../context/NetworkStatusContext";
import StatusMessageBanner from "./StatusMessageBanner";

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
    <StatusMessageBanner
      visible={!isOnline && visible}
      message="You’re offline. Please check your internet connection and try again."
      variant="warning"
    />
  );
};

export default NetworkStatusBanner;

