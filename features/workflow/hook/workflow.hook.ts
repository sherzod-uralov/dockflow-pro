import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  WorkflowListResponse,
  WorkflowApiResponse,
  WorkflowQueryParams,
  WorkflowStepUpdateType,
  WorkflowStepRejectPayload,
  MyTasksResponse,
  MyTasksQueryParams,
  RollbackUser,
} from "@/features/workflow/type/workflow.type";
import { WorkflowCreateType } from "../schema/workflow.schema";
import { toast } from "sonner";
import { useGetUserByIdQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useMemo } from "react";
import { workflowService } from "@/features/workflow";

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkflowCreateType) =>
      workflowService.createWorkflow(payload),
    onSuccess: () => {
      queryClient?.invalidateQueries(["workflows"]);
      toast.success("Workflow muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Workflow yaratishda xatolik");
    },
  });
};

export const useGetAllWorkflows = (params?: WorkflowQueryParams) => {
  return useQuery<WorkflowListResponse>({
    queryKey: ["workflows", params],
    queryFn: () => workflowService.getAllWorkflows(params),
    keepPreviousData: true,
  });
};

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
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["workflow", variables.id]);
      toast.success("Workflow muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Workflow yangilashda xatolik");
    },
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient?.invalidateQueries(["workflows"]);
      toast.success("Workflow muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      toast.error(error.message || "O'chirishda xatolik yuz berdi");
    },
  });
};

export const useGetWorkflowById = (id: string) => {
  return useQuery<WorkflowApiResponse>({
    queryKey: ["workflow", id],
    queryFn: () => workflowService.getWorkflowById(id),
    enabled: !!id,
    onError: (error: any) => {
      toast.error(error.message || "Ma'lumotni olishda xatolik");
    },
  });
};

export const useGetWorkflowSteps = (workflowId: string) => {
  return useQuery({
    queryKey: ["workflow-steps", workflowId],
    queryFn: () => workflowService.getWorkflowSteps(workflowId),
    enabled: !!workflowId,
  });
};

export const useUpdateWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkflowStepUpdateType }) =>
      workflowService.updateWorkflowStep(id, data),
    onSuccess: (response, variables) => {
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["workflow-steps"]);
      if (response?.workflowId) {
        queryClient?.invalidateQueries(["workflow", response.workflowId]);
      }

      toast.success("Workflow step muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Workflow step yangilashda xatolik");
    },
  });
};

export const useCompleteWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowService.completeWorkflowStep(id),
    onSuccess: (response) => {
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["workflow-steps"]);
      queryClient?.invalidateQueries(["my-tasks"]);

      if (response?.workflowId) {
        queryClient?.invalidateQueries(["workflow", response.workflowId]);
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
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["workflow-steps"]);
      queryClient?.invalidateQueries(["my-tasks"]);

      if (response?.workflowId) {
        queryClient?.invalidateQueries(["workflow", response.workflowId]);
      }

      toast.success("Vazifa rad etildi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Vazifani rad etishda xatolik");
    },
  });
};

export const useGetMyTasks = (params?: MyTasksQueryParams) => {
  return useQuery<MyTasksResponse>({
    queryKey: ["my-tasks", params],
    queryFn: () => workflowService.getMyTasks(params),
    keepPreviousData: true,
  });
};

export const useEnrichedRollbackUsers = (
  rollbackUsers: RollbackUser[],
): {
  enrichedUsers: RollbackUser[];
  isLoading: boolean;
  hasError: boolean;
} => {
  const userIds = useMemo(
    () => [...new Set(rollbackUsers.map((u) => u.userId))],
    [rollbackUsers],
  );

  const userQueries = userIds.map((userId) => {
    return useGetUserByIdQuery(userId);
  });

  const isLoading = userQueries.some((query) => query.isLoading);
  const hasError = userQueries.some((query) => query.isError);

  const enrichedUsers = useMemo(() => {
    return rollbackUsers.map((rollbackUser) => {
      const userQuery = userQueries.find(
        (query) => query.data?.id === rollbackUser.userId,
      );

      if (userQuery?.data) {
        return {
          ...rollbackUser,
          userEmail: undefined,
          userRole: userQuery.data.role?.name,
          username: userQuery.data.username,
        };
      }

      return rollbackUser;
    });
  }, [rollbackUsers, userQueries]);

  return {
    enrichedUsers,
    isLoading,
    hasError,
  };
};
