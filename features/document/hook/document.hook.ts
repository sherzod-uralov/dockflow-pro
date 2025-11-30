import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  DocumentQueryParams,
  documentService,
  GetAllDocuments,
} from "@/features/document";
import { DocumentFormType } from "@/features/document/schema/document.schema";
import { showError, showSuccess } from "@/utils/show-error";

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentFormType) =>
      documentService.createDocument(payload),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documents"]);
      showSuccess("Hujjat yaratildi");
    },
    onError: showError,
  });
};

export const useGetAllDocuments = (params?: DocumentQueryParams) => {
  return useQuery<GetAllDocuments>({
    queryKey: ["documents", params],
    queryFn: () => documentService.getAllDocuments(params),
    keepPreviousData: true,
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DocumentFormType>;
    }) => documentService.updateDocument(id, data),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documents"]);
      showSuccess("Hujjat yangilandi");
    },
    onError: showError,
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documents"]);
      showSuccess("Hujjat o'chirildi");
    },
    onError: showError,
  });
};

export const useGetDocumentById = (id: string, options?: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};
