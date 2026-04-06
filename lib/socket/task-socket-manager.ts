import { io, Socket } from 'socket.io-client';
import { QueryClient } from 'react-query';

// ============================================================================
// Configuration
// ============================================================================

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL || 'https://docflow-back.nordicuniversity.org').replace(/\/+$/, '');
const NAMESPACE = '/tasks';

const SOCKET_CONFIG = {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  timeout: 20000,
  autoConnect: false,
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
} as const;

// ============================================================================
// Event Types
// ============================================================================

export interface TaskSocketEvent<T = unknown> {
  task?: T;
  taskId?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  movedBy?: string;
  changedBy?: string;
  fromColumnId?: string;
  toColumnId?: string;
  assignees?: unknown[];
  comment?: unknown;
  checklists?: unknown[];
  labels?: unknown[];
  columns?: unknown[];
  timestamp?: string;
}

// ============================================================================
// Task Socket Manager (Singleton)
// ============================================================================

class TaskSocketManager {
  private static instance: TaskSocketManager;
  private socket: Socket | null = null;
  private token: string | null = null;
  private currentProjectId: string | null = null;
  private queryClient: QueryClient | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): TaskSocketManager {
    if (!TaskSocketManager.instance) {
      TaskSocketManager.instance = new TaskSocketManager();
    }
    return TaskSocketManager.instance;
  }

  // ==========================================================================
  // Connection
  // ==========================================================================

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.token = token;

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(`${WS_URL}${NAMESPACE}`, {
      ...SOCKET_CONFIG,
      auth: { token },
    });

    this.setupConnectionListeners();
    this.socket.connect();
  }

  disconnect(): void {
    this.leaveProject();
    this.clearHeartbeat();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.token = null;
  }

  reconnect(): void {
    if (this.token) {
      const projectId = this.currentProjectId;
      this.disconnect();
      this.connect(this.token);
      if (projectId) {
        this.joinProject(projectId);
      }
    }
  }

  setQueryClient(qc: QueryClient): void {
    this.queryClient = qc;
  }

  // ==========================================================================
  // Project Room
  // ==========================================================================

  joinProject(projectId: string): void {
    if (this.currentProjectId === projectId) return;

    this.leaveProject();
    this.currentProjectId = projectId;

    if (this.socket?.connected) {
      this.socket.emit('project:join', { projectId });
      this.setupTaskListeners();
    }
  }

  leaveProject(): void {
    if (this.currentProjectId && this.socket?.connected) {
      this.socket.emit('project:leave', { projectId: this.currentProjectId });
    }
    this.removeTaskListeners();
    this.currentProjectId = null;
  }

  // ==========================================================================
  // Connection Listeners
  // ==========================================================================

  private setupConnectionListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.startHeartbeat();

      // Rejoin project room after reconnect
      if (this.currentProjectId) {
        this.socket!.emit('project:join', { projectId: this.currentProjectId });
        this.setupTaskListeners();
      }
    });

    this.socket.on('disconnect', () => {
      this.clearHeartbeat();
    });

    this.socket.on('connect_error', (error) => {
      if (
        error.message.includes('Authentication') ||
        error.message.includes('jwt expired') ||
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        this.socket?.disconnect();
        window.dispatchEvent(new CustomEvent('socket-auth-error'));
      }
    });
  }

  // ==========================================================================
  // Task Event Listeners
  // ==========================================================================

  private setupTaskListeners(): void {
    if (!this.socket) return;
    this.removeTaskListeners();

    this.socket.on('task:created', this.handleTaskCreated);
    this.socket.on('task:updated', this.handleTaskUpdated);
    this.socket.on('task:deleted', this.handleTaskDeleted);
    this.socket.on('task:moved', this.handleTaskMoved);
    this.socket.on('task:assignee-changed', this.handleAssigneeChanged);
    this.socket.on('task:comment-added', this.handleCommentAdded);
    this.socket.on('task:checklist-updated', this.handleChecklistUpdated);
    this.socket.on('task:label-changed', this.handleLabelChanged);
    this.socket.on('board:columns-updated', this.handleColumnsUpdated);
  }

  private removeTaskListeners(): void {
    if (!this.socket) return;

    this.socket.off('task:created', this.handleTaskCreated);
    this.socket.off('task:updated', this.handleTaskUpdated);
    this.socket.off('task:deleted', this.handleTaskDeleted);
    this.socket.off('task:moved', this.handleTaskMoved);
    this.socket.off('task:assignee-changed', this.handleAssigneeChanged);
    this.socket.off('task:comment-added', this.handleCommentAdded);
    this.socket.off('task:checklist-updated', this.handleChecklistUpdated);
    this.socket.off('task:label-changed', this.handleLabelChanged);
    this.socket.off('board:columns-updated', this.handleColumnsUpdated);
  }

  // ==========================================================================
  // Event Handlers (arrow functions to preserve `this` context)
  // ==========================================================================

  private handleTaskCreated = (_data: TaskSocketEvent) => {
    this.invalidate(['tasks']);
  };

  private handleTaskUpdated = (data: TaskSocketEvent) => {
    this.invalidate(['tasks']);
    if (data.taskId) {
      this.invalidate(['task', data.taskId]);
    }
  };

  private handleTaskDeleted = (data: TaskSocketEvent) => {
    this.invalidate(['tasks']);
    if (data.taskId) {
      this.invalidate(['task', data.taskId]);
    }
  };

  private handleTaskMoved = (data: TaskSocketEvent) => {
    this.invalidate(['tasks']);
    if (data.taskId) {
      this.invalidate(['task', data.taskId]);
    }
  };

  private handleAssigneeChanged = (data: TaskSocketEvent) => {
    this.invalidate(['tasks']);
    if (data.taskId) {
      this.invalidate(['task', data.taskId]);
    }
  };

  private handleCommentAdded = (data: TaskSocketEvent) => {
    this.invalidate(['task-comments']);
    if (data.taskId) {
      this.invalidate(['task', data.taskId]);
    }
  };

  private handleChecklistUpdated = (data: TaskSocketEvent) => {
    this.invalidate(['task-checklists']);
    if (data.taskId) {
      this.invalidate(['task', data.taskId]);
    }
  };

  private handleLabelChanged = (data: TaskSocketEvent) => {
    this.invalidate(['task-labels']);
    this.invalidate(['tasks']);
    if (data.taskId) {
      this.invalidate(['task', data.taskId]);
    }
  };

  private handleColumnsUpdated = (_data: TaskSocketEvent) => {
    this.invalidate(['boardColumns']);
  };

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private invalidate(queryKey: string[]): void {
    this.queryClient?.invalidateQueries(queryKey);
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat');
      }
    }, 30000);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get activeProjectId(): string | null {
    return this.currentProjectId;
  }
}

export const taskSocketManager = TaskSocketManager.getInstance();
