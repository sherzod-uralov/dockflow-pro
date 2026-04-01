import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import { createCRUDService, extendCRUDService } from "@/lib/crud-service";
import {
  TaskScoreConfigGetResponse,
  GetAllTaskScoreConfigs,
  TaskScoreConfigQueryParams,
  TaskScoreConfigCreatePayload,
  TaskScoreConfigUpdatePayload,
} from "../type/task-score-config.type";

const baseTaskScoreConfigService = createCRUDService<
  TaskScoreConfigGetResponse,
  TaskScoreConfigCreatePayload,
  TaskScoreConfigUpdatePayload,
  TaskScoreConfigQueryParams,
  GetAllTaskScoreConfigs
>(endpoints.taskScoreConfig, {
  transformParams: (params) => ({
    isActive: params?.isActive,
  }),
});

export const taskScoreConfigService = extendCRUDService(
  baseTaskScoreConfigService,
  {
    getByPriority: async (priorityLevel: string): Promise<TaskScoreConfigGetResponse> => {
      const { data } = await axiosInstance.get<TaskScoreConfigGetResponse>(
        endpoints.taskScoreConfig.byPriority(priorityLevel)
      );
      return data;
    },
  }
);

export const {
  getAll: getAllTaskScoreConfigs,
  getById: getTaskScoreConfigById,
  create: createTaskScoreConfig,
  update: updateTaskScoreConfig,
  delete: deleteTaskScoreConfig,
} = taskScoreConfigService;

export const getTaskScoreConfigByPriority = taskScoreConfigService.getByPriority;
