import { DataPagination } from "@/types/global.types";

export interface TaskScoreConfigGetResponse {
  id: string;
  priorityLevel: number;
  priorityCode: string;
  baseScore: number;
  recommendedDays: number;
  penaltyPerDay: number;
  maxPenaltyDays: number;
  description?: string;
  criteria?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllTaskScoreConfigs extends DataPagination {
  data: TaskScoreConfigGetResponse[];
}

export interface TaskScoreConfigQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface TaskScoreConfigFormData {
  priorityLevel: number;
  priorityCode: string;
  baseScore: number;
  recommendedDays: number;
  penaltyPerDay: number;
  maxPenaltyDays: number;
  description?: string;
  criteria?: string;
  isActive?: boolean;
}

export interface TaskScoreConfigCreatePayload extends TaskScoreConfigFormData {}

export interface TaskScoreConfigUpdatePayload {
  priorityLevel?: number;
  priorityCode?: string;
  baseScore?: number;
  recommendedDays?: number;
  penaltyPerDay?: number;
  maxPenaltyDays?: number;
  description?: string;
  criteria?: string;
  isActive?: boolean;
}
