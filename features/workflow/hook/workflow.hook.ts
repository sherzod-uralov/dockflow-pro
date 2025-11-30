import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  WorkflowListResponse,
  WorkflowApiResponse,
  WorkflowQueryParams,
  WorkflowStepUpdateType,
  WorkflowStepRejectPayload,
  MyTasksResponse,
  MyTasksQueryParams,
  WorkflowFromTemplatePayload, RollbackUser,
} from "@/features/workflow/type/workflow.type";
import { WorkflowCreateType } from "../schema/workflow.schema";
import { workflowService } from "@/features/workflow";
import { showError, showSuccess } from "@/utils/show-error";
import { useGetUserByIdQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useMemo } from "react";

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkflowCreateType) => workflowService.createWorkflow(payload),
    onSuccess: () => {
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["my-tasks"]);
      showSuccess("Hujjat aylanmasi yaratildi");
    },
    onError: showError,
  });
};

export const useCreateWorkflowFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkflowFromTemplatePayload) =>
      workflowService.createWorkflowFromTemplate(payload),
    onSuccess: () => {
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["my-tasks"]);
      showSuccess("Hujjat aylanmasi yaratildi");
    },
    onError: showError,
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
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowCreateType> }) =>
      workflowService.updateWorkflow(id, data),
    onSuccess: (_, variables) => {
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["workflow", variables.id]);
      showSuccess("Hujjat aylanmasi yangilandi");
    },
    onError: showError,
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient?.invalidateQueries(["workflows"]);
      showSuccess("Hujjat aylanmasi o'chirildi");
    },
    onError: showError,
  });
};

export const useGetWorkflowById = (id: string) => {
  return useQuery<WorkflowApiResponse>({
    queryKey: ["workflow", id],
    queryFn: () => workflowService.getWorkflowById(id),
    enabled: !!id,
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
    onSuccess: (response) => {
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["workflow-steps"]);
      if (response?.workflowId) {
        queryClient?.invalidateQueries(["workflow", response.workflowId]);
      }
      showSuccess("Bosqich yangilandi");
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

      showSuccess("Vazifa tasdiqlandi");
    },
    onError: showError,
  });
};

export const useRejectWorkflowStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: WorkflowStepRejectPayload }) =>
      workflowService.rejectWorkflowStep(id, data),
    onSuccess: (response) => {
      queryClient?.invalidateQueries(["workflows"]);
      queryClient?.invalidateQueries(["workflow-steps"]);
      queryClient?.invalidateQueries(["my-tasks"]);

      if (response?.workflowId) {
        queryClient?.invalidateQueries(["workflow", response.workflowId]);
      }

      showSuccess("Vazifa rad etildi");
    },
    onError: showError,
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