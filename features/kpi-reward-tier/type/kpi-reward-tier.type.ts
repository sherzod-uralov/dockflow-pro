import { DataPagination } from "@/types/global.types";

export interface KpiRewardTierGetResponse {
  id: string;
  minScore: number;
  maxScore: number;
  rewardBhm?: number;
  rewardAmount?: number;
  isPenalty: boolean;
  penaltyType?: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllKpiRewardTiers extends DataPagination {
  data: KpiRewardTierGetResponse[];
}

export interface KpiRewardTierQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface KpiRewardTierFormData {
  minScore: number;
  maxScore: number;
  rewardBhm?: number;
  rewardAmount?: number;
  isPenalty?: boolean;
  penaltyType?: string;
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface KpiRewardTierCreatePayload extends KpiRewardTierFormData {}

export interface KpiRewardTierUpdatePayload {
  minScore?: number;
  maxScore?: number;
  rewardBhm?: number;
  rewardAmount?: number;
  isPenalty?: boolean;
  penaltyType?: string;
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}
