import { GlobalGetAllPaginationProps } from "@/types/global.types";

export type TaskActivityAction =
  | "CREATED"
  | "UPDATED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "COMMENTED"
  | "ATTACHMENT_ADDED"
  | "LABEL_ADDED"
  | "LABEL_REMOVED"
  | "DEPENDENCY_ADDED"
  | "DEPENDENCY_REMOVED";

export interface TaskActivityGetResponse {
  id: string;
  taskId: string;
  userId: string;
  action: TaskActivityAction | string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  user: {
    id: string;
    fullname: string;
    email: string;
  };
  createdAt: Date;
}

export interface TaskActivityQueryParams extends GlobalGetAllPaginationProps {
  taskId: string;
  userId?: string;
  action?: TaskActivityAction | string;
  startDate?: string;
  endDate?: string;
}
