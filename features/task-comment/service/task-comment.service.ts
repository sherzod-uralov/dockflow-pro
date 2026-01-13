import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService, PaginatedResponse } from "@/lib/crud-service";
import {
  TaskCommentGetResponse,
  TaskCommentCreatePayload,
  TaskCommentUpdatePayload,
  TaskCommentQueryParams,
} from "../type/task-comment.type";

export const taskCommentService = createCRUDService<
  TaskCommentGetResponse,
  TaskCommentCreatePayload,
  TaskCommentUpdatePayload,
  TaskCommentQueryParams,
  PaginatedResponse<TaskCommentGetResponse>
>(endpoints.taskComment, {
  transformParams: (params) => ({
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    taskId: params?.taskId,
  }),
});
