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
} from "@/features/workflow/type/workflow.type";
import { WorkflowCreateType } from "../schema/workflow.schema";
import { workflowErrorHandler } from "../error/workflow.http.error";
import { endpoints } from "@/api/axios.endpoints";

export const workflowService = {
  getAllWorkflows: async (params?: WorkflowQueryParams) => {
    return workflowErrorHandler(() =>
      axiosInstance.get<WorkflowListResponse>(endpoints.workflow.list, {
        params: {
          documentId: params?.documentId,
          status: params?.status,
          page: params?.page, // ✨ ИЗМЕНЕНО: было pageNumber
          limit: params?.limit, // ✨ ИЗМЕНЕНО: было pageSize
        },
      }),
    );
  },

  /**
   * Создать workflow с вложенными steps
   * Backend автоматически создаст все steps за один запрос
   */
  createWorkflow: async (data: WorkflowCreateType) => {
    return workflowErrorHandler(() =>
      axiosInstance.post<WorkflowApiResponse>(endpoints.workflow.create, data),
    );
  },

  /**
   * Обновить workflow и его steps
   * Можно обновить как сам workflow, так и его steps
   */
  updateWorkflow: async (id: string, data: Partial<WorkflowCreateType>) => {
    return workflowErrorHandler(() =>
      axiosInstance.patch<WorkflowApiResponse>(
        endpoints.workflow.update(id),
        data,
      ),
    );
  },

  /**
   * Удалить workflow (cascade удаление steps происходит на backend)
   */
  deleteWorkflow: async (id: string) => {
    return workflowErrorHandler(() =>
      axiosInstance.delete(endpoints.workflow.delete(id)),
    );
  },

  /**
   * Получить один workflow по ID с полными данными
   */
  getWorkflowById: async (id: string) => {
    return workflowErrorHandler(() =>
      axiosInstance.get<WorkflowApiResponse>(endpoints.workflow.detail(id)),
    );
  },

  /**
   * Получить steps конкретного workflow
   */
  getWorkflowSteps: async (workflowId: string) => {
    return workflowErrorHandler(() =>
      axiosInstance.get(`/api/v1/workflow-step/workflow/${workflowId}`),
    );
  },

  /**
   * Обновить конкретный workflow step
   */
  updateWorkflowStep: async (id: string, data: WorkflowStepUpdateType) => {
    return workflowErrorHandler(() =>
      axiosInstance.patch<WorkflowStepApiResponse>(
        endpoints.workflowStep.update(id),
        data,
      ),
    );
  },

  /**
   * Завершить (принять) workflow step
   */
  completeWorkflowStep: async (id: string) => {
    return workflowErrorHandler(() =>
      axiosInstance.patch<WorkflowStepApiResponse>(
        endpoints.workflowStep.complete(id),
      ),
    );
  },

  /**
   * Отклонить workflow step
   */
  rejectWorkflowStep: async (id: string, data?: WorkflowStepRejectPayload) => {
    return workflowErrorHandler(() =>
      axiosInstance.patch<WorkflowStepApiResponse>(
        endpoints.workflowStep.reject(id),
        data || {},
      ),
    );
  },

  getMyTasks: async (params?: MyTasksQueryParams) => {
    const queryParams: Record<string, any> = {
      pageNumber: params?.page ?? 1,
      pageSize: params?.limit ?? 9,
    };

    if (params?.status) queryParams.status = params.status;
    if (params?.actionType) queryParams.actionType = params.actionType;

    return workflowErrorHandler(() =>
      axiosInstance.get<MyTasksResponse>(endpoints.workflowStep.list, {
        params: queryParams,
      }),
    );
  },
};
