import React from 'react';
import AppRouter from './router/Router';
import { NetworkStatusProvider } from './context/NetworkStatusContext';
import NetworkStatusBanner from './components/common/NetworkStatusBanner';

const App: React.FC = () => {
  return (
    <NetworkStatusProvider>
      <NetworkStatusBanner />
      <AppRouter />
    </NetworkStatusProvider>
  );
};

export default App; 