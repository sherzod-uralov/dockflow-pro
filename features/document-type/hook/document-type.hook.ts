import { createCRUDHooks } from "@/lib/crud-hooks";
import { documentTypeService } from "@/features/document-type/service/document-type.service";
import {
  DocumentType,
  GetAllDocumentTypes,
  DocumentTypeQueryParams,
} from "@/features/document-type/type/document-type.type";

const documentTypeHooks = createCRUDHooks<
  DocumentType,
  DocumentType,
  Partial<DocumentType>,
  DocumentTypeQueryParams,
  GetAllDocumentTypes
>({
  service: documentTypeService,
  queryKey: "documentTypes",
  singleQueryKey: "documentType",
});

// Export individual hooks for backwards compatibility
export const useGetAllDocumentTypes = (params?: DocumentTypeQueryParams) =>
  documentTypeHooks.useGetAll(params);

export const useGetDocumentTypeById = (id: string) =>
  documentTypeHooks.useGetById(id);

export const useCreateDocumentType = documentTypeHooks.useCreate;

export const useUpdateDocumentType = documentTypeHooks.useUpdate;

export const useDeleteDocumentType = documentTypeHooks.useDelete;
