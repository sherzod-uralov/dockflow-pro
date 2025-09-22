import { DataPagination } from "@/types/global.types";

export interface Document {
  id?: string;
  name: string;
}

export interface GetAllDocuments extends DataPagination {
  data: Document[];
}

export interface DocumentQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}
