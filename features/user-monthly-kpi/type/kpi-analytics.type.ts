export interface KpiAnalyticsParams {
  year?: number;
  month?: number;
  userId?: string;
}

export interface KpiPersonal {
  finalScore: number;
  totalBaseScore: number;
  totalEarnedScore: number;
  totalPenalty: number;
  tasksCompleted: number;
  tasksOnTime: number;
  tasksLate: number;
  isFullScore: boolean;
  consecutiveFullMonths: number;
  position?: number;
  totalUsers?: number;
}

export interface KpiTrendPoint {
  year: number;
  month: number;
  finalScore: number;
}

export interface KpiScoreBreakdown {
  byPriority: Record<string, { count: number; earned: number }>;
  onTimeCount: number;
  lateCount: number;
  totalPenalty: number;
  averageDaysLate: number;
}

export interface KpiTopTask {
  id: string;
  taskId: string;
  title?: string;
  baseScore: number;
  earnedScore: number;
  completedAt?: string;
}

export interface KpiDepartmentStats {
  department: { id: string; name: string };
  averageScore: number;
  totalUsers: number;
  usersAbove85: number;
  usersAt100: number;
  isEligibleForTeamReward: boolean;
}

export interface KpiLeaderboardEntry {
  rank: number;
  userId: string;
  user: { id: string; fullname: string; username?: string; avatarUrl?: string | null };
  finalScore: number;
  department?: { id: string; name: string };
}

export interface KpiCompanyStats {
  totalUsers: number;
  averageScore: number;
  usersAt100: number;
  usersAbove85: number;
  usersBelow50: number;
  totalTasksCompleted: number;
}

export interface KpiAchievement {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
}

export interface KpiRewardEntry {
  id: string;
  year: number;
  month: number;
  rewardAmount: number;
  rewardBhm?: number;
  status: string;
  rewardTier?: { id: string; name: string; color?: string };
}

export interface KpiAnalyticsResponse {
  period: { year: number; month: number };
  personal: KpiPersonal;
  trend: KpiTrendPoint[];
  scoreBreakdown: KpiScoreBreakdown;
  topTasks: KpiTopTask[];
  recentCompletedTasks: KpiTopTask[];
  department?: KpiDepartmentStats;
  leaderboard: KpiLeaderboardEntry[];
  allDepartments?: KpiDepartmentStats[];
  achievements: KpiAchievement[];
  rewards: KpiRewardEntry[];
  companyStats: KpiCompanyStats;
}
