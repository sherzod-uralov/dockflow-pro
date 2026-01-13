import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface TaskLabelGetResponse {
  id: string;
  taskId: string;
  labelId: string;
  label: {
    id: string;
    name: string;
    color?: string;
  };
  createdAt: Date;
}

export interface TaskLabelCreatePayload {
  taskId: string;
  labelId: string;
}

export interface TaskLabelQueryParams extends GlobalGetAllPaginationProps {
  taskId?: string;
  labelId?: string;
}
