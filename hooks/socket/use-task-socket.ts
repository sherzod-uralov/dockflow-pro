'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { taskSocketManager } from '@/lib/socket/task-socket-manager';
import { authService } from '@/features/login/service/login.service';

/**
 * Connects to the /tasks WebSocket namespace and joins the project room.
 * Automatically invalidates React Query caches on real-time events.
 *
 * Usage: call once in the project tasks page with the current projectId.
 */
export const useTaskSocket = (projectId: string | undefined) => {
  const queryClient = useQueryClient();
  const isInitialized = useRef(false);

  // Provide queryClient to manager so it can invalidate queries
  useEffect(() => {
    taskSocketManager.setQueryClient(queryClient);
  }, [queryClient]);

  // Connect socket + join/leave project room
  useEffect(() => {
    if (!projectId) return;

    const token = authService.getAccessToken();
    if (!token) return;

    if (!isInitialized.current) {
      isInitialized.current = true;
      taskSocketManager.connect(token);
    }

    taskSocketManager.joinProject(projectId);

    const handleVisibilityChange = () => {
      if (!document.hidden && !taskSocketManager.isConnected) {
        const currentToken = authService.getAccessToken();
        if (currentToken) {
          taskSocketManager.connect(currentToken);
          taskSocketManager.joinProject(projectId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      taskSocketManager.leaveProject();
    };
  }, [projectId]);

  // Disconnect on unmount (page navigation away from project tasks)
  useEffect(() => {
    return () => {
      taskSocketManager.disconnect();
      isInitialized.current = false;
    };
  }, []);
};
