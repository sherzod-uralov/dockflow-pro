import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { PaginatedResponse } from "@/lib/crud-service";
import {
  TaskWatcherGetResponse,
  TaskWatcherQueryParams,
} from "../type/task-watcher.type";

export const taskWatcherService = {
  getAll: async (params?: TaskWatcherQueryParams): Promise<PaginatedResponse<TaskWatcherGetResponse>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<TaskWatcherGetResponse>>(
      endpoints.taskWatcher.list,
      {
        params: {
          pageNumber: params?.pageNumber,
          pageSize: params?.pageSize,
          taskId: params?.taskId,
          userId: params?.userId,
        },
      }
    );
    return data;
  },

  watch: async (taskId: string): Promise<void> => {
    await axiosInstance.post(endpoints.taskWatcher.watch(taskId));
  },

  unwatch: async (taskId: string): Promise<void> => {
    await axiosInstance.delete(endpoints.taskWatcher.unwatch(taskId));
  },
};
