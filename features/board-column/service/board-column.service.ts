import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import { createCRUDService, extendCRUDService } from "@/lib/crud-service";
import {
  BoardColumnGetResponse,
  GetAllBoardColumns,
  BoardColumnQueryParams,
  BoardColumnCreatePayload,
  BoardColumnUpdatePayload,
  BoardColumnReorderPayload,
} from "../type/board-column.type";

const baseBoardColumnService = createCRUDService<
  BoardColumnGetResponse,
  BoardColumnCreatePayload,
  BoardColumnUpdatePayload,
  BoardColumnQueryParams,
  GetAllBoardColumns
>(endpoints.boardColumn, {
  transformParams: (params) => ({
    projectId: params?.projectId,
    includeTaskCount: params?.includeTaskCount,
  }),
});

export const boardColumnService = extendCRUDService(
  baseBoardColumnService,
  {
    reorder: async (payload: BoardColumnReorderPayload): Promise<void> => {
      await axiosInstance.post(endpoints.boardColumn.reorder, payload);
    },
  }
);

export const {
  getAll: getAllBoardColumns,
  getById: getBoardColumnById,
  create: createBoardColumn,
  update: updateBoardColumn,
  delete: deleteBoardColumn,
} = boardColumnService;

export const reorderBoardColumns = boardColumnService.reorder;
