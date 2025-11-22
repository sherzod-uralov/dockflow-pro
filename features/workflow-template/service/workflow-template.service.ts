import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { handleWorkflowTemplateError } from "@/utils/http-error-handler";
import {
  WorkflowTemplateCreatePayload,
  WorkflowTemplateQueryParams,
  WorkflowTemplateUpdatePayload,
} from "../type/workflow-template.type";

const workflowTemplateHandler = handleWorkflowTemplateError;

export const workflowTemplateService = {
  getAllWorkflowTemplates: async (params?: WorkflowTemplateQueryParams) => {
    return await workflowTemplateHandler.executeList(() =>
      axiosInstance.get(endpoints.workflowTemplate.list, {
        params: {
          search: params?.search,
          documentTypeId: params?.documentTypeId,
          type: params?.type,
          isActive: params?.isActive,
          isPublic: params?.isPublic,
          page: params?.page ?? params?.pageNumber,
          limit: params?.limit ?? params?.pageSize,
        },
      }),
    );
  },

  createWorkflowTemplate: async (data: WorkflowTemplateCreatePayload) => {
    return await workflowTemplateHandler.executeCreate(() =>
      axiosInstance.post(endpoints.workflowTemplate.create, data),
    );
  },

  updateWorkflowTemplate: async (
    id: string,
    data: WorkflowTemplateUpdatePayload,
  ) => {
    return await workflowTemplateHandler.executeUpdate(() =>
      axiosInstance.patch(endpoints.workflowTemplate.update(id), data),
    );
  },

  deleteWorkflowTemplate: async (id: string) => {
    return await workflowTemplateHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.workflowTemplate.delete(id)),
    );
  },

  getWorkflowTemplateById: async (id: string) => {
    return await workflowTemplateHandler.executeGet(() =>
      axiosInstance.get(endpoints.workflowTemplate.detail(id)),
    );
  },
};
