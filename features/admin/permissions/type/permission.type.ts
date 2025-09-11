import { DataPagination } from "@/types/global.types";

export interface Permission {
  id?: string;
  key: string;
  name: string;
  module: string;
  description: string;
}

export interface getAllPermissions extends DataPagination {
  data: Array<{ module: string; permissions: Permission[] }>;
}

export interface PermissionQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}
