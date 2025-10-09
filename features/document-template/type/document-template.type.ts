import { DataPagination } from "@/types/global.types";

export interface DocumentTemplate {
  id?: string;
  name: string;
}

export interface GetAllDocumentTemplates extends DataPagination {
  data: DocumentTemplate[];
}

export interface DocumentTemplateQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}
