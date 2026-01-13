import { createCRUDHooks } from "@/lib/crud-hooks";
import { journalService } from "@/features/journal/service/journal.service";
import { JournalCreateType } from "@/features/journal/scheme/journal.schema";
import {
  JournalListResponse,
  SingleJournalApiResponse,
} from "@/features/journal/types/journal.types";
import { GlobalGetAllPaginationProps } from "@/types/global.types";

const journalHooks = createCRUDHooks<
  SingleJournalApiResponse,
  JournalCreateType,
  Partial<JournalCreateType>,
  GlobalGetAllPaginationProps,
  JournalListResponse
>({
  service: journalService,
  queryKey: "journals",
  singleQueryKey: "journal",
});

// Export individual hooks for backwards compatibility
export const useGetAllJournals = (params: GlobalGetAllPaginationProps) =>
  journalHooks.useGetAll(params);

export const useGetJournalById = (id: string) =>
  journalHooks.useGetById(id);

export const useJournalCreateMutation = journalHooks.useCreate;

export const useUpdateJournal = journalHooks.useUpdate;

export const useDeleteJournal = journalHooks.useDelete;
