import { createErrorHandler } from "@/utils/http-error-handler";
import axiosInstance from "@/api/axios.instance";

const endpoints = {
  statistics: {
    overview: "/statistics/overview",
    dashboard: "/statistics/dashboard",
  },
};

const handleStatisticsError = createErrorHandler("Statistics");

export const statisticsService = {
  getOverview: async () => {
    return await handleStatisticsError.executeGet(() =>
      axiosInstance.get(endpoints.statistics.overview),
    );
  },

  getDashboardData: async () => {
    return await handleStatisticsError.executeGet(() =>
      axiosInstance.get(endpoints.statistics.dashboard),
    );
  },
};
