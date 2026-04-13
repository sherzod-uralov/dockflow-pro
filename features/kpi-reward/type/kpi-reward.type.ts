import { DataPagination } from "@/types/global.types";

export enum KpiRewardStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
}

export const KPI_REWARD_STATUS_OPTIONS = [
  { value: KpiRewardStatus.PENDING, label: "Kutilmoqda", color: "#f39c12" },
  { value: KpiRewardStatus.APPROVED, label: "Tasdiqlangan", color: "#3498db" },
  { value: KpiRewardStatus.PAID, label: "To'langan", color: "#2ecc71" },
  { value: KpiRewardStatus.REJECTED, label: "Rad etilgan", color: "#e74c3c" },
] as const;

export interface KpiRewardGetResponse {
  id: string;
  userMonthlyKpiId: string;
  rewardTierId: string;
  rewardTier?: {
    id: string;
    name: string;
    color: string;
  };
  userId: string;
  user?: {
    id: string;
    fullname: string;
    username: string;
    avatarUrl?: string;
  };
  year: number;
  month: number;
  finalScore: number;
  rewardAmount: number;
  rewardBhm: number;
  isPenalty: boolean;
  status: KpiRewardStatus;
  approvedById?: string;
  approvedBy?: {
    id: string;
    fullname: string;
  };
  approvedAt?: string;
  paidAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllKpiRewards extends DataPagination {
  data: KpiRewardGetResponse[];
}

export interface KpiRewardQueryParams {
  pageNumber?: number;
  pageSize?: number;
  userId?: string;
  year?: number;
  month?: number;
  status?: KpiRewardStatus;
}

export interface KpiRewardActionPayload {
  notes?: string;
}

export interface KpiRewardRejectPayload {
  notes?: string;
}

export interface KpiRewardBulkApprovePayload {
  ids: string[];
}
