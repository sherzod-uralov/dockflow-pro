import { DataPagination } from "@/types/global.types";

export interface Deportament {
  id: string;
  name: string;
  description: string;
  code: string;
  parentId: null | Deportament;
  directorId: string;
}

export interface GetAllDeportaments extends DataPagination {
  data: Deportament[];
}

export interface DeportamentQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}
