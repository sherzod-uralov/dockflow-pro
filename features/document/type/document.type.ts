import { DataPagination } from "@/types/global.types";

export interface DocumentGetResponse {
  id?: string;
  title: string;
  description: string;
  documentNumber: string;
  versions: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  documentType: {
    id: string;
    name: string;
  };
  journal: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    fullname: string;
  };
  updatedAtBy: {
    id: string;
    fullname: string;
  };
  attachments: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface GetAllDocuments extends DataPagination {
  data: DocumentGetResponse[];
}

export interface DocumentQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}
