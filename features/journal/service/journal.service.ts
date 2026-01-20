import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import { JournalCreateType } from "@/features/journal/schema/journal.schema";
import { SingleJournalApiResponse, JournalListResponse } from "@/features/journal/type/journal.types";
import { GlobalGetAllPaginationProps } from "@/types/global.types";

export const journalService = createCRUDService<
  SingleJournalApiResponse,
  JournalCreateType,
  Partial<JournalCreateType>,
  GlobalGetAllPaginationProps,
  JournalListResponse
>(endpoints.journal);

// Backwards compatible aliases
export const {
  getAll: getAllJournals,
  getById: getJournalById,
  create: createJournal,
  update: updateJournal,
  delete: deleteJournal,
} = journalService;
