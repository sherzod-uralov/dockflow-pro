import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { handleDocumentTemplateError } from "@/utils/http-error-handler";
import {
  DocumentTemplateCreatePayload,
  DocumentTemplateQueryParams,
  DocumentTemplateUpdatePayload,
} from "@/features/document-template";

const documentTemplateHandler = handleDocumentTemplateError;

export const documentTemplateService = {
  getAllDocumentTemplates: async (params?: DocumentTemplateQueryParams) => {
    return await documentTemplateHandler.executeList(() =>
      axiosInstance.get(endpoints.documentTemplate.list, {
        params: {
          search: params?.search,
          pageNumber: params?.pageNumber,
          pageSize: params?.pageSize,
          documentTypeId: params?.documentTypeId,
          isActive: params?.isActive,
          isPublic: params?.isPublic,
        },
      }),
    );
  },

  createDocumentTemplate: async (data: DocumentTemplateCreatePayload) => {
    return await documentTemplateHandler.executeCreate(() =>
      axiosInstance.post(endpoints.documentTemplate.create, data),
    );
  },

  updateDocumentTemplate: async (
    id: string,
    data: DocumentTemplateUpdatePayload,
  ) => {
    return await documentTemplateHandler.executeUpdate(() =>
      axiosInstance.patch(endpoints.documentTemplate.update(id), data),
    );
  },

  deleteDocumentTemplate: async (id: string) => {
    return await documentTemplateHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.documentTemplate.delete(id)),
    );
  },

  getDocumentTemplateById: async (id: string) => {
    return await documentTemplateHandler.executeGet(() =>
      axiosInstance.get(endpoints.documentTemplate.detail(id)),
    );
  },
};
