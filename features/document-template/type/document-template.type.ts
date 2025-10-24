import { DataPagination } from "@/types/global.types";

export interface TemplateFile {
  id: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  mimeType: string;
}

export interface DocumentTemplateResponse {
  id: string;
  name: string;
  description: string;
  content?: {
    sections?: Array<{
      title: string;
      content: string;
    }>;
  };
  documentType: {
    id: string;
    name: string;
  };
  templateFile?: TemplateFile;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface GetAllDocumentTemplates extends DataPagination {
  data: DocumentTemplateResponse[];
}

export interface DocumentTemplateQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
  documentTypeId?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface DocumentTemplateCreatePayload {
  name: string;
  description: string;
  documentTypeId: string;
  templateFileId: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface DocumentTemplateUpdatePayload {
  name?: string;
  description?: string;
  content?: {
    sections?: Array<{
      title: string;
      content: string;
    }>;
  };
  documentTypeId?: string;
  templateFileId?: string;
  isActive?: boolean;
  isPublic?: boolean;
}
