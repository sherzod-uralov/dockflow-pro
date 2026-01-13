import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  TaskGetResponse,
  GetAllTasks,
  TaskQueryParams,
  TaskCreatePayload,
  TaskUpdatePayload,
} from "../type/task.type";

export const taskService = createCRUDService<
  TaskGetResponse,
  TaskCreatePayload,
  TaskUpdatePayload,
  TaskQueryParams,
  GetAllTasks
>(endpoints.task, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
    projectId: params?.projectId,
    status: params?.status,
    priority: params?.priority,
    assigneeIds: params?.assigneeIds,
    createdById: params?.createdById,
    categoryId: params?.categoryId,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllTasks,
  getById: getTaskById,
  create: createTask,
  update: updateTask,
  delete: deleteTask,
} = taskService;
