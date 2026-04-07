import { DataPagination } from "@/types/global.types";

export interface SessionGetResponse {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: "Chrome" | "Firefox" | "Safari" | "Edge" | "Opera" | string;
  os?: "Windows" | "macOS" | "Linux" | "Android" | "iOS" | string;
  device?: "Desktop" | "Mobile" | "Tablet" | string;
  isCurrent?: boolean;
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
