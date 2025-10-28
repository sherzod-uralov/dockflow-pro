import axiosInstance from "@/api/axios.instance";
import { handleDocumentTypeError } from "@/utils/http-error-handler";
import { endpoints } from "@/api/axios.endpoints";
import { DocumentTypeQueryParams, DocumentType as DocumentTypeModel } from "@/features/document-type";

const documentTypeHandler = handleDocumentTypeError;
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
  createDocumentType: async (data: DocumentTypeModel) => {
    return await documentTypeHandler.executeCreate(() =>
      axiosInstance.post(endpoints.documentType.create, data),
    );
  },
  updateDocumentType: async (id: string, data: Partial<DocumentTypeModel>) => {
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
