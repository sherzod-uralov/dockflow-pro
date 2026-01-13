import { createCRUDHooks } from "@/lib/crud-hooks";
import { taskDependencyService } from "../service/task-dependency.service";
import {
  TaskDependencyGetResponse,
  TaskDependencyCreatePayload,
  TaskDependencyQueryParams,
} from "../type/task-dependency.type";
import { PaginatedResponse } from "@/lib/crud-service";

const hooks = createCRUDHooks<
  TaskDependencyGetResponse,
  TaskDependencyCreatePayload,
  never,
  TaskDependencyQueryParams,
  PaginatedResponse<TaskDependencyGetResponse>
>({
  service: taskDependencyService,
  queryKey: "task-dependencies",
  singleQueryKey: "task-dependency",
  messages: {
    created: "Bog'liqlik qo'shildi",
    deleted: "Bog'liqlik olib tashlandi",
  },
});

export const useGetAllTaskDependencies = hooks.useGetAll;
export const useGetTaskDependencyById = hooks.useGetById;
export const useCreateTaskDependency = hooks.useCreate;
export const useDeleteTaskDependency = hooks.useDelete;
