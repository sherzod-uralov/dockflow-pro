'use client';

import { useSocketStore } from '@/stores/socket.store';

export const useConnectionStatus = () => {
  const isConnected = useSocketStore((state) => state.isConnected);
  const connectionError = useSocketStore((state) => state.connectionError);

  return {
    isConnected,
    connectionError,
  };
};


export const useIsConnected = () => {
  return useSocketStore((state) => state.isConnected);
};
