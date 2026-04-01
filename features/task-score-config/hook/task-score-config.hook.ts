import { useQuery } from "react-query";
import { createCRUDHooks } from "@/lib/crud-hooks";
import { taskScoreConfigService } from "../service/task-score-config.service";
import {
  TaskScoreConfigQueryParams,
  GetAllTaskScoreConfigs,
  TaskScoreConfigCreatePayload,
  TaskScoreConfigUpdatePayload,
  TaskScoreConfigGetResponse,
} from "../type/task-score-config.type";

const taskScoreConfigHooks = createCRUDHooks<
  TaskScoreConfigGetResponse,
  TaskScoreConfigCreatePayload,
  TaskScoreConfigUpdatePayload,
  TaskScoreConfigQueryParams,
  GetAllTaskScoreConfigs
>({
  service: taskScoreConfigService,
  queryKey: "taskScoreConfigs",
  singleQueryKey: "taskScoreConfig",
  messages: {
    created: "Ball konfiguratsiyasi yaratildi",
    updated: "Ball konfiguratsiyasi yangilandi",
    deleted: "Ball konfiguratsiyasi o'chirildi",
  },
});

export const useGetAllTaskScoreConfigs = (params?: TaskScoreConfigQueryParams) =>
  taskScoreConfigHooks.useGetAll(params);

export const useGetTaskScoreConfigById = (id: string, options?: { enabled?: boolean }) =>
  taskScoreConfigHooks.useGetById(id, options);

export const useCreateTaskScoreConfig = taskScoreConfigHooks.useCreate;

export const useUpdateTaskScoreConfig = taskScoreConfigHooks.useUpdate;

export const useDeleteTaskScoreConfig = taskScoreConfigHooks.useDelete;

export const useGetTaskScoreConfigByPriority = (
  priorityLevel: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<TaskScoreConfigGetResponse>({
    queryKey: ["taskScoreConfig", "priority", priorityLevel],
    queryFn: () => taskScoreConfigService.getByPriority(priorityLevel),
    enabled: !!priorityLevel && (options?.enabled !== false),
  });
};
