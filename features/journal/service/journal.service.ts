import { JournalCreateType } from "@/features/journal/scheme/journal-create";
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { JournalListResponse } from "@/features/journal/types/journal.types";
import { GlobalGetAllPaginationProps } from "@/types/global.types";
import { handleJournalError } from "@/utils/http-error-handler";

export const journalService = {
  getAllJournals: async (params: GlobalGetAllPaginationProps) => {
    return await handleJournalError.executeList(() =>
      axiosInstance.get<JournalListResponse>(endpoints.journal.list, {
        params: {
          ...params,
        },
      }),
    );
  },

  createJournal: async (data: JournalCreateType) => {
    return await handleJournalError.executeCreate(() =>
      axiosInstance.post(endpoints.journal.create, data),
    );
  },
  updateJournal: async (id: string, data: Partial<JournalCreateType>) => {
    return await handleJournalError.executeUpdate(() =>
      axiosInstance.patch(endpoints.journal.update(id), data),
    );
  },
  deleteJournal: async (id: string) => {
    return await handleJournalError.executeDelete(() =>
      axiosInstance.delete(endpoints.journal.delete(id)),
    );
  },
};
