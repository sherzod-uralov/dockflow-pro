import { DataPagination } from "@/types/global.types";

export interface Permission {
  key: string;
  name: string;
  module: string;
  description: string;
}

export interface getAllPermissions extends DataPagination {
  data: Array<{ module: string; permissions: Permission[] }>;
}

export interface PermissionQueryParams {
  name?: string;
  pageSize?: number;
  pageNumber?: number;
}
