import { JournalCreateType } from "@/features/journal/scheme/journal-create";
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";

export const journalService = {
  createJournal: async (data: JournalCreateType) => {
    return await axiosInstance.post(endpoints.journal.create, data);
  },
};
