import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface TaskDependencyTask {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export interface TaskDependencyGetResponse {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  task: TaskDependencyTask;
  dependsOnTask: TaskDependencyTask;
  createdAt: Date;
}

export interface TaskDependencyCreatePayload {
  taskId: string;
  dependsOnTaskId: string;
}

export interface TaskDependencyQueryParams extends GlobalGetAllPaginationProps {
  taskId?: string;
  dependsOnTaskId?: string;
}
