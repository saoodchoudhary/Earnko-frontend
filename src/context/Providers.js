'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { AuthProvider } from './AuthContext';
import { store } from '../store';

export function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReduxProvider>
  );
}