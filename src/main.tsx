import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProviders } from './app/AppProviders.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ConnectionStatus } from './components/ui/ConnectionStatus.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <ToastProvider>
        <App />
        <ConnectionStatus />
      </ToastProvider>
    </AppProviders>
  </StrictMode>
);
