import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import {
  DocumentTypeQueryParams,
  documentTypeService,
  GetAllDocumentTypes,
} from "@/features/document-type";
import { ApiError, getErrorMessage } from "@/types/global.types";

export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation<DocumentType, ApiError, DocumentType>({
    mutationFn: (payload) => documentTypeService.createDocumentType(payload),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documentTypes"]);
      toast.success("DocumentType muvaffaqiyatli yaratildi");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useGetAllDocumentTypes = (params?: DocumentTypeQueryParams) => {
  return useQuery<GetAllDocumentTypes, ApiError>({
    queryKey: ["documentTypes", params],
    queryFn: () => documentTypeService.getAllDocumentTypes(params),
    keepPreviousData: true,
  });
};

export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DocumentType,
    ApiError,
    { id: string; data: Partial<DocumentType> }
  >({
    mutationFn: ({ id, data }) =>
      documentTypeService.updateDocumentType(id, data),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documentTypes"]);
      toast.success("DocumentType muvaffaqiyatli yangilandi");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => documentTypeService.deleteDocumentType(id),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documentTypes"]);
      toast.success("DocumentType muvaffaqiyatli o'chirildi");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useGetDocumentTypeById = (id: string) => {
  return useQuery<DocumentType, ApiError>({
    queryKey: ["documentType", id],
    queryFn: () => documentTypeService.getDocumentTypeById(id),
    enabled: !!id,
  });
};
