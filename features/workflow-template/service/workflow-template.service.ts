import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  WorkflowTemplateCreatePayload,
  WorkflowTemplateQueryParams,
  WorkflowTemplateUpdatePayload,
} from "../type/workflow-template.type";

export const workflowTemplateService = {
  getAllWorkflowTemplates: async (params?: WorkflowTemplateQueryParams) => {
    const { data } = await axiosInstance.get(endpoints.workflowTemplate.list, {
      params: {
        search: params?.search,
        documentTypeId: params?.documentTypeId,
        type: params?.type,
        isActive: params?.isActive,
        isPublic: params?.isPublic,
        page: params?.page ?? params?.pageNumber,
        limit: params?.limit ?? params?.pageSize,
      },
    });
    return data;
  },

  createWorkflowTemplate: async (payload: WorkflowTemplateCreatePayload) => {
    const { data } = await axiosInstance.post(endpoints.workflowTemplate.create, payload);
    return data;
  },

  updateWorkflowTemplate: async (id: string, payload: WorkflowTemplateUpdatePayload) => {
    const { data } = await axiosInstance.patch(endpoints.workflowTemplate.update(id), payload);
    return data;
  },

  deleteWorkflowTemplate: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.workflowTemplate.delete(id));
    return data;
  },

  getWorkflowTemplateById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.workflowTemplate.detail(id));
    return data;
  },
};
