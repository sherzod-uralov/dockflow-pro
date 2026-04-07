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

    // 30 soniya kutib disconnect qilish uchun timer
    let awayTimer: ReturnType<typeof setTimeout> | null = null;
    const AWAY_DELAY = 30_000;

    const reconnect = () => {
      const currentToken = authService.getAccessToken();
      if (currentToken && !socketManager.isConnected) {
        socketManager.connect(currentToken);
      }
    };

    const cancelAwayTimer = () => {
      if (awayTimer) {
        clearTimeout(awayTimer);
        awayTimer = null;
      }
    };

    const scheduleDisconnect = () => {
      cancelAwayTimer();
      awayTimer = setTimeout(() => {
        socketManager.disconnect();
        awayTimer = null;
      }, AWAY_DELAY);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab yashirildi — 30 soniya kutib disconnect
        scheduleDisconnect();
      } else {
        // Tab qayta faollashdi — disconnectni bekor qil + reconnect
        cancelAwayTimer();
        reconnect();
      }
    };

    const handleBlur = () => {
      // Window focus yo'qoldi (Cmd+Tab, boshqa app) — 30 soniya kutib disconnect
      scheduleDisconnect();
    };

    const handleFocus = () => {
      // Window qayta focus oldi — disconnectni bekor qil + reconnect
      cancelAwayTimer();
      reconnect();
    };

    const handleBeforeUnload = () => {
      cancelAwayTimer();
      socketManager.disconnect();
    };

    window.addEventListener('force-socket-disconnect', handleLogout);
    window.addEventListener('socket-auth-error', handleAuthError);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cancelAwayTimer();
      window.removeEventListener('force-socket-disconnect', handleLogout);
      window.removeEventListener('socket-auth-error', handleAuthError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socketManager.disconnect();
      isInitialized.current = false;
    };
  }, []);
};
