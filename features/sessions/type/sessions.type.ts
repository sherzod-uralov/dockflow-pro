import { DataPagination } from "@/types/global.types";

export interface SessionGetResponse {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface GetAllSessions extends DataPagination {
  data: SessionGetResponse[];
}

export interface SessionQueryParams {
  pageNumber?: number;
  pageSize?: number;
}
