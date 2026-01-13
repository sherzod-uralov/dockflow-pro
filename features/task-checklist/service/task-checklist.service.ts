import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { PaginatedResponse } from "@/lib/crud-service";
import {
  TaskChecklistGetResponse,
  TaskChecklistCreatePayload,
  TaskChecklistUpdatePayload,
  TaskChecklistQueryParams,
  TaskChecklistItemGetResponse,
  TaskChecklistItemCreatePayload,
  TaskChecklistItemUpdatePayload,
  TaskChecklistItemQueryParams,
} from "../type/task-checklist.type";

export const taskChecklistService = {
  // Checklist methods
  getAll: async (params?: TaskChecklistQueryParams): Promise<PaginatedResponse<TaskChecklistGetResponse>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<TaskChecklistGetResponse>>(
      endpoints.taskChecklist.list,
      {
        params: {
          pageNumber: params?.pageNumber,
          pageSize: params?.pageSize,
          taskId: params?.taskId,
          search: params?.search,
        },
      }
    );
    return data;
  },

  getById: async (id: string): Promise<TaskChecklistGetResponse> => {
    const { data } = await axiosInstance.get<TaskChecklistGetResponse>(
      endpoints.taskChecklist.detail(id)
    );
    return data;
  },

  create: async (payload: TaskChecklistCreatePayload): Promise<TaskChecklistGetResponse> => {
    const { data } = await axiosInstance.post<TaskChecklistGetResponse>(
      endpoints.taskChecklist.create,
      payload
    );
    return data;
  },

  update: async (id: string, payload: TaskChecklistUpdatePayload): Promise<TaskChecklistGetResponse> => {
    const { data } = await axiosInstance.patch<TaskChecklistGetResponse>(
      endpoints.taskChecklist.update(id),
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.taskChecklist.delete(id));
  },

  // Checklist Item methods
  getItems: async (
    checklistId: string,
    params?: TaskChecklistItemQueryParams
  ): Promise<PaginatedResponse<TaskChecklistItemGetResponse>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<TaskChecklistItemGetResponse>>(
      endpoints.taskChecklist.items(checklistId),
      {
        params: {
          pageNumber: params?.pageNumber,
          pageSize: params?.pageSize,
          search: params?.search,
        },
      }
    );
    return data;
  },

  getItem: async (checklistId: string, itemId: string): Promise<TaskChecklistItemGetResponse> => {
    const { data } = await axiosInstance.get<TaskChecklistItemGetResponse>(
      endpoints.taskChecklist.item(checklistId, itemId)
    );
    return data;
  },

  createItem: async (
    checklistId: string,
    payload: TaskChecklistItemCreatePayload
  ): Promise<TaskChecklistItemGetResponse> => {
    const { data } = await axiosInstance.post<TaskChecklistItemGetResponse>(
      endpoints.taskChecklist.items(checklistId),
      payload
    );
    return data;
  },

  updateItem: async (
    checklistId: string,
    itemId: string,
    payload: TaskChecklistItemUpdatePayload
  ): Promise<TaskChecklistItemGetResponse> => {
    const { data } = await axiosInstance.patch<TaskChecklistItemGetResponse>(
      endpoints.taskChecklist.item(checklistId, itemId),
      payload
    );
    return data;
  },

  deleteItem: async (checklistId: string, itemId: string): Promise<void> => {
    await axiosInstance.delete(endpoints.taskChecklist.item(checklistId, itemId));
  },
};
