import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  TaskCategoryGetResponse,
  GetAllTaskCategories,
  TaskCategoryQueryParams,
  TaskCategoryCreatePayload,
  TaskCategoryUpdatePayload,
} from "../type/task-category.type";

export const taskCategoryService = createCRUDService<
  TaskCategoryGetResponse,
  TaskCategoryCreatePayload,
  TaskCategoryUpdatePayload,
  TaskCategoryQueryParams,
  GetAllTaskCategories
>(endpoints.taskCategory, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
    isActive: params?.isActive,
  }),
});

export const {
  getAll: getAllTaskCategories,
  getById: getTaskCategoryById,
  create: createTaskCategory,
  update: updateTaskCategory,
  delete: deleteTaskCategory,
} = taskCategoryService;
