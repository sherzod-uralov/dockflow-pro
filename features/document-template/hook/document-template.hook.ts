import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { documentTemplateService } from "../service/document-template.service";
import {
  DocumentTemplateQueryParams,
  GetAllDocumentTemplates,
  DocumentTemplateCreatePayload,
  DocumentTemplateUpdatePayload,
} from "../type/document-template.type";

export const useGetAllDocumentTemplates = (
  params?: DocumentTemplateQueryParams,
) => {
  return useQuery<GetAllDocumentTemplates>({
    queryKey: ["documentTemplates", params],
    queryFn: () => documentTemplateService.getAllDocumentTemplates(params),
    keepPreviousData: true,
  });
};

export const useCreateDocumentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentTemplateCreatePayload) =>
      documentTemplateService.createDocumentTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["documentTemplates"]);
      toast.success("Shablon muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateDocumentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: DocumentTemplateUpdatePayload;
    }) => documentTemplateService.updateDocumentTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["documentTemplates"]);
      toast.success("Shablon muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteDocumentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      documentTemplateService.deleteDocumentTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["documentTemplates"]);
      toast.success("Shablon muvaffaqiyatli o'chirildi");
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

export const useGetDocumentTemplateById = (id: string) => {
  return useQuery({
    queryKey: ["documentTemplate", id],
    queryFn: () => documentTemplateService.getDocumentTemplateById(id),
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
