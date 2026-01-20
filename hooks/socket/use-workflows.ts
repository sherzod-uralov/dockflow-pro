'use client';

import { useCallback } from 'react';
import { useSocketStore } from '@/stores/socket.store';
import { socketManager } from '@/lib/socket';

/**
 * Hook to access active workflows count.
 */
export const useActiveWorkflows = () => {
  const activeWorkflowsCount = useSocketStore((state) => state.activeWorkflowsCount);

  const refreshWorkflowCount = useCallback(() => {
    socketManager.refreshWorkflowCount();
  }, []);

  return {
    activeWorkflowsCount,
    refreshWorkflowCount,
  };
};
