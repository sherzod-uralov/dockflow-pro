import { createCRUDHooks } from "@/lib/crud-hooks";
import { taskAttachmentService } from "../service/task-attachment.service";
import {
  TaskAttachmentGetResponse,
  TaskAttachmentCreatePayload,
  TaskAttachmentUpdatePayload,
  TaskAttachmentQueryParams,
} from "../type/task-attachment.type";
import { PaginatedResponse } from "@/lib/crud-service";

const hooks = createCRUDHooks<
  TaskAttachmentGetResponse,
  TaskAttachmentCreatePayload,
  TaskAttachmentUpdatePayload,
  TaskAttachmentQueryParams,
  PaginatedResponse<TaskAttachmentGetResponse>
>({
  service: taskAttachmentService,
  queryKey: "task-attachments",
  singleQueryKey: "task-attachment",
  messages: {
    created: "Fayl biriktirildi",
    updated: "Fayl ma'lumotlari yangilandi",
    deleted: "Fayl olib tashlandi",
  },
});

export const useGetAllTaskAttachments = hooks.useGetAll;
export const useGetTaskAttachmentById = hooks.useGetById;
export const useCreateTaskAttachment = hooks.useCreate;
export const useUpdateTaskAttachment = hooks.useUpdate;
export const useDeleteTaskAttachment = hooks.useDelete;
