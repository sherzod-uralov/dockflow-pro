import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  Attachment,
  GetAllAttachments,
  AttachmentQueryParams,
} from "@/features/attachment/type/attachment.type";
import { AttachmentInferType } from "@/features/attachment/schema/attachment.schema";

const baseCRUDService = createCRUDService<
  Attachment,
  AttachmentInferType,
  Partial<AttachmentInferType>,
  AttachmentQueryParams,
  GetAllAttachments
>(endpoints.attachment, {
  transformParams: (params) => ({
    search: params?.search,
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    documentId: params?.documentId,
    uploadedById: params?.uploadedById,
  }),
});

// Custom create with FormData for file upload
const createAttachment = async (file: File) => {
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
};

// Repair filenames utility
const repairFilenames = async () => {
  const { data } = await axiosInstance.post(endpoints.attachment.repairFilenames);
  return data;
};

// Export service with standard CRUD interface + custom create
export const attachmentService = {
  ...baseCRUDService,
  create: createAttachment,
  repairFilenames,
};

// Backwards compatible aliases
export const {
  getAll: getAllAttachments,
  getById: getAttachmentById,
  update: updateAttachment,
  delete: deleteAttachment,
} = baseCRUDService;

export { createAttachment };
