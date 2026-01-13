 import { createCRUDHooks } from "@/lib/crud-hooks";
import { documentTemplateService } from "../service/document-template.service";
import {
  DocumentTemplateResponse,
  GetAllDocumentTemplates,
  DocumentTemplateQueryParams,
  DocumentTemplateCreatePayload,
  DocumentTemplateUpdatePayload,
} from "../type/document-template.type";

const documentTemplateHooks = createCRUDHooks<
  DocumentTemplateResponse,
  DocumentTemplateCreatePayload,
  DocumentTemplateUpdatePayload,
  DocumentTemplateQueryParams,
  GetAllDocumentTemplates
>({
  service: documentTemplateService,
  queryKey: "documentTemplates",
  singleQueryKey: "documentTemplate",
});

// Export individual hooks for backwards compatibility
export const useGetAllDocumentTemplates = (params?: DocumentTemplateQueryParams) =>
  documentTemplateHooks.useGetAll(params);

export const useGetDocumentTemplateById = (id: string) =>
  documentTemplateHooks.useGetById(id);

export const useCreateDocumentTemplate = documentTemplateHooks.useCreate;

export const useUpdateDocumentTemplate = documentTemplateHooks.useUpdate;

export const useDeleteDocumentTemplate = documentTemplateHooks.useDelete;
