import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { DocumentTypeQueryParams, DocumentType as DocumentTypeModel } from "@/features/document-type";

export const documentTypeService = {
  getAllDocumentTypes: async (params?: DocumentTypeQueryParams) => {
    const { data } = await axiosInstance.get(endpoints.documentType.list, {
      params: {
        search: params?.search,
        pageSize: params?.pageSize,
        pageNumber: params?.pageNumber,
      },
    });
    return data;
  },

  createDocumentType: async (payload: DocumentTypeModel) => {
    const { data } = await axiosInstance.post(endpoints.documentType.create, payload);
    return data;
  },

  updateDocumentType: async (id: string, payload: Partial<DocumentTypeModel>) => {
    const { data } = await axiosInstance.patch(endpoints.documentType.update(id), payload);
    return data;
  },

  deleteDocumentType: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.documentType.delete(id));
    return data;
  },

  getDocumentTypeById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.documentType.detail(id));
    return data;
  },
};
