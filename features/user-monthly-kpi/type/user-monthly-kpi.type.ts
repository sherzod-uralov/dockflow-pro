import { DataPagination } from "@/types/global.types";

export interface UserMonthlyKpiGetResponse {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullname: string;
    username: string;
    avatarUrl?: string;
  };
  year: number;
  month: number;
  totalScore: number;
  completedTasks?: number;
  onTimeTasks?: number;
  lateTasks?: number;
  isFinalized: boolean;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllUserMonthlyKpis extends DataPagination {
  data: UserMonthlyKpiGetResponse[];
}

export interface UserMonthlyKpiQueryParams {
  pageNumber?: number;
  pageSize?: number;
  userId?: string;
  year?: number;
  month?: number;
  isFinalized?: boolean;
  departmentId?: string;
}

export interface UserMonthlyKpiTaskScore {
  id: string;
  taskId: string;
  task?: {
    id: string;
    title: string;
  };
  score: number;
  baseScore: number;
  penalty: number;
  daysLate?: number;
  completedAt?: string;
}

export interface UserMonthlyKpiLeaderboardEntry {
  userId: string;
  user: {
    id: string;
    fullname: string;
    username: string;
    avatarUrl?: string;
  };
  totalScore: number;
  rank: number;
}

export interface UserMonthlyKpiHistoryParams {
  userId?: string;
  limit?: number;
}

export interface UserMonthlyKpiLeaderboardParams {
  year?: number;
  month?: number;
  departmentId?: string;
  limit?: number;
}

export interface UserMonthlyKpiTaskScoresParams {
  userId: string;
  year: number;
  month: number;
}

export interface UserMonthlyKpiMeParams {
  year: number;
  month: number;
}

export interface UserMonthlyKpiFinalizeParams {
  year: number;
  month: number;
}
