import { useQuery } from "react-query";
import { StatisticsData, statisticsService } from "@/features/statistics";

export const useGetStatistics = () => {
  return useQuery<StatisticsData>({
    queryKey: ["statistics", "dashboard"],
    queryFn: () => statisticsService.getDashboardData(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useGetOverview = () => {
  return useQuery({
    queryKey: ["statistics", "overview"],
    queryFn: () => statisticsService.getOverview(),
  });
};
