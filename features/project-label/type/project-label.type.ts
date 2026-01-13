import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface ProjectLabelGetResponse {
  id: string;
  projectId: string;
  name: string;
  color: string;
  description?: string;
  taskCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectLabelCreatePayload {
  projectId: string;
  name: string;
  color: string;
  description?: string;
}

export interface ProjectLabelUpdatePayload {
  name?: string;
  color?: string;
  description?: string;
}

export interface ProjectLabelQueryParams extends GlobalGetAllPaginationProps {
  projectId?: string;
  search?: string;
}
