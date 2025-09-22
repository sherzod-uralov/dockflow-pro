import { DataPagination } from "@/types/global.types";

export interface DocumentType {
  id?: string;
  name: string;
}

export interface GetAllDocumentTypes extends DataPagination {
  data: DocumentType[];
}

export interface DocumentTypeQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}
