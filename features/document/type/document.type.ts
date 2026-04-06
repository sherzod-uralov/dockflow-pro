import { DataPagination } from "@/types/global.types";

export interface DocumentTags {
  [key: string]: string;
}

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
  template?: {
    id: string;
    name: string;
  };
  tags?: DocumentTags;
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
  documentTypeId?: string;
  journalId?: string;
  status?: string;
  priority?: string;
  templateId?: string;
}

export type OfficeFileType = "docx" | "xlsx" | "pptx";

export interface CreateWithOfficePayload {
  title: string;
  documentTypeId: string;
  journalId: string;
  fileType: OfficeFileType;
}

export interface CreateWithOfficeResponse {
  document: { id: string; title: string; documentNumber: string };
  attachment: { id: string; fileName: string; fileUrl: string };
  collaboraUrl: string;
  wopiSrc: string;
  fileType: OfficeFileType;
}
