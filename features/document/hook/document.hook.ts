import { createCRUDHooks } from "@/lib/crud-hooks";
import { documentService } from "@/features/document/service/document.service";
import {
  DocumentGetResponse,
  GetAllDocuments,
  DocumentQueryParams,
} from "@/features/document/type/document.type";
import { DocumentFormType } from "@/features/document/schema/document.schema";

const documentHooks = createCRUDHooks<
  DocumentGetResponse,
  DocumentFormType,
  Partial<DocumentFormType>,
  DocumentQueryParams,
  GetAllDocuments
>({
  service: documentService,
  queryKey: "documents",
  singleQueryKey: "document",
  messages: {
    created: "Hujjat muvaffaqiyatli yaratildi",
    updated: "Hujjat muvaffaqiyatli yangilandi",
    deleted: "Hujjat muvaffaqiyatli o'chirildi",
  },
});

export const useGetAllDocuments = (params?: DocumentQueryParams) =>
  documentHooks.useGetAll(params);

export const useGetDocumentById = (id: string, options?: { enabled?: boolean }) =>
  documentHooks.useGetById(id, options);

export const useCreateDocument = documentHooks.useCreate;

export const useUpdateDocument = documentHooks.useUpdate;

export const useDeleteDocument = documentHooks.useDelete;
