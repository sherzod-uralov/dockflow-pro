'use client';

import { useEffect, useRef } from 'react';
import { socketManager } from '@/lib/socket';
import { authService } from '@/features/login/service/login.service';

export const useSocketConnection = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    const token = authService.getAccessToken();

    if (!token) {
      return;
    }

    isInitialized.current = true;
    socketManager.connect(token);

    const handleLogout = () => {
      socketManager.disconnect();
      isInitialized.current = false;
    };

    const handleAuthError = async () => {
      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          socketManager.disconnect();
          socketManager.connect(newToken);
        }
      } catch {
        handleLogout();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !socketManager.isConnected) {
        const currentToken = authService.getAccessToken();
        if (currentToken) {
          socketManager.connect(currentToken);
        }
      }
    };

    const handleBeforeUnload = () => {
      socketManager.disconnect();
    };

    window.addEventListener('force-socket-disconnect', handleLogout);
    window.addEventListener('socket-auth-error', handleAuthError);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('force-socket-disconnect', handleLogout);
      window.removeEventListener('socket-auth-error', handleAuthError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
