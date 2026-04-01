import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import {
  UserMonthlyKpiGetResponse,
  GetAllUserMonthlyKpis,
  UserMonthlyKpiQueryParams,
  UserMonthlyKpiTaskScore,
  UserMonthlyKpiLeaderboardEntry,
  UserMonthlyKpiHistoryParams,
  UserMonthlyKpiLeaderboardParams,
  UserMonthlyKpiTaskScoresParams,
  UserMonthlyKpiMeParams,
  UserMonthlyKpiFinalizeParams,
} from "../type/user-monthly-kpi.type";

export const userMonthlyKpiService = {
  getAll: async (params?: UserMonthlyKpiQueryParams): Promise<GetAllUserMonthlyKpis> => {
    const { data } = await axiosInstance.get<GetAllUserMonthlyKpis>(endpoints.userMonthlyKpi.list, {
      params: {
        userId: params?.userId,
        departmentId: params?.departmentId,
        year: params?.year,
        month: params?.month,
        isFinalized: params?.isFinalized,
        pageNumber: params?.pageNumber,
        pageSize: params?.pageSize,
      },
    });
    return data;
  },

  getById: async (id: string): Promise<UserMonthlyKpiGetResponse> => {
    const { data } = await axiosInstance.get<UserMonthlyKpiGetResponse>(
      endpoints.userMonthlyKpi.detail(id)
    );
    return data;
  },

  getMe: async (params: UserMonthlyKpiMeParams): Promise<UserMonthlyKpiGetResponse> => {
    const { data } = await axiosInstance.get<UserMonthlyKpiGetResponse>(
      endpoints.userMonthlyKpi.me,
      { params: { year: params.year, month: params.month } }
    );
    return data;
  },

  getHistory: async (params?: UserMonthlyKpiHistoryParams): Promise<UserMonthlyKpiGetResponse[]> => {
    const { data } = await axiosInstance.get<UserMonthlyKpiGetResponse[]>(
      endpoints.userMonthlyKpi.history,
      {
        params: {
          userId: params?.userId,
          limit: params?.limit,
        },
      }
    );
    return data;
  },

  getLeaderboard: async (
    params: UserMonthlyKpiLeaderboardParams
  ): Promise<UserMonthlyKpiLeaderboardEntry[]> => {
    const { data } = await axiosInstance.get<UserMonthlyKpiLeaderboardEntry[]>(
      endpoints.userMonthlyKpi.leaderboard,
      {
        params: {
          year: params.year,
          month: params.month,
          departmentId: params.departmentId,
          limit: params.limit,
        },
      }
    );
    return data;
  },

  getTaskScores: async (params: UserMonthlyKpiTaskScoresParams): Promise<UserMonthlyKpiTaskScore[]> => {
    const { data } = await axiosInstance.get<UserMonthlyKpiTaskScore[]>(
      endpoints.userMonthlyKpi.taskScores,
      {
        params: {
          userId: params.userId,
          year: params.year,
          month: params.month,
        },
      }
    );
    return data;
  },

  finalize: async (params: UserMonthlyKpiFinalizeParams): Promise<UserMonthlyKpiGetResponse> => {
    const { data } = await axiosInstance.post<UserMonthlyKpiGetResponse>(
      endpoints.userMonthlyKpi.finalize,
      null,
      { params: { year: params.year, month: params.month } }
    );
    return data;
  },
};

export const {
  getAll: getAllUserMonthlyKpis,
  getById: getUserMonthlyKpiById,
  getMe: getMyMonthlyKpi,
} = userMonthlyKpiService;

export const getUserMonthlyKpiHistory = userMonthlyKpiService.getHistory;
export const getUserMonthlyKpiLeaderboard = userMonthlyKpiService.getLeaderboard;
export const getUserMonthlyKpiTaskScores = userMonthlyKpiService.getTaskScores;
export const finalizeUserMonthlyKpi = userMonthlyKpiService.finalize;
