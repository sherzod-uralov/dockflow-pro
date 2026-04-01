import { createCRUDHooks } from "@/lib/crud-hooks";
import { taskCategoryService } from "../service/task-category.service";
import {
  TaskCategoryQueryParams,
  GetAllTaskCategories,
  TaskCategoryCreatePayload,
  TaskCategoryUpdatePayload,
  TaskCategoryGetResponse,
} from "../type/task-category.type";

const taskCategoryHooks = createCRUDHooks<
  TaskCategoryGetResponse,
  TaskCategoryCreatePayload,
  TaskCategoryUpdatePayload,
  TaskCategoryQueryParams,
  GetAllTaskCategories
>({
  service: taskCategoryService,
  queryKey: "taskCategories",
  singleQueryKey: "taskCategory",
  messages: {
    created: "Kategoriya yaratildi",
    updated: "Kategoriya yangilandi",
    deleted: "Kategoriya o'chirildi",
  },
});

export const useGetAllTaskCategories = (params?: TaskCategoryQueryParams) =>
  taskCategoryHooks.useGetAll(params);

export const useGetTaskCategoryById = (id: string, options?: { enabled?: boolean }) =>
  taskCategoryHooks.useGetById(id, options);

export const useCreateTaskCategory = taskCategoryHooks.useCreate;

export const useUpdateTaskCategory = taskCategoryHooks.useUpdate;

export const useDeleteTaskCategory = taskCategoryHooks.useDelete;
