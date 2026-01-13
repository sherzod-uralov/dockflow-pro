import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  DocumentTemplateResponse,
  GetAllDocumentTemplates,
  DocumentTemplateQueryParams,
  DocumentTemplateCreatePayload,
  DocumentTemplateUpdatePayload,
} from "@/features/document-template/type/document-template.type";

export const documentTemplateService = createCRUDService<
  DocumentTemplateResponse,
  DocumentTemplateCreatePayload,
  DocumentTemplateUpdatePayload,
  DocumentTemplateQueryParams,
  GetAllDocumentTemplates
>(endpoints.documentTemplate, {
  transformParams: (params) => ({
    search: params?.search,
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    documentTypeId: params?.documentTypeId,
    isActive: params?.isActive,
    isPublic: params?.isPublic,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllDocumentTemplates,
  getById: getDocumentTemplateById,
  create: createDocumentTemplate,
  update: updateDocumentTemplate,
  delete: deleteDocumentTemplate,
} = documentTemplateService;
