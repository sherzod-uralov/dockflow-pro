import { useQuery } from "react-query";
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  KpiAnalyticsParams,
  KpiAnalyticsResponse,
} from "../type/kpi-analytics.type";

export const useGetKpiAnalytics = (params?: KpiAnalyticsParams) => {
  return useQuery<KpiAnalyticsResponse>({
    queryKey: ["kpi-analytics", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<KpiAnalyticsResponse>(
        endpoints.kpiAnalytics.get,
        { params },
      );
      return data;
    },
    keepPreviousData: true,
  });
};
