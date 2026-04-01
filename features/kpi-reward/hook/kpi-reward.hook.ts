import { useQuery, useMutation, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import { kpiRewardService } from "../service/kpi-reward.service";
import {
  KpiRewardQueryParams,
  KpiRewardGetResponse,
  GetAllKpiRewards,
  KpiRewardRejectPayload,
  KpiRewardBulkApprovePayload,
} from "../type/kpi-reward.type";

export const useGetAllKpiRewards = (params?: KpiRewardQueryParams) => {
  return useQuery<GetAllKpiRewards>({
    queryKey: ["kpiRewards", params],
    queryFn: () => kpiRewardService.getAll(params),
    keepPreviousData: true,
  });
};

export const useGetKpiRewardById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<KpiRewardGetResponse>({
    queryKey: ["kpiReward", id],
    queryFn: () => kpiRewardService.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useGetPendingKpiRewards = () => {
  return useQuery<GetAllKpiRewards>({
    queryKey: ["kpiRewards", "pending"],
    queryFn: () => kpiRewardService.getPending(),
  });
};

export const useGetMyKpiRewards = () => {
  return useQuery<GetAllKpiRewards>({
    queryKey: ["kpiRewards", "my"],
    queryFn: () => kpiRewardService.getMy(),
  });
};

export const useApproveKpiReward = () => {
  const queryClient = useQueryClient();
  return useMutation<KpiRewardGetResponse, unknown, string>({
    mutationFn: (id) => kpiRewardService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["kpiRewards"]);
      queryClient.invalidateQueries(["kpiReward"]);
      showSuccess("Mukofot tasdiqlandi");
    },
    onError: showError,
  });
};

export const usePayKpiReward = () => {
  const queryClient = useQueryClient();
  return useMutation<KpiRewardGetResponse, unknown, string>({
    mutationFn: (id) => kpiRewardService.pay(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["kpiRewards"]);
      queryClient.invalidateQueries(["kpiReward"]);
      showSuccess("Mukofot to'landi");
    },
    onError: showError,
  });
};

export const useRejectKpiReward = () => {
  const queryClient = useQueryClient();
  return useMutation<KpiRewardGetResponse, unknown, { id: string; data?: KpiRewardRejectPayload }>({
    mutationFn: ({ id, data }) => kpiRewardService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["kpiRewards"]);
      queryClient.invalidateQueries(["kpiReward"]);
      showSuccess("Mukofot rad etildi");
    },
    onError: showError,
  });
};

export const useBulkApproveKpiRewards = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, KpiRewardBulkApprovePayload>({
    mutationFn: (payload) => kpiRewardService.bulkApprove(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["kpiRewards"]);
      showSuccess("Mukofotlar tasdiqlandi");
    },
    onError: showError,
  });
};
