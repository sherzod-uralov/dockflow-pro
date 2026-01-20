'use client';

import { useCallback } from 'react';
import { useSocketStore } from '@/stores/socket.store';
import { socketManager } from '@/lib/socket';

export const useNotifications = () => {
  const notifications = useSocketStore((state) => state.notifications);
  const unreadCount = useSocketStore((state) => state.unreadCount);

  const markAsRead = useCallback((ids: string[]) => {
    socketManager.markAsRead(ids);
  }, []);

  const markAllAsRead = useCallback(() => {
    socketManager.markAllAsRead();
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};

export const useUnreadCount = () => {
  return useSocketStore((state) => state.unreadCount);
};
