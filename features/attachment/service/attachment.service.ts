import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { AttachmentQueryParams } from "@/features/attachment/type/attachment.type";
import { AttachmentInferType } from "@/features/attachment/schema/attachment.schema";

export const attachmentService = {
  getAllAttachments: async (params?: AttachmentQueryParams) => {
    const { data } = await axiosInstance.get(endpoints.attachment.list, {
      params: {
        search: params?.search,
        pageNumber: params?.pageNumber,
        pageSize: params?.pageSize,
        documentId: params?.documentId,
        uploadedById: params?.uploadedById,
      },
    });
    return data;
  },

  createAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axiosInstance.post<{ fileUrl: string; id: string }>(
      endpoints.attachment.create,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      }
    );
    return data;
  },

  updateAttachment: async (id: string, payload: Partial<AttachmentInferType>) => {
    const { data } = await axiosInstance.patch(endpoints.attachment.update(id), payload);
    return data;
  },

  deleteAttachment: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.attachment.delete(id));
    return data;
  },

  getAttachmentById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.attachment.detail(id));
    return data;
  },
};
