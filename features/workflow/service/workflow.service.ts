import axiosInstance from "@/api/axios.instance";
import {
  WorkflowQueryParams,
  WorkflowListResponse,
  WorkflowApiResponse,
  WorkflowStepUpdateType,
  WorkflowStepApiResponse,
  WorkflowStepRejectPayload,
  MyTasksResponse,
  MyTasksQueryParams,
  WorkflowFromTemplatePayload,
} from "@/features/workflow/type/workflow.type";
import { WorkflowCreateType } from "../schema/workflow.schema";
import { endpoints } from "@/api/axios.endpoints";

export const workflowService = {
  getAllWorkflows: async (params?: WorkflowQueryParams) => {
    const { data } = await axiosInstance.get<WorkflowListResponse>(endpoints.workflow.list, {
      params: {
        documentId: params?.documentId,
        status: params?.status,
        type: params?.type,
        page: params?.page,
        limit: params?.limit,
      },
    });
    return data;
  },

  createWorkflow: async (payload: WorkflowCreateType) => {
    const { data } = await axiosInstance.post<WorkflowApiResponse>(endpoints.workflow.create, payload);
    return data;
  },

  createWorkflowFromTemplate: async (payload: WorkflowFromTemplatePayload) => {
    const { data } = await axiosInstance.post<WorkflowApiResponse>(endpoints.workflow.create, payload);
    return data;
  },

  updateWorkflow: async (id: string, payload: Partial<WorkflowCreateType>) => {
    const { data } = await axiosInstance.patch<WorkflowApiResponse>(endpoints.workflow.update(id), payload);
    return data;
  },

  deleteWorkflow: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.workflow.delete(id));
    return data;
  },

  getWorkflowById: async (id: string) => {
    const { data } = await axiosInstance.get<WorkflowApiResponse>(endpoints.workflow.detail(id));
    return data;
  },

  getWorkflowSteps: async (workflowId: string) => {
    const { data } = await axiosInstance.get(`/api/v1/workflow-step/workflow/${workflowId}`);
    return data;
  },

  updateWorkflowStep: async (id: string, payload: WorkflowStepUpdateType) => {
    const { data } = await axiosInstance.patch<WorkflowStepApiResponse>(endpoints.workflowStep.update(id), payload);
    return data;
  },

  completeWorkflowStep: async (id: string, comment?: string) => {
    const { data } = await axiosInstance.patch<WorkflowStepApiResponse>(
      endpoints.workflowStep.complete(id),
      comment ? { comment } : {},
    );
    return data;
  },

  rejectWorkflowStep: async (id: string, payload?: WorkflowStepRejectPayload) => {
    const { data } = await axiosInstance.patch<WorkflowStepApiResponse>(
      endpoints.workflowStep.reject(id),
      payload || {},
    );
    return data;
  },

  getMyTasks: async (params?: MyTasksQueryParams) => {
    const queryParams: Record<string, any> = {
      pageNumber: params?.page ?? 1,
      pageSize: params?.limit ?? 9,
    };

    if (params?.status) queryParams.status = params.status;
    if (params?.actionType) queryParams.actionType = params.actionType;

    const { data } = await axiosInstance.get<MyTasksResponse>(endpoints.workflowStep.list, {
      params: queryParams,
    });
    return data;
  },
};
