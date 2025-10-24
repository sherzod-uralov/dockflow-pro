import { useMutation, useQuery, useQueryClient } from "react-query";
import { workflowService } from "../service/workflow.service";
import {
  WorkflowListResponse,
  WorkflowApiResponse,
  WorkflowQueryParams,
  WorkflowStepUpdateType,
  WorkflowStepApiResponse,
  WorkflowStepRejectPayload,
  MyTasksResponse,
  MyTasksQueryParams,
} from "../type/workflow.type";
import { WorkflowCreateType } from "../schema/workflow.schema";
import { toast } from "sonner";

/**
 * Создать workflow с вложенными steps
 */
export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkflowCreateType) =>
      workflowService.createWorkflow(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["workflows"]);
      toast.success("Workflow muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Workflow yaratishda xatolik");
    },
  });
};

/**
 * Получить список всех workflows с пагинацией и фильтрацией
 */
export const useGetAllWorkflows = (params?: WorkflowQueryParams) => {
  return useQuery<WorkflowListResponse>({
    queryKey: ["workflows", params], // ✨ Весь объект params в ключе
    queryFn: () => workflowService.getAllWorkflows(params),
    keepPreviousData: true,
  });
};

/**
 * Обновить workflow и его steps
 */
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<WorkflowCreateType>;
    }) => workflowService.updateWorkflow(id, data),
    onSuccess: (_, variables) => {
      // Инвалидировать список и конкретный workflow
      queryClient.invalidateQueries(["workflows"]);
      queryClient.invalidateQueries(["workflow", variables.id]);
      toast.success("Workflow muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Workflow yangilashda xatolik");
    },
  });
};

/**
 * Удалить workflow
 */
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["workflows"]);
      toast.success("Workflow muvaffaqiyatli o'chirildi");
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

/**
 * Получить один workflow по ID с полными данными
 */
export const useGetWorkflowById = (id: string) => {
  return useQuery<WorkflowApiResponse>({
    queryKey: ["workflow", id],
    queryFn: () => workflowService.getWorkflowById(id),
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

/**
 * Получить steps конкретного workflow
 */
export const useGetWorkflowSteps = (workflowId: string) => {
  return useQuery({
    queryKey: ["workflow-steps", workflowId],
    queryFn: () => workflowService.getWorkflowSteps(workflowId),
    enabled: !!workflowId,
  });
};

/**
 * Обновить конкретный workflow step
 */
export const useUpdateWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: WorkflowStepUpdateType;
    }) => workflowService.updateWorkflowStep(id, data),
    onSuccess: (response, variables) => {
      // Инвалидировать список workflows и workflow steps
      queryClient.invalidateQueries(["workflows"]);
      queryClient.invalidateQueries(["workflow-steps"]);

      // Если есть workflowId в ответе, инвалидировать конкретный workflow
      if (response?.workflowId) {
        queryClient.invalidateQueries(["workflow", response.workflowId]);
      }

      toast.success("Workflow step muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Workflow step yangilashda xatolik");
    },
  });
};

/**
 * Завершить (принять) workflow step
 */
export const useCompleteWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowService.completeWorkflowStep(id),
    onSuccess: (response) => {
      // Инвалидировать все связанные запросы
      queryClient.invalidateQueries(["workflows"]);
      queryClient.invalidateQueries(["workflow-steps"]);
      queryClient.invalidateQueries(["my-tasks"]);

      if (response?.workflowId) {
        queryClient.invalidateQueries(["workflow", response.workflowId]);
      }

      toast.success("Vazifa muvaffaqiyatli tasdiqlandi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Vazifani tasdiqlashda xatolik");
    },
  });
};

/**
 * Отклонить workflow step
 */
export const useRejectWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: WorkflowStepRejectPayload;
    }) => workflowService.rejectWorkflowStep(id, data),
    onSuccess: (response) => {
      // Инвалидировать все связанные запросы
      queryClient.invalidateQueries(["workflows"]);
      queryClient.invalidateQueries(["workflow-steps"]);
      queryClient.invalidateQueries(["my-tasks"]);

      if (response?.workflowId) {
        queryClient.invalidateQueries(["workflow", response.workflowId]);
      }

      toast.success("Vazifa rad etildi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Vazifani rad etishda xatolik");
    },
  });
};

/**
 * Получить мои задачи (workflows текущего пользователя)
 * Backend автоматически фильтрует по accessToken
 */
export const useGetMyTasks = (params?: MyTasksQueryParams) => {
  return useQuery<WorkflowListResponse>({
    queryKey: ["my-tasks", params],
    queryFn: () => workflowService.getMyTasks(params),
    keepPreviousData: true,
  });
};
