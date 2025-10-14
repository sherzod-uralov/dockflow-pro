import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import {
  DocumentQueryParams,
  documentService,
  GetAllDocuments,
} from "@/features/document";
import { DocumentFormType } from "@/features/document/schema/document.schema";

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentFormType) =>
      documentService.createDocument(payload),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documents"]);
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
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DocumentFormType>;
    }) => documentService.updateDocument(id, data),
    onSuccess: () => {
      queryClient?.invalidateQueries(["documents"]);
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
      queryClient?.invalidateQueries(["documents"]);
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
