import { useMutation, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import { createCRUDHooks } from "@/lib/crud-hooks";
import { boardColumnService } from "../service/board-column.service";
import {
  BoardColumnQueryParams,
  GetAllBoardColumns,
  BoardColumnCreatePayload,
  BoardColumnUpdatePayload,
  BoardColumnGetResponse,
  BoardColumnReorderPayload,
} from "../type/board-column.type";

const boardColumnHooks = createCRUDHooks<
  BoardColumnGetResponse,
  BoardColumnCreatePayload,
  BoardColumnUpdatePayload,
  BoardColumnQueryParams,
  GetAllBoardColumns
>({
  service: boardColumnService,
  queryKey: "boardColumns",
  singleQueryKey: "boardColumn",
});

export const useGetAllBoardColumns = (params?: BoardColumnQueryParams) =>
  boardColumnHooks.useGetAll(params);

export const useGetBoardColumnById = (id: string, options?: { enabled?: boolean }) =>
  boardColumnHooks.useGetById(id, options);

export const useCreateBoardColumn = boardColumnHooks.useCreate;

export const useUpdateBoardColumn = boardColumnHooks.useUpdate;

export const useDeleteBoardColumn = boardColumnHooks.useDelete;

export const useReorderBoardColumns = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, BoardColumnReorderPayload>({
    mutationFn: (payload) => boardColumnService.reorder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["boardColumns"]);
      showSuccess(data);
    },
    onError: showError,
  });
};
