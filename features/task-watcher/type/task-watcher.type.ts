import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface TaskWatcherGetResponse {
  id: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    fullname: string;
  };
  createdAt: Date;
}

export interface TaskWatcherQueryParams extends GlobalGetAllPaginationProps {
  taskId?: string;
  userId?: string;
}
