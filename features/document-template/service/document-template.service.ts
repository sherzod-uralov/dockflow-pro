import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  DocumentTemplateCreatePayload,
  DocumentTemplateQueryParams,
  DocumentTemplateUpdatePayload,
} from "@/features/document-template";

export const documentTemplateService = {
  getAllDocumentTemplates: async (params?: DocumentTemplateQueryParams) => {
    const { data } = await axiosInstance.get(endpoints.documentTemplate.list, {
      params: {
        search: params?.search,
        pageNumber: params?.pageNumber,
        pageSize: params?.pageSize,
        documentTypeId: params?.documentTypeId,
        isActive: params?.isActive,
        isPublic: params?.isPublic,
      },
    });
    return data;
  },

  createDocumentTemplate: async (payload: DocumentTemplateCreatePayload) => {
    const { data } = await axiosInstance.post(endpoints.documentTemplate.create, payload);
    return data;
  },

  updateDocumentTemplate: async (id: string, payload: DocumentTemplateUpdatePayload) => {
    const { data } = await axiosInstance.patch(endpoints.documentTemplate.update(id), payload);
    return data;
  },

  deleteDocumentTemplate: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.documentTemplate.delete(id));
    return data;
  },

  getDocumentTemplateById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.documentTemplate.detail(id));
    return data;
  },
};
