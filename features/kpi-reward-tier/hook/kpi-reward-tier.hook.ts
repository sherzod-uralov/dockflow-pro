import { createCRUDHooks } from "@/lib/crud-hooks";
import { kpiRewardTierService } from "../service/kpi-reward-tier.service";
import {
  KpiRewardTierQueryParams,
  GetAllKpiRewardTiers,
  KpiRewardTierCreatePayload,
  KpiRewardTierUpdatePayload,
  KpiRewardTierGetResponse,
} from "../type/kpi-reward-tier.type";

const kpiRewardTierHooks = createCRUDHooks<
  KpiRewardTierGetResponse,
  KpiRewardTierCreatePayload,
  KpiRewardTierUpdatePayload,
  KpiRewardTierQueryParams,
  GetAllKpiRewardTiers
>({
  service: kpiRewardTierService,
  queryKey: "kpiRewardTiers",
  singleQueryKey: "kpiRewardTier",
  messages: {
    created: "Mukofot darajasi yaratildi",
    updated: "Mukofot darajasi yangilandi",
    deleted: "Mukofot darajasi o'chirildi",
  },
});

export const useGetAllKpiRewardTiers = (params?: KpiRewardTierQueryParams) =>
  kpiRewardTierHooks.useGetAll(params);

export const useGetKpiRewardTierById = (id: string, options?: { enabled?: boolean }) =>
  kpiRewardTierHooks.useGetById(id, options);

export const useCreateKpiRewardTier = kpiRewardTierHooks.useCreate;

export const useUpdateKpiRewardTier = kpiRewardTierHooks.useUpdate;

export const useDeleteKpiRewardTier = kpiRewardTierHooks.useDelete;
