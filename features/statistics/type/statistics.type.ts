export interface StatisticsOverview {
  totalDocuments: number;
  totalUsers: number;
  totalDepartments: number;
  totalJournals: number;
  activeWorkflows: number;
  pendingTasks: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface DocumentsByType {
  documentType: string;
  count: number;
  percentage: number;
}

export interface DocumentsByStatus {
  status: string;
  count: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  documents: number;
  users: number;
}

export interface DepartmentStatistics {
  departmentName: string;
  documentCount: number;
  userCount: number;
}

export interface RecentActivity {
  id: string;
  type: "document" | "user" | "workflow" | "task";
  description: string;
  timestamp: string;
  user?: string;
}

export interface StatisticsData {
  overview: StatisticsOverview;
  documentsByType: DocumentsByType[];
  documentsByStatus: DocumentsByStatus[];
  monthlyTrends: MonthlyTrend[];
  departmentStats: DepartmentStatistics[];
  recentActivities: RecentActivity[];
}
