import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  DocumentTypeQueryParams,
  documentTypeService,
  GetAllDocumentTypes,
  DocumentType as DocumentTypeModel,
} from "@/features/document-type";
import { showError, showSuccess } from "@/utils/show-error";

export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DocumentTypeModel) => documentTypeService.createDocumentType(payload),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documentTypes"]);
      showSuccess("Hujjat turi yaratildi");
    },
    onError: showError,
  });
};

export const useGetAllDocumentTypes = (params?: DocumentTypeQueryParams) => {
  return useQuery<GetAllDocumentTypes>({
    queryKey: ["documentTypes", params],
    queryFn: () => documentTypeService.getAllDocumentTypes(params),
    keepPreviousData: true,
  });
};

export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentTypeModel> }) =>
      documentTypeService.updateDocumentType(id, data),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documentTypes"]);
      showSuccess("Hujjat turi yangilandi");
    },
    onError: showError,
  });
};

export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentTypeService.deleteDocumentType(id),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documentTypes"]);
      showSuccess("Hujjat turi o'chirildi");
    },
    onError: showError,
  });
};

export const useGetDocumentTypeById = (id: string) => {
  return useQuery<DocumentTypeModel>({
    queryKey: ["documentType", id],
    queryFn: () => documentTypeService.getDocumentTypeById(id),
    enabled: !!id,
  });
};
