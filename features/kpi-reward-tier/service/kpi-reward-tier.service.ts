import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  KpiRewardTierGetResponse,
  GetAllKpiRewardTiers,
  KpiRewardTierQueryParams,
  KpiRewardTierCreatePayload,
  KpiRewardTierUpdatePayload,
} from "../type/kpi-reward-tier.type";

export const kpiRewardTierService = createCRUDService<
  KpiRewardTierGetResponse,
  KpiRewardTierCreatePayload,
  KpiRewardTierUpdatePayload,
  KpiRewardTierQueryParams,
  GetAllKpiRewardTiers
>(endpoints.kpiRewardTier, {
  transformParams: (params) => ({
    isActive: params?.isActive,
  }),
});

export const {
  getAll: getAllKpiRewardTiers,
  getById: getKpiRewardTierById,
  create: createKpiRewardTier,
  update: updateKpiRewardTier,
  delete: deleteKpiRewardTier,
} = kpiRewardTierService;
