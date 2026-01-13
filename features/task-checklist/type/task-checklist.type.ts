import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface TaskChecklistItemGetResponse {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  completedById?: string;
  completedAt?: Date;
  position: number;
  completedBy?: {
    id: string;
    fullname: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskChecklistGetResponse {
  id: string;
  taskId: string;
  title: string;
  position: number;
  items: TaskChecklistItemGetResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskChecklistCreatePayload {
  taskId: string;
  title: string;
  position?: number;
}

export interface TaskChecklistUpdatePayload {
  title?: string;
  position?: number;
}

export interface TaskChecklistItemCreatePayload {
  title: string;
  position?: number;
}

export interface TaskChecklistItemUpdatePayload {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

export interface TaskChecklistQueryParams extends GlobalGetAllPaginationProps {
  taskId: string;
  search?: string;
}

export interface TaskChecklistItemQueryParams extends GlobalGetAllPaginationProps {
  search?: string;
}
