import axiosInstance from "@/api/axios.instance";
import {
    AnalyticsFilters,
    DashboardAnalytics,
    DocumentAnalytics,
    UserAnalytics,
    WorkflowAnalytics
} from "@/features/statistics";


const endpoints = {
  analytics: {
    dashboard: "/analytics/dashboard",
    documents: "/analytics/documents",
    workflows: "/analytics/workflows",
    users: "/analytics/users",
  },
};

const buildQueryParams = (filters?: AnalyticsFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.timeRange) params.append("timeRange", filters.timeRange);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.departmentId !== undefined) params.append("departmentId", filters.departmentId.toString());
  if (filters.userId !== undefined) params.append("userId", filters.userId.toString());

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const statisticsService = {
  getDashboardAnalytics: async (filters?: AnalyticsFilters): Promise<DashboardAnalytics> => {
    const { data } = await axiosInstance.get(`${endpoints.analytics.dashboard}${buildQueryParams(filters)}`);
    return data;
  },

  getDocumentAnalytics: async (filters?: AnalyticsFilters): Promise<DocumentAnalytics> => {
    const { data } = await axiosInstance.get(`${endpoints.analytics.documents}${buildQueryParams(filters)}`);
    return data;
  },

  getWorkflowAnalytics: async (filters?: AnalyticsFilters): Promise<WorkflowAnalytics> => {
    const { data } = await axiosInstance.get(`${endpoints.analytics.workflows}${buildQueryParams(filters)}`);
    return data;
  },

  getUserAnalytics: async (filters?: AnalyticsFilters): Promise<UserAnalytics> => {
    const { data } = await axiosInstance.get(`${endpoints.analytics.users}${buildQueryParams(filters)}`);
    return data;
  },
};
