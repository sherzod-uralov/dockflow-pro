import { useMutation, useQuery, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
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
      showSuccess("Workflow shablon muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      showError(error);
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
      showSuccess("Workflow shablon muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      showError(error);
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
      showSuccess("Workflow shablon muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useGetWorkflowTemplateById = (id: string) => {
  return useQuery<WorkflowTemplateResponse>({
    queryKey: ["workflowTemplate", id],
    queryFn: () => workflowTemplateService.getWorkflowTemplateById(id),
    enabled: !!id,
    onError: (error: any) => {
      showError(error);
    },
  });
};
