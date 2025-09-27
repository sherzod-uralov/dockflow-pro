import { DataPagination } from "@/types/global.types";

export interface Deportament {
  id: string;
  name: string;
  description: string;
  code: string;
  parentId: null | Deportament;
  directorId: string;
}

interface DepartmentParent {
  id: string;
  name: string;
}

interface DepartmentDirector {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  code: string;
  parent: DepartmentParent | null;
  director: DepartmentDirector | null;
}

export interface GetAllDeportaments extends DataPagination {
  data: DepartmentResponse[];
}

export interface DeportamentQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}
