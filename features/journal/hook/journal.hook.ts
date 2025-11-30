import { useMutation, useQuery, useQueryClient } from "react-query";
import { JournalCreateType } from "@/features/journal/scheme/journal-create";
import { journalService } from "@/features/journal/service/journal.service";
import {
  JournalListResponse,
  SingleJournalApiResponse,
} from "@/features/journal/types/journal.types";
import { GlobalGetAllPaginationProps } from "@/types/global.types";
import { showError, showSuccess } from "@/utils/show-error";

export const useGetAllJournals = ({
  search,
  pageSize,
  pageNumber,
}: GlobalGetAllPaginationProps) => {
  return useQuery<JournalListResponse>({
    queryFn: () => journalService.getAllJournals({ search, pageSize, pageNumber }),
    queryKey: ["journals", search, pageNumber, pageSize],
    keepPreviousData: true,
  });
};

export const useJournalCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JournalCreateType) => journalService.createJournal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      showSuccess("Jurnal yaratildi");
    },
    onError: showError,
  });
};

export const useUpdateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JournalCreateType }) =>
      journalService.updateJournal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      showSuccess("Jurnal yangilandi");
    },
    onError: showError,
  });
};

export const useDeleteJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => journalService.deleteJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      showSuccess("Jurnal o'chirildi");
    },
    onError: showError,
  });
};

export const useGetJournalById = (id: string) => {
  return useQuery<SingleJournalApiResponse>({
    queryKey: ["journal", id],
    queryFn: () => journalService.getJournalById(id),
    enabled: !!id,
  });
};
