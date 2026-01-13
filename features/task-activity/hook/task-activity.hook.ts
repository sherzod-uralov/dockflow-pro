import { useQuery } from "react-query";
import { taskActivityService } from "../service/task-activity.service";
import { TaskActivityQueryParams } from "../type/task-activity.type";

export const useGetAllTaskActivities = (params?: TaskActivityQueryParams) => {
  return useQuery({
    queryKey: ["task-activities", params],
    queryFn: () => taskActivityService.getAll(params),
    keepPreviousData: true,
    enabled: !!params?.taskId,
  });
};

export const useGetTaskActivityById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["task-activity", id],
    queryFn: () => taskActivityService.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};
