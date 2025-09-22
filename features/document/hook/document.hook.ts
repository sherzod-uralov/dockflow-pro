import { useMutation, useQuery, useQueryClient } from "react-query";
import { documentService } from "../service/document.service";
import {
  GetAllDocuments,
  Document,
  DocumentQueryParams,
} from "../type/document.type";
import { toast } from "sonner";

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Document) =>
      documentService.createDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["documents"]);
      toast.success("Document muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) =>
      documentService.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["documents"]);
      toast.success("Document muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["documents"]);
      toast.success("Document muvaffaqiyatli o'chirildi");
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

export const useGetDocumentById = (id: string) => {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => documentService.getDocumentById(id),
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
