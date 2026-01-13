import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  AuditLog,
  AuditLogList,
  AuditLogQueryParams,
  CreateAuditLogRequest,
} from "../type/audit-log.type";

const baseCRUDService = createCRUDService<
  AuditLog,
  CreateAuditLogRequest,
  Partial<CreateAuditLogRequest>,
  AuditLogQueryParams,
  AuditLogList
>(endpoints.auditLog, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
    entity: params?.entity,
    entityId: params?.entityId,
    action: params?.action,
    performedByUserId: params?.performedByUserId,
    startDate: params?.startDate,
    endDate: params?.endDate,
  }),
});

export const auditLogService = {
  getAllAuditLogs: baseCRUDService.getAll,
  getAuditLogById: baseCRUDService.getById,
  createAuditLog: baseCRUDService.create,
};
