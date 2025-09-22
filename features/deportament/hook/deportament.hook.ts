import { useMutation, useQuery, useQueryClient } from "react-query";
import { deportamentService } from "../service/deportament.service";
import {
  GetAllDeportaments,
  Deportament,
  DeportamentQueryParams,
} from "../type/deportament.type";
import { toast } from "sonner";
import { DeportamentInferType } from "../schema/deportament.schema";

export const useCreateDeportament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeportamentInferType) =>
      deportamentService.createDeportament(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["deportaments"]);
      toast.success("Deportament muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useGetAllDeportaments = (params?: DeportamentQueryParams) => {
  return useQuery<GetAllDeportaments>({
    queryKey: ["deportaments", params],
    queryFn: () => deportamentService.getAllDeportaments(params),
    keepPreviousData: true,
  });
};

export const useUpdateDeportament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeportamentInferType }) =>
      deportamentService.updateDeportament(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["deportaments"]);
      toast.success("Deportament muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteDeportament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deportamentService.deleteDeportament(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["deportaments"]);
      toast.success("Deportament muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "O'chirishda xatolik yuz berdi",
      );
    },
  });
};

export const useGetDeportamentById = (id: string) => {
  return useQuery({
    queryKey: ["deportament", id],
    queryFn: () => deportamentService.getDeportamentById(id),
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
