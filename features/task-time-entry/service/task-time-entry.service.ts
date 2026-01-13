import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService, PaginatedResponse } from "@/lib/crud-service";
import {
  TaskTimeEntryGetResponse,
  TaskTimeEntryCreatePayload,
  TaskTimeEntryUpdatePayload,
  TaskTimeEntryQueryParams,
} from "../type/task-time-entry.type";

export const taskTimeEntryService = createCRUDService<
  TaskTimeEntryGetResponse,
  TaskTimeEntryCreatePayload,
  TaskTimeEntryUpdatePayload,
  TaskTimeEntryQueryParams,
  PaginatedResponse<TaskTimeEntryGetResponse>
>(endpoints.taskTimeEntry, {
  transformParams: (params) => ({
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    taskId: params?.taskId,
    userId: params?.userId,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    isBillable: params?.isBillable,
  }),
});
