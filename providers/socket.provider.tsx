'use client';

import { ReactNode } from 'react';
import { useSocketConnection } from '@/hooks/socket';

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * Socket Provider - Manages WebSocket connection lifecycle.
 *
 * This provider initializes and maintains the socket connection.
 * All socket state is managed via Zustand store, not React Context.
 *
 * Usage:
 * - Wrap your app with this provider
 * - Use hooks from '@/hooks/socket' to access socket data
 * - Use socketManager from '@/lib/socket' for direct socket actions
 */
export const SocketProvider = ({ children }: SocketProviderProps) => {
  // Initialize socket connection
  useSocketConnection();

  return <>{children}</>;
};
