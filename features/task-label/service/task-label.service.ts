import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService, PaginatedResponse } from "@/lib/crud-service";
import {
  TaskLabelGetResponse,
  TaskLabelCreatePayload,
  TaskLabelQueryParams,
} from "../type/task-label.type";

export const taskLabelService = createCRUDService<
  TaskLabelGetResponse,
  TaskLabelCreatePayload,
  never,
  TaskLabelQueryParams,
  PaginatedResponse<TaskLabelGetResponse>
>(endpoints.taskLabel, {
  transformParams: (params) => ({
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    taskId: params?.taskId,
    labelId: params?.labelId,
  }),
});
