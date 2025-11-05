import { createErrorHandler } from "@/utils/http-error-handler";
import axiosInstance from "@/api/axios.instance";
import {
  AnalyticsFilters,
  DashboardAnalytics,
  DocumentAnalytics,
  WorkflowAnalytics,
  UserAnalytics,
} from "../type/statistics.type";

const endpoints = {
  analytics: {
    dashboard: "/analytics/dashboard",
    documents: "/analytics/documents",
    workflows: "/analytics/workflows",
    users: "/analytics/users",
  },
};

const handleAnalyticsError = createErrorHandler("Analytics");

// Helper function to build query params
const buildQueryParams = (filters?: AnalyticsFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.timeRange) {
    params.append("timeRange", filters.timeRange);
  }
  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }
  if (filters.departmentId !== undefined) {
    params.append("departmentId", filters.departmentId.toString());
  }
  if (filters.userId !== undefined) {
    params.append("userId", filters.userId.toString());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const statisticsService = {
  /**
   * Get dashboard analytics with overall metrics
   */
  getDashboardAnalytics: async (
    filters?: AnalyticsFilters,
  ): Promise<DashboardAnalytics> => {
    const queryParams = buildQueryParams(filters);
    return await handleAnalyticsError.executeGet(() =>
      axiosInstance.get(`${endpoints.analytics.dashboard}${queryParams}`),
    );
  },

  /**
   * Get document-specific analytics
   */
  getDocumentAnalytics: async (
    filters?: AnalyticsFilters,
  ): Promise<DocumentAnalytics> => {
    const queryParams = buildQueryParams(filters);
    return await handleAnalyticsError.executeGet(() =>
      axiosInstance.get(`${endpoints.analytics.documents}${queryParams}`),
    );
  },

  /**
   * Get workflow analytics
   */
  getWorkflowAnalytics: async (
    filters?: AnalyticsFilters,
  ): Promise<WorkflowAnalytics> => {
    const queryParams = buildQueryParams(filters);
    return await handleAnalyticsError.executeGet(() =>
      axiosInstance.get(`${endpoints.analytics.workflows}${queryParams}`),
    );
  },

  /**
   * Get user activity analytics
   */
  getUserAnalytics: async (
    filters?: AnalyticsFilters,
  ): Promise<UserAnalytics> => {
    const queryParams = buildQueryParams(filters);
    return await handleAnalyticsError.executeGet(() =>
      axiosInstance.get(`${endpoints.analytics.users}${queryParams}`),
    );
  },
};
