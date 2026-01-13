import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService, PaginatedResponse } from "@/lib/crud-service";
import {
  TaskAttachmentGetResponse,
  TaskAttachmentCreatePayload,
  TaskAttachmentUpdatePayload,
  TaskAttachmentQueryParams,
} from "../type/task-attachment.type";

export const taskAttachmentService = createCRUDService<
  TaskAttachmentGetResponse,
  TaskAttachmentCreatePayload,
  TaskAttachmentUpdatePayload,
  TaskAttachmentQueryParams,
  PaginatedResponse<TaskAttachmentGetResponse>
>(endpoints.taskAttachment, {
  transformParams: (params) => ({
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    taskId: params?.taskId,
  }),
});
