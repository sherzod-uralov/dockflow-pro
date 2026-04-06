import { useMutation, useQueryClient } from "react-query";
import { createCRUDHooks } from "@/lib/crud-hooks";
import { documentService } from "@/features/document/service/document.service";
import { showError, showSuccess } from "@/utils/show-error";
import {
  DocumentGetResponse,
  GetAllDocuments,
  DocumentQueryParams,
  CreateWithOfficePayload,
  CreateWithOfficeResponse,
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
});

export const useGetAllDocuments = (params?: DocumentQueryParams) =>
  documentHooks.useGetAll(params);

export const useGetDocumentById = (id: string, options?: { enabled?: boolean }) =>
  documentHooks.useGetById(id, options);

export const useCreateDocument = documentHooks.useCreate;

export const useUpdateDocument = documentHooks.useUpdate;

export const useDeleteDocument = documentHooks.useDelete;

export const useCreateDocumentWithOffice = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateWithOfficeResponse, unknown, CreateWithOfficePayload>({
    mutationFn: (payload) => documentService.createWithOffice(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["documents"]);
      showSuccess(data);
    },
    onError: showError,
  });
};
