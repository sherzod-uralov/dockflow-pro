import { useMutation, useQueryClient } from "react-query";
import { createCRUDHooks } from "@/lib/crud-hooks";
import { deportamentService } from "../service/deportament.service";
import {
  GetAllDeportaments,
  DeportamentQueryParams,
  DepartmentResponse,
} from "../type/deportament.type";
import { DeportamentInferType } from "../schema/deportament.schema";
import { showError, showSuccess } from "@/utils/show-error";

const deportamentHooks = createCRUDHooks<
  DepartmentResponse,
  DeportamentInferType,
  Partial<DeportamentInferType>,
  DeportamentQueryParams,
  GetAllDeportaments
>({
  service: deportamentService,
  queryKey: "deportaments",
  singleQueryKey: "deportament",
  messages: {
    created: "Bo'lim muvaffaqiyatli qo'shildi",
    updated: "Bo'lim muvaffaqiyatli yangilandi",
    deleted: "Bo'lim muvaffaqiyatli o'chirildi",
  },
});

export const useGetAllDeportaments = (params?: DeportamentQueryParams) =>
  deportamentHooks.useGetAll(params);

export const useGetDeportamentById = (id: string) =>
  deportamentHooks.useGetById(id);

export const useCreateDeportament = deportamentHooks.useCreate;

export const useUpdateDeportament = deportamentHooks.useUpdate;

export const useDeleteDeportament = deportamentHooks.useDelete;

export const useUpdateDepartmentParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, parentId }: { id: string; parentId: string | null }) =>
      deportamentService.update(id, { parentId } as Partial<DeportamentInferType>),
    onSuccess: () => {
      queryClient.invalidateQueries(["deportaments"]);
      showSuccess("Bo'lim muvaffaqiyatli ko'chirildi");
    },
    onError: showError,
  });
};
