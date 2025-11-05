import { useQuery } from "react-query";
import { statisticsService } from "@/features/statistics";
import {
  AnalyticsFilters,
  DashboardAnalytics,
  DocumentAnalytics,
  WorkflowAnalytics,
  UserAnalytics,
} from "../type/statistics.type";

/**
 * Hook to fetch dashboard analytics
 */
export const useDashboardAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery<DashboardAnalytics>({
    queryKey: ["analytics", "dashboard", filters],
    queryFn: () => statisticsService.getDashboardAnalytics(filters),
    refetchInterval: 60000, // Refetch every 60 seconds
    keepPreviousData: true, // Keep showing previous data while fetching new
  });
};

/**
 * Hook to fetch document analytics
 */
export const useDocumentAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery<DocumentAnalytics>({
    queryKey: ["analytics", "documents", filters],
    queryFn: () => statisticsService.getDocumentAnalytics(filters),
    refetchInterval: 60000,
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch workflow analytics
 */
export const useWorkflowAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery<WorkflowAnalytics>({
    queryKey: ["analytics", "workflows", filters],
    queryFn: () => statisticsService.getWorkflowAnalytics(filters),
    refetchInterval: 60000,
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch user activity analytics
 */
export const useUserAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery<UserAnalytics>({
    queryKey: ["analytics", "users", filters],
    queryFn: () => statisticsService.getUserAnalytics(filters),
    refetchInterval: 60000,
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch all analytics data at once
 */
export const useAllAnalytics = (filters?: AnalyticsFilters) => {
  const dashboard = useDashboardAnalytics(filters);
  const documents = useDocumentAnalytics(filters);
  const workflows = useWorkflowAnalytics(filters);
  const users = useUserAnalytics(filters);

  return {
    dashboard,
    documents,
    workflows,
    users,
    isLoading:
      dashboard.isLoading ||
      documents.isLoading ||
      workflows.isLoading ||
      users.isLoading,
    isError:
      dashboard.isError ||
      documents.isError ||
      workflows.isError ||
      users.isError,
  };
};
