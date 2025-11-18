// audit-log.type.ts
import { DataPagination } from "@/types/global.types";

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESTORE = "RESTORE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  ARCHIVE = "ARCHIVE",
  OTHER = "OTHER",
}

export interface PerformedBy {
  id: string;
  fullname: string;
  username: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  performedByUserId: string;
  performedBy: PerformedBy;
  performedAt: string;
  ipAddress: string;
  changes?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogList extends DataPagination {
  data: AuditLog[];
}

export interface AuditLogQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
  entity?: string;
  entityId?: string;
  action?: AuditAction;
  performedByUserId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateAuditLogRequest {
  entity: string;
  entityId: string;
  action: AuditAction;
  changes?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  performedByUserId?: string;
}
