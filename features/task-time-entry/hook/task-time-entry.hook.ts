import { createCRUDHooks } from "@/lib/crud-hooks";
import { taskTimeEntryService } from "../service/task-time-entry.service";
import {
  TaskTimeEntryGetResponse,
  TaskTimeEntryCreatePayload,
  TaskTimeEntryUpdatePayload,
  TaskTimeEntryQueryParams,
} from "../type/task-time-entry.type";
import { PaginatedResponse } from "@/lib/crud-service";

const hooks = createCRUDHooks<
  TaskTimeEntryGetResponse,
  TaskTimeEntryCreatePayload,
  TaskTimeEntryUpdatePayload,
  TaskTimeEntryQueryParams,
  PaginatedResponse<TaskTimeEntryGetResponse>
>({
  service: taskTimeEntryService,
  queryKey: "task-time-entries",
  singleQueryKey: "task-time-entry",
  messages: {
    created: "Vaqt yozuvi qo'shildi",
    updated: "Vaqt yozuvi yangilandi",
    deleted: "Vaqt yozuvi o'chirildi",
  },
});

export const useGetAllTaskTimeEntries = hooks.useGetAll;
export const useGetTaskTimeEntryById = hooks.useGetById;
export const useCreateTaskTimeEntry = hooks.useCreate;
export const useUpdateTaskTimeEntry = hooks.useUpdate;
export const useDeleteTaskTimeEntry = hooks.useDelete;
