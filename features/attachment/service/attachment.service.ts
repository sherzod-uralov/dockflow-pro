import axiosInstance from "@/api/axios.instance";
import { handleAttachmentError } from "@/utils/http-error-handler";
import { endpoints } from "@/api/axios.endpoints";
import { AttachmentQueryParams } from "@/features/attachment/type/attachment.type";
import { AttachmentInferType } from "@/features/attachment/schema/attachment.schema";

const attachmentHandler = handleAttachmentError;

export const attachmentService = {
  getAllAttachments: async (params?: AttachmentQueryParams) => {
    return await attachmentHandler.executeList(() =>
      axiosInstance.get(endpoints.attachment.list, {
        params: {
          search: params?.search,
          pageNumber: params?.pageNumber,
          pageSize: params?.pageSize,
          documentId: params?.documentId,
          uploadedById: params?.uploadedById,
        },
      }),
    );
  },

  createAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await attachmentHandler.executeCreate(() =>
      axiosInstance.post<{
        fileUrl: any;
        id: string;
      }>(endpoints.attachment.create, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }),
    );
  },

  updateAttachment: async (id: string, data: Partial<AttachmentInferType>) => {
    return await attachmentHandler.executeUpdate(() =>
      axiosInstance.patch(endpoints.attachment.update(id), data),
    );
  },

  deleteAttachment: async (id: string) => {
    return await attachmentHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.attachment.delete(id)),
    );
  },

  getAttachmentById: async (id: string) => {
    return await attachmentHandler.executeGet(() =>
      axiosInstance.get(endpoints.attachment.detail(id)),
    );
  },
};
