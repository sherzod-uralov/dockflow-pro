import { useMutation, useQuery, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import { taskWatcherService } from "../service/task-watcher.service";
import { TaskWatcherQueryParams } from "../type/task-watcher.type";

export const useGetAllTaskWatchers = (params?: TaskWatcherQueryParams) => {
  return useQuery({
    queryKey: ["task-watchers", params],
    queryFn: () => taskWatcherService.getAll(params),
    keepPreviousData: true,
    enabled: !!params?.taskId,
  });
};

export const useWatchTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskWatcherService.watch(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["task-watchers"]);
      showSuccess(data);
    },
    onError: showError,
  });
};

export const useUnwatchTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskWatcherService.unwatch(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["task-watchers"]);
      showSuccess(data);
    },
    onError: showError,
  });
};
