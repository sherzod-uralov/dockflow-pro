import { DataPagination } from "@/types/global.types";

export interface BoardColumnGetResponse {
  id: string;
  projectId: string;
  name: string;
  color?: string;
  position: number;
  wipLimit?: number;
  isClosed: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllBoardColumns extends DataPagination {
  data: BoardColumnGetResponse[];
}

export interface BoardColumnQueryParams {
  projectId: string;
  includeTaskCount?: boolean;
}

export interface BoardColumnFormData {
  projectId: string;
  name: string;
  color?: string;
  position?: number;
  wipLimit?: number;
  isClosed?: boolean;
  isDefault?: boolean;
}

export interface BoardColumnCreatePayload extends BoardColumnFormData {}

export interface BoardColumnUpdatePayload {
  name?: string;
  color?: string;
  position?: number;
  wipLimit?: number;
  isClosed?: boolean;
  isDefault?: boolean;
}

export interface BoardColumnReorderPayload {
  projectId: string;
  columnIds: string[];
}
