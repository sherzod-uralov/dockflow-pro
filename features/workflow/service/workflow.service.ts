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
} from "../type/workflow.type";
import { WorkflowCreateType } from "../schema/workflow.schema";
import { errorHandlers } from "@/utils/http-error-handler";
import { endpoints } from "@/api/axios.endpoints";

const workflowHandler = errorHandlers.workflow;

export const workflowService = {
  /**
   * Получить список всех workflows с пагинацией
   */
  getAllWorkflows: async (params?: WorkflowQueryParams) => {
    return await workflowHandler.executeList(() =>
      axiosInstance.get<WorkflowListResponse>(endpoints.workflow.list, {
        params: {
          documentId: params?.documentId, // ✨ ИЗМЕНЕНО
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
    return await workflowHandler.executeCreate(() =>
      axiosInstance.post<WorkflowApiResponse>(endpoints.workflow.create, data),
    );
  },

  /**
   * Обновить workflow и его steps
   * Можно обновить как сам workflow, так и его steps
   */
  updateWorkflow: async (id: string, data: Partial<WorkflowCreateType>) => {
    return await workflowHandler.executeUpdate(() =>
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
    return await workflowHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.workflow.delete(id)),
    );
  },

  /**
   * Получить один workflow по ID с полными данными
   */
  getWorkflowById: async (id: string) => {
    return await workflowHandler.executeGet(() =>
      axiosInstance.get<WorkflowApiResponse>(endpoints.workflow.detail(id)),
    );
  },

  /**
   * Получить steps конкретного workflow
   */
  getWorkflowSteps: async (workflowId: string) => {
    return await workflowHandler.executeList(() =>
      axiosInstance.get(`/api/v1/workflow-step/workflow/${workflowId}`),
    );
  },

  /**
   * Обновить конкретный workflow step
   */
  updateWorkflowStep: async (id: string, data: WorkflowStepUpdateType) => {
    return await workflowHandler.executeUpdate(() =>
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
    return await workflowHandler.executeUpdate(() =>
      axiosInstance.patch<WorkflowStepApiResponse>(
        endpoints.workflowStep.complete(id),
      ),
    );
  },

  /**
   * Отклонить workflow step
   */
  rejectWorkflowStep: async (
    id: string,
    data?: WorkflowStepRejectPayload,
  ) => {
    return await workflowHandler.executeUpdate(() =>
      axiosInstance.patch<WorkflowStepApiResponse>(
        endpoints.workflowStep.reject(id),
        data || {},
      ),
    );
  },

  /**
   * Получить мои задачи (workflows, назначенные текущему пользователю)
   * Backend автоматически фильтрует по accessToken
   */
  getMyTasks: async (params?: MyTasksQueryParams) => {
    return await workflowHandler.executeList(() =>
      axiosInstance.get<WorkflowListResponse>(endpoints.workflow.list, {
        params: {
          status: params?.status,
          page: params?.page,
          limit: params?.limit,
        },
      }),
    );
  },
};
