import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  DocumentType,
  GetAllDocumentTypes,
  DocumentTypeQueryParams,
} from "@/features/document-type/type/document-type.type";

export const documentTypeService = createCRUDService<
  DocumentType,
  DocumentType,
  Partial<DocumentType>,
  DocumentTypeQueryParams,
  GetAllDocumentTypes
>(endpoints.documentType, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllDocumentTypes,
  getById: getDocumentTypeById,
  create: createDocumentType,
  update: updateDocumentType,
  delete: deleteDocumentType,
} = documentTypeService;
