import { useQuery, useMutation, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import { userMonthlyKpiService } from "../service/user-monthly-kpi.service";
import {
  UserMonthlyKpiQueryParams,
  UserMonthlyKpiGetResponse,
  GetAllUserMonthlyKpis,
  UserMonthlyKpiTaskScore,
  UserMonthlyKpiLeaderboardEntry,
  UserMonthlyKpiHistoryParams,
  UserMonthlyKpiLeaderboardParams,
  UserMonthlyKpiTaskScoresParams,
  UserMonthlyKpiMeParams,
  UserMonthlyKpiFinalizeParams,
} from "../type/user-monthly-kpi.type";

export const useGetAllUserMonthlyKpis = (params?: UserMonthlyKpiQueryParams) => {
  return useQuery<GetAllUserMonthlyKpis>({
    queryKey: ["userMonthlyKpis", params],
    queryFn: () => userMonthlyKpiService.getAll(params),
    keepPreviousData: true,
  });
};

export const useGetUserMonthlyKpiById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<UserMonthlyKpiGetResponse>({
    queryKey: ["userMonthlyKpi", id],
    queryFn: () => userMonthlyKpiService.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useGetMyMonthlyKpi = (params: UserMonthlyKpiMeParams) => {
  return useQuery<UserMonthlyKpiGetResponse>({
    queryKey: ["userMonthlyKpi", "me", params],
    queryFn: () => userMonthlyKpiService.getMe(params),
  });
};

export const useGetUserMonthlyKpiHistory = (params?: UserMonthlyKpiHistoryParams) => {
  return useQuery<UserMonthlyKpiGetResponse[]>({
    queryKey: ["userMonthlyKpi", "history", params],
    queryFn: () => userMonthlyKpiService.getHistory(params),
  });
};

export const useGetUserMonthlyKpiLeaderboard = (params: UserMonthlyKpiLeaderboardParams) => {
  return useQuery<UserMonthlyKpiLeaderboardEntry[]>({
    queryKey: ["userMonthlyKpi", "leaderboard", params],
    queryFn: () => userMonthlyKpiService.getLeaderboard(params),
    keepPreviousData: true,
  });
};

export const useGetUserMonthlyKpiTaskScores = (
  params: UserMonthlyKpiTaskScoresParams,
  options?: { enabled?: boolean }
) => {
  return useQuery<UserMonthlyKpiTaskScore[]>({
    queryKey: ["userMonthlyKpi", "taskScores", params],
    queryFn: () => userMonthlyKpiService.getTaskScores(params),
    enabled: !!params.userId && (options?.enabled !== false),
  });
};

export const useFinalizeUserMonthlyKpi = () => {
  const queryClient = useQueryClient();
  return useMutation<UserMonthlyKpiGetResponse, unknown, UserMonthlyKpiFinalizeParams>({
    mutationFn: (params) => userMonthlyKpiService.finalize(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["userMonthlyKpis"]);
      queryClient.invalidateQueries(["userMonthlyKpi"]);
      showSuccess(data);
    },
    onError: showError,
  });
};
