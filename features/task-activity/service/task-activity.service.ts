import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { PaginatedResponse } from "@/lib/crud-service";
import {
  TaskActivityGetResponse,
  TaskActivityQueryParams,
} from "../type/task-activity.type";

export const taskActivityService = {
  getAll: async (params?: TaskActivityQueryParams): Promise<PaginatedResponse<TaskActivityGetResponse>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<TaskActivityGetResponse>>(
      endpoints.taskActivity.list,
      {
        params: {
          pageNumber: params?.pageNumber,
          pageSize: params?.pageSize,
          taskId: params?.taskId,
          userId: params?.userId,
          action: params?.action,
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      }
    );
    return data;
  },

  getById: async (id: string): Promise<TaskActivityGetResponse> => {
    const { data } = await axiosInstance.get<TaskActivityGetResponse>(
      endpoints.taskActivity.detail(id)
    );
    return data;
  },
};
