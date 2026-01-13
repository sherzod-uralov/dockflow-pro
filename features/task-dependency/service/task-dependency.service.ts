import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService, PaginatedResponse } from "@/lib/crud-service";
import {
  TaskDependencyGetResponse,
  TaskDependencyCreatePayload,
  TaskDependencyQueryParams,
} from "../type/task-dependency.type";

export const taskDependencyService = createCRUDService<
  TaskDependencyGetResponse,
  TaskDependencyCreatePayload,
  never,
  TaskDependencyQueryParams,
  PaginatedResponse<TaskDependencyGetResponse>
>(endpoints.taskDependency, {
  transformParams: (params) => ({
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    taskId: params?.taskId,
    dependsOnTaskId: params?.dependsOnTaskId,
  }),
});
