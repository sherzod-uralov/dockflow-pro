import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import {
  KpiRewardGetResponse,
  GetAllKpiRewards,
  KpiRewardQueryParams,
  KpiRewardActionPayload,
  KpiRewardRejectPayload,
  KpiRewardBulkApprovePayload,
} from "../type/kpi-reward.type";

export const kpiRewardService = {
  getAll: async (params?: KpiRewardQueryParams): Promise<GetAllKpiRewards> => {
    const { data } = await axiosInstance.get<GetAllKpiRewards>(endpoints.kpiReward.list, {
      params: {
        pageSize: params?.pageSize,
        pageNumber: params?.pageNumber,
        userId: params?.userId,
        year: params?.year,
        month: params?.month,
        status: params?.status,
      },
    });
    return data;
  },

  getById: async (id: string): Promise<KpiRewardGetResponse> => {
    const { data } = await axiosInstance.get<KpiRewardGetResponse>(endpoints.kpiReward.detail(id));
    return data;
  },

  getPending: async (): Promise<GetAllKpiRewards> => {
    const { data } = await axiosInstance.get<GetAllKpiRewards>(endpoints.kpiReward.pending);
    return data;
  },

  getMy: async (): Promise<GetAllKpiRewards> => {
    const { data } = await axiosInstance.get<GetAllKpiRewards>(endpoints.kpiReward.my);
    return data;
  },

  approve: async (id: string, payload?: KpiRewardActionPayload): Promise<KpiRewardGetResponse> => {
    const { data } = await axiosInstance.post<KpiRewardGetResponse>(
      endpoints.kpiReward.approve(id),
      payload || {}
    );
    return data;
  },

  pay: async (id: string, payload?: KpiRewardActionPayload): Promise<KpiRewardGetResponse> => {
    const { data } = await axiosInstance.post<KpiRewardGetResponse>(
      endpoints.kpiReward.pay(id),
      payload || {}
    );
    return data;
  },

  reject: async (id: string, payload?: KpiRewardRejectPayload): Promise<KpiRewardGetResponse> => {
    const { data } = await axiosInstance.post<KpiRewardGetResponse>(
      endpoints.kpiReward.reject(id),
      payload
    );
    return data;
  },

  bulkApprove: async (payload: KpiRewardBulkApprovePayload): Promise<void> => {
    await axiosInstance.post(endpoints.kpiReward.bulkApprove, payload);
  },
};

export const {
  getAll: getAllKpiRewards,
  getById: getKpiRewardById,
  getPending: getPendingKpiRewards,
  getMy: getMyKpiRewards,
} = kpiRewardService;

export const approveKpiReward = kpiRewardService.approve;
export const payKpiReward = kpiRewardService.pay;
export const rejectKpiReward = kpiRewardService.reject;
export const bulkApproveKpiRewards = kpiRewardService.bulkApprove;
