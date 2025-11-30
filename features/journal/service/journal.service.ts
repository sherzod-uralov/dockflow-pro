import { JournalCreateType } from "@/features/journal/scheme/journal-create";
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { JournalListResponse } from "@/features/journal/types/journal.types";
import { GlobalGetAllPaginationProps } from "@/types/global.types";

export const journalService = {
  getAllJournals: async (params: GlobalGetAllPaginationProps) => {
    const { data } = await axiosInstance.get<JournalListResponse>(endpoints.journal.list, {
      params,
    });
    return data;
  },

  createJournal: async (payload: JournalCreateType) => {
    const { data } = await axiosInstance.post(endpoints.journal.create, payload);
    return data;
  },

  updateJournal: async (id: string, payload: Partial<JournalCreateType>) => {
    const { data } = await axiosInstance.patch(endpoints.journal.update(id), payload);
    return data;
  },

  deleteJournal: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.journal.delete(id));
    return data;
  },

  getJournalById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.journal.detail(id));
    return data;
  },
};
