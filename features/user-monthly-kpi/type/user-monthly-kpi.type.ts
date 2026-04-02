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
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  year: number;
  month: number;
  totalBaseScore: number;
  totalEarnedScore: number;
  totalPenalty: number;
  tasksCompleted: number;
  tasksOnTime: number;
  tasksLate: number;
  finalScore: number;
  isFullScore: boolean;
  consecutiveFullMonths: number;
  isFinalized: boolean;
  finalizedAt?: string;
  scoreBreakdown?: Record<string, { count: number; earned: number }>;
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
  userId: string;
  baseScore: number;
  earnedScore: number;
  penaltyApplied: number;
  dueDate: string;
  completedDate: string;
  daysLate: number;
  periodYear: number;
  periodMonth: number;
  breakdown: {
    earned: number;
    daysLate: number;
    baseScore: number;
    totalPenalty: number;
    penaltyPerDay: number;
  };
  createdAt: string;
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
