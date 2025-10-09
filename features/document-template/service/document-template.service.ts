import axiosInstance from "@/api/axios.instance";
import { DocumentTemplate, DocumentTemplateQueryParams } from "../type/document-template.type";
import { errorHandlers } from "@/utils/http-error-handler";
import { endpoints } from "@/api/axios.endpoints";

const documentTemplateHandler = errorHandlers.documentTemplate;

export const documentTemplateService = {
  getAllDocumentTemplates: async (params?: DocumentTemplateQueryParams) => {
    return await documentTemplateHandler.executeList(() =>
      axiosInstance.get(endpoints.documentTemplate.list, {
        params: {
          search: params?.search,
          pageSize: params?.pageSize,
          pageNumber: params?.pageNumber,
        },
      }),
    );
  },
  createDocumentTemplate: async (data: DocumentTemplate) => {
    return await documentTemplateHandler.executeCreate(() =>
      axiosInstance.post(endpoints.documentTemplate.create, data),
    );
  },
  updateDocumentTemplate: async (id: string, data: Partial<DocumentTemplate>) => {
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
