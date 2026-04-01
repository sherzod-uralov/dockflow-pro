import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import {
  SessionGetResponse,
  GetAllSessions,
  SessionQueryParams,
} from "../type/sessions.type";

export const sessionsService = {
  getAll: async (params?: SessionQueryParams): Promise<GetAllSessions> => {
    const { data } = await axiosInstance.get<GetAllSessions>(endpoints.sessions.list, {
      params: {
        pageSize: params?.pageSize,
        pageNumber: params?.pageNumber,
      },
    });
    return data;
  },

  getById: async (id: string): Promise<SessionGetResponse> => {
    const { data } = await axiosInstance.get<SessionGetResponse>(endpoints.sessions.detail(id));
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.sessions.delete(id));
  },

  revokeAll: async (): Promise<void> => {
    await axiosInstance.post(endpoints.sessions.revokeAll);
  },
};

export const {
  getAll: getAllSessions,
  getById: getSessionById,
  delete: deleteSession,
} = sessionsService;

export const revokeAllSessions = sessionsService.revokeAll;
