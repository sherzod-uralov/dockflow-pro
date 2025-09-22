import axiosInstance from "@/api/axios.instance";
import { DocumentType, DocumentTypeQueryParams } from "../type/document-type.type";
import { errorHandlers } from "@/utils/http-error-handler";
import { endpoints } from "@/api/axios.endpoints";

const documentTypeHandler = errorHandlers.documentType;

export const documentTypeService = {
  getAllDocumentTypes: async (params?: DocumentTypeQueryParams) => {
    return await documentTypeHandler.executeList(() =>
      axiosInstance.get(endpoints.documentType.list, {
        params: {
          search: params?.search,
          pageSize: params?.pageSize,
          pageNumber: params?.pageNumber,
        },
      }),
    );
  },
  createDocumentType: async (data: DocumentType) => {
    return await documentTypeHandler.executeCreate(() =>
      axiosInstance.post(endpoints.documentType.create, data),
    );
  },
  updateDocumentType: async (id: string, data: Partial<DocumentType>) => {
    return await documentTypeHandler.executeUpdate(() =>
      axiosInstance.patch(endpoints.documentType.update(id), data),
    );
  },
  deleteDocumentType: async (id: string) => {
    return await documentTypeHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.documentType.delete(id)),
    );
  },
  getDocumentTypeById: async (id: string) => {
    return await documentTypeHandler.executeGet(() =>
      axiosInstance.get(endpoints.documentType.detail(id)),
    );
  },
};
