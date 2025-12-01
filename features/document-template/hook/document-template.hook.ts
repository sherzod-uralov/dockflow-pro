import { useMutation, useQuery, useQueryClient } from "react-query";
import { documentTemplateService } from "../service/document-template.service";
import {
  DocumentTemplateQueryParams,
  GetAllDocumentTemplates,
  DocumentTemplateCreatePayload,
  DocumentTemplateUpdatePayload,
} from "../type/document-template.type";
import { showError, showSuccess } from "@/utils/show-error";

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
      showSuccess("Shablon muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      showError(error);
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
      showSuccess("Shablon muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      showError(error);
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
      showSuccess("Shablon muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useGetDocumentTemplateById = (id: string) => {
  return useQuery({
    queryKey: ["documentTemplate", id],
    queryFn: () => documentTemplateService.getDocumentTemplateById(id),
    enabled: !!id,
    onError: (error: any) => {
      showError(error);
    },
  });
};
