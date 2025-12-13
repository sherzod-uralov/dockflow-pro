import { useMutation, useQuery, useQueryClient } from "react-query";
import { deportamentService } from "../service/deportament.service";
import {
  GetAllDeportaments,
  DeportamentQueryParams,
} from "../type/deportament.type";
import { DeportamentInferType } from "../schema/deportament.schema";
import { showError, showSuccess } from "@/utils/show-error";

export const useCreateDeportament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeportamentInferType) => deportamentService.createDeportament(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["deportaments"]);
      showSuccess("Bo'lim yaratildi");
    },
    onError: showError,
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
      showSuccess("Bo'lim yangilandi");
    },
    onError: showError,
  });
};

export const useUpdateDepartmentParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, parentId }: { id: string; parentId: string | null }) =>
      deportamentService.updateDeportament(id, { parentId } as any),
    onSuccess: () => {
      queryClient.invalidateQueries(["deportaments"]);
      showSuccess("Bo'lim bog'landi");
    },
    onError: showError,
  });
};

export const useDeleteDeportament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deportamentService.deleteDeportament(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["deportaments"]);
      showSuccess("Bo'lim o'chirildi");
    },
    onError: showError,
  });
};

export const useGetDeportamentById = (id: string) => {
  return useQuery({
    queryKey: ["deportament", id],
    queryFn: () => deportamentService.getDeportamentById(id),
    enabled: !!id,
  });
};
