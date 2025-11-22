import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { workflowTemplateService } from "../service/workflow-template.service";
import {
  WorkflowTemplateQueryParams,
  GetAllWorkflowTemplates,
  WorkflowTemplateCreatePayload,
  WorkflowTemplateUpdatePayload,
  WorkflowTemplateResponse,
} from "../type/workflow-template.type";

export const useGetAllWorkflowTemplates = (
  params?: WorkflowTemplateQueryParams,
) => {
  return useQuery<GetAllWorkflowTemplates>({
    queryKey: ["workflowTemplates", params],
    queryFn: () => workflowTemplateService.getAllWorkflowTemplates(params),
    keepPreviousData: true,
  });
};

export const useCreateWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WorkflowTemplateCreatePayload) =>
      workflowTemplateService.createWorkflowTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["workflowTemplates"]);
      toast.success("Workflow shablon muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Yaratishda xatolik yuz berdi");
    },
  });
};

export const useUpdateWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: WorkflowTemplateUpdatePayload;
    }) => workflowTemplateService.updateWorkflowTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["workflowTemplates"]);
      toast.success("Workflow shablon muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Yangilashda xatolik yuz berdi");
    },
  });
};

export const useDeleteWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      workflowTemplateService.deleteWorkflowTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["workflowTemplates"]);
      toast.success("Workflow shablon muvaffaqiyatli o'chirildi");
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

export const useGetWorkflowTemplateById = (id: string) => {
  return useQuery<WorkflowTemplateResponse>({
    queryKey: ["workflowTemplate", id],
    queryFn: () => workflowTemplateService.getWorkflowTemplateById(id),
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
