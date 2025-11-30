import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { DocumentQueryParams, GetAllDocuments } from "@/features/document";
import { DocumentFormType } from "@/features/document/schema/document.schema";

export const documentService = {
  getAllDocuments: async (params?: DocumentQueryParams) => {
    const { data } = await axiosInstance.get<GetAllDocuments>(endpoints.document.list, {
      params: {
        search: params?.search,
        pageSize: params?.pageSize,
        pageNumber: params?.pageNumber,
        documentTypeId: params?.documentTypeId,
        journalId: params?.journalId,
        status: params?.status,
        priority: params?.priority,
        templateId: params?.templateId,
      },
    });
    return data;
  },

  createDocument: async (payload: DocumentFormType) => {
    const { data } = await axiosInstance.post(endpoints.document.create, payload);
    return data;
  },

  updateDocument: async (id: string, payload: Partial<DocumentFormType>) => {
    const { data } = await axiosInstance.patch(endpoints.document.update(id), payload);
    return data;
  },

  deleteDocument: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.document.delete(id));
    return data;
  },

  getDocumentById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.document.detail(id));
    return data;
  },
};
