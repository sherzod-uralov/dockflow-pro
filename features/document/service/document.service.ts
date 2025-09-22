import axiosInstance from "@/api/axios.instance";
import { Document, DocumentQueryParams } from "../type/document.type";
import { errorHandlers } from "@/utils/http-error-handler";
import { endpoints } from "@/api/axios.endpoints";

const documentHandler = errorHandlers.document;

export const documentService = {
  getAllDocuments: async (params?: DocumentQueryParams) => {
    return await documentHandler.executeList(() =>
      axiosInstance.get(endpoints.document.list, {
        params: {
          search: params?.search,
          pageSize: params?.pageSize,
          pageNumber: params?.pageNumber,
        },
      }),
    );
  },
  createDocument: async (data: Document) => {
    return await documentHandler.executeCreate(() =>
      axiosInstance.post(endpoints.document.create, data),
    );
  },
  updateDocument: async (id: string, data: Partial<Document>) => {
    return await documentHandler.executeUpdate(() =>
      axiosInstance.patch(endpoints.document.update(id), data),
    );
  },
  deleteDocument: async (id: string) => {
    return await documentHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.document.delete(id)),
    );
  },
  getDocumentById: async (id: string) => {
    return await documentHandler.executeGet(() =>
      axiosInstance.get(endpoints.document.detail(id)),
    );
  },
};
