import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  TaskGetResponse,
  GetAllTasks,
  TaskQueryParams,
  TaskCreatePayload,
  TaskUpdatePayload,
} from "../type/task.type";

const baseCRUDService = createCRUDService<
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
    priority: params?.priority,
    assigneeId: params?.assigneeId,
    createdById: params?.createdById,
    categoryId: params?.categoryId,
    parentTaskId: params?.parentTaskId,
    boardColumnId: params?.boardColumnId,
  }),
});

export const taskService = {
  ...baseCRUDService,

  completeTask: async (id: string) => {
    const { data } = await axiosInstance.post(endpoints.task.complete(id));
    return data;
  },

  uncompleteTask: async (id: string) => {
    const { data } = await axiosInstance.post(endpoints.task.uncomplete(id));
    return data;
  },
};

// Backwards compatible aliases
export const {
  getAll: getAllTasks,
  getById: getTaskById,
  create: createTask,
  update: updateTask,
  delete: deleteTask,
} = baseCRUDService;
