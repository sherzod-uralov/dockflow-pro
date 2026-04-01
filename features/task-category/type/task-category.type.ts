import { DataPagination } from "@/types/global.types";

export interface TaskCategoryGetResponse {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllTaskCategories extends DataPagination {
  data: TaskCategoryGetResponse[];
}

export interface TaskCategoryQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface TaskCategoryFormData {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface TaskCategoryCreatePayload extends TaskCategoryFormData {}

export interface TaskCategoryUpdatePayload {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}
