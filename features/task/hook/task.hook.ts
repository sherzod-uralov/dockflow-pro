import { createCRUDHooks } from "@/lib/crud-hooks";
import { taskService } from "../service/task.service";
import {
  TaskQueryParams,
  GetAllTasks,
  TaskCreatePayload,
  TaskUpdatePayload,
  TaskGetResponse,
} from "../type/task.type";

const taskHooks = createCRUDHooks<
  TaskGetResponse,
  TaskCreatePayload,
  TaskUpdatePayload,
  TaskQueryParams,
  GetAllTasks
>({
  service: taskService,
  queryKey: "tasks",
  singleQueryKey: "task",
});

// Export individual hooks for backwards compatibility
export const useGetAllTasks = (params?: TaskQueryParams) =>
  taskHooks.useGetAll(params);

export const useGetTaskById = (id: string, options?: { enabled?: boolean }) =>
  taskHooks.useGetById(id, options);

export const useCreateTask = taskHooks.useCreate;

export const useUpdateTask = taskHooks.useUpdate;

export const useDeleteTask = taskHooks.useDelete;
