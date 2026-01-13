import { createCRUDHooks } from "@/lib/crud-hooks";
import { taskCommentService } from "../service/task-comment.service";
import {
  TaskCommentGetResponse,
  TaskCommentCreatePayload,
  TaskCommentUpdatePayload,
  TaskCommentQueryParams,
} from "../type/task-comment.type";
import { PaginatedResponse } from "@/lib/crud-service";

const hooks = createCRUDHooks<
  TaskCommentGetResponse,
  TaskCommentCreatePayload,
  TaskCommentUpdatePayload,
  TaskCommentQueryParams,
  PaginatedResponse<TaskCommentGetResponse>
>({
  service: taskCommentService,
  queryKey: "task-comments",
  singleQueryKey: "task-comment",
  messages: {
    created: "Izoh qo'shildi",
    updated: "Izoh yangilandi",
    deleted: "Izoh o'chirildi",
  },
});

export const useGetAllTaskComments = hooks.useGetAll;
export const useGetTaskCommentById = hooks.useGetById;
export const useCreateTaskComment = hooks.useCreate;
export const useUpdateTaskComment = hooks.useUpdate;
export const useDeleteTaskComment = hooks.useDelete;
