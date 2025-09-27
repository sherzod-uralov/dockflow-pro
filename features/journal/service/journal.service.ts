import { JournalCreateType } from "@/features/journal/scheme/journal-create";
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { handleJurnalError } from "@/utils/http-error-handler";
import { JournalListResponse } from "@/features/journal/types/journal.types";

export const journalService = {
  getAllJournals: async () => {
    return await handleJurnalError.executeList(() =>
      axiosInstance.get<JournalListResponse>(endpoints.journal.list),
    );
  },

  createJournal: async (data: JournalCreateType) => {
    return await handleJurnalError.executeCreate(() =>
      axiosInstance.post(endpoints.journal.create, data),
    );
  },
  updateJournal: async (id: string, data: Partial<JournalCreateType>) => {
    return await handleJurnalError.executeUpdate(() =>
      axiosInstance.patch(endpoints.journal.update(id), data),
    );
  },
  deleteJournal: async (id: string) => {
    return await handleJurnalError.executeDelete(() =>
      axiosInstance.delete(endpoints.journal.delete(id)),
    );
  },
};
