import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  DocumentGetResponse,
  GetAllDocuments,
  DocumentQueryParams,
} from "@/features/document/type/document.type";
import { DocumentFormType } from "@/features/document/schema/document.schema";

export const documentService = createCRUDService<
  DocumentGetResponse,
  DocumentFormType,
  Partial<DocumentFormType>,
  DocumentQueryParams,
  GetAllDocuments
>(endpoints.document, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
    documentTypeId: params?.documentTypeId,
    journalId: params?.journalId,
    status: params?.status,
    priority: params?.priority,
    templateId: params?.templateId,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllDocuments,
  getById: getDocumentById,
  create: createDocument,
  update: updateDocument,
  delete: deleteDocument,
} = documentService;
