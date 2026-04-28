import React from 'react';
import AppRouter from './router/Router';
import { NetworkStatusProvider } from './context/NetworkStatusContext';
import NetworkStatusBanner from './components/common/NetworkStatusBanner';
import { AuthProvider } from './features/auth/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NetworkStatusProvider>
        <NetworkStatusBanner />
        <AppRouter />
      </NetworkStatusProvider>
    </AuthProvider>
  );
};

export default App; 