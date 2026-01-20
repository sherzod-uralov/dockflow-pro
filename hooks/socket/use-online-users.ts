'use client';

import { useCallback } from 'react';
import { useSocketStore } from '@/stores/socket.store';
import { socketManager } from '@/lib/socket';


export const useOnlineUsers = () => {
  const onlineUsers = useSocketStore((state) => state.onlineUsers);

  const refreshOnlineUsers = useCallback(() => {
    socketManager.requestOnlineUsers();
  }, []);

  return {
    onlineUsers,
    onlineUsersCount: onlineUsers.length,
    refreshOnlineUsers,
  };
};

export const useIsUserOnline = (userId: string) => {
  return useSocketStore((state) =>
    state.onlineUsers.some((user) => user.id === userId)
  );
};
