import { useMutation, useQuery, useQueryClient } from "react-query";
import { documentTypeService } from "../service/document-type.service";
import {
  GetAllDocumentTypes,
  DocumentType,
  DocumentTypeQueryParams,
} from "../type/document-type.type";
import { toast } from "sonner";

export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentType) =>
      documentTypeService.createDocumentType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["documentTypes"]);
      toast.success("DocumentType muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
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
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentType> }) =>
      documentTypeService.updateDocumentType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["documentTypes"]);
      toast.success("DocumentType muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentTypeService.deleteDocumentType(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["documentTypes"]);
      toast.success("DocumentType muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "O'chirishda xatolik yuz berdi",
      );
    },
  });
};

export const useGetDocumentTypeById = (id: string) => {
  return useQuery({
    queryKey: ["documentType", id],
    queryFn: () => documentTypeService.getDocumentTypeById(id),
    enabled: !!id,
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Ma'lumotni olishda xatolik",
      );
    },
  });
};
