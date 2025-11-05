// Enums
export enum TimeRange {
  TODAY = "TODAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  QUARTER = "QUARTER",
  YEAR = "YEAR",
  CUSTOM = "CUSTOM",
}

// Filter types
export interface AnalyticsFilters {
  timeRange?: TimeRange;
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  departmentId?: number;
  userId?: number;
}

// API Response types
export interface ValueWithChange {
  value: number;
  changePercentage: number | null;
}

// Dashboard Analytics
export interface DashboardAnalytics {
  totalDocuments: ValueWithChange;
  activeUsers: ValueWithChange;
  totalDepartments: number;
  totalJournals: ValueWithChange;
  activeWorkflows: number;
  pendingTasks: ValueWithChange;
}

// Document Analytics
export interface DocumentsByStatus {
  draft: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  archived: number;
}

export interface DocumentsByPriority {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

export interface DocumentTypeCount {
  typeId: number;
  typeName: string;
  count: number;
}

export interface DepartmentDocumentCount {
  departmentId: number;
  departmentName: string;
  count: number;
}

export interface TrendData {
  period: string;
  count: number;
}

export interface DocumentAnalytics {
  totalDocuments: number;
  documentsByStatus: DocumentsByStatus;
  documentsByPriority: DocumentsByPriority;
  documentsByType: DocumentTypeCount[];
  documentsByDepartment: DepartmentDocumentCount[];
  creationTrend: TrendData[];
  averageDocumentsPerDay: number;
  documentsWithAttachments: number;
  totalVersions: number;
}

// Workflow Analytics
export interface WorkflowsByStatus {
  pending: number;
  inProgress: number;
  completed: number;
  rejected: number;
}

export interface StepCompletionRate {
  stepOrder: number;
  stepName: string;
  completionRate: number;
  averageCompletionTime: number; // in hours
}

export interface WorkflowAnalytics {
  totalWorkflows: number;
  workflowsByStatus: WorkflowsByStatus;
  averageCompletionTime: number; // in hours
  completedInPeriod: number;
  rejectedInPeriod: number;
  stepCompletionRates: StepCompletionRate[];
  completionTrend: TrendData[];
  averageStepsPerWorkflow: number;
}

// User Analytics
export interface TopActiveUser {
  userId: number;
  username: string;
  fullName: string;
  documentsCreated: number;
  workflowStepsCompleted: number;
  workflowStepsPending: number;
}

export interface DepartmentActivity {
  departmentId: number;
  departmentName: string;
  documentsCreated: number;
  workflowsCompleted: number;
  activeUsers: number;
}

export interface UserAnalytics {
  totalActiveUsers: number;
  topActiveUsers: TopActiveUser[];
  departmentActivity: DepartmentActivity[];
  averageDocumentsPerUser: number;
  averageWorkflowStepsPerUser: number;
  activityTrend: TrendData[];
}

// Legacy types (keep for backward compatibility with existing components)
export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface StatisticsOverview {
  totalDocuments: number;
  totalUsers: number;
  totalDepartments: number;
  totalJournals: number;
  activeWorkflows: number;
  pendingTasks: number;
}

export interface DocumentsByType {
  documentType: string;
  count: number;
  percentage: number;
}

export interface DocumentStatusChartData {
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
  documentsByStatus: DocumentStatusChartData[];
  monthlyTrends: MonthlyTrend[];
  departmentStats: DepartmentStatistics[];
  recentActivities: RecentActivity[];
}
