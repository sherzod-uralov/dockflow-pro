import { createCRUDHooks } from "@/lib/crud-hooks";
import { taskLabelService } from "../service/task-label.service";
import {
  TaskLabelGetResponse,
  TaskLabelCreatePayload,
  TaskLabelQueryParams,
} from "../type/task-label.type";
import { PaginatedResponse } from "@/lib/crud-service";

const hooks = createCRUDHooks<
  TaskLabelGetResponse,
  TaskLabelCreatePayload,
  never,
  TaskLabelQueryParams,
  PaginatedResponse<TaskLabelGetResponse>
>({
  service: taskLabelService,
  queryKey: "task-labels",
  singleQueryKey: "task-label",
});

export const useGetAllTaskLabels = hooks.useGetAll;
export const useGetTaskLabelById = hooks.useGetById;
export const useCreateTaskLabel = hooks.useCreate;
export const useDeleteTaskLabel = hooks.useDelete;
