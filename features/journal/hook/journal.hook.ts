import { useMutation, useQuery, useQueryClient } from "react-query";
import { JournalCreateType } from "@/features/journal/scheme/journal-create";
import { journalService } from "@/features/journal/service/journal.service";
import { toast } from "sonner";
import {
  JournalListResponse,
  SingleJournalApiResponse,
} from "@/features/journal/types/journal.types";
import { GlobalGetAllPaginationProps } from "@/types/global.types";

export const useGetAllJournals = ({
  search,
  pageSize,
  pageNumber,
}: GlobalGetAllPaginationProps) => {
  return useQuery<JournalListResponse>({
    queryFn: () =>
      journalService.getAllJournals({
        search: search,
        pageSize: pageSize,
        pageNumber: pageNumber,
      }),
    queryKey: ["journals", search, pageNumber, pageSize],
    keepPreviousData: true,
  });
};
export const useJournalCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JournalCreateType) =>
      journalService.createJournal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      // You can add a success toast or notification here if needed
      toast.success("Jurnal muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      // You can add an error toast or notification here if needed
      toast.error(error.message);
    },
  });
};

export const useUpdateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JournalCreateType }) =>
      journalService.updateJournal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success("Jurnal muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => journalService.deleteJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success("Jurnal muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Jurnal o'chirishda xatolik yuz berdi",
      );
    },
  });
};

export const useGetJournalById = (id: string) => {
  return useQuery<SingleJournalApiResponse>({
    queryKey: ["journal", id],
    queryFn: () => journalService.getJournalById(id),
    enabled: !!id,
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Ma'lumotni olishda xatolik",
      );
    },
  });
};
