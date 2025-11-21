// audit-log.hook.ts
import { useMutation, useQuery, useQueryClient } from "react-query";
import { auditLogService } from "../service/audit-log.service";
import {
  AuditLogList,
  AuditLogQueryParams,
  CreateAuditLogRequest,
} from "../type/audit-log.type";
import { toast } from "sonner";

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAuditLogRequest) =>
      auditLogService.createAuditLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-logs"]);
      toast.success("Audit log muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useGetAllAuditLogs = (params?: AuditLogQueryParams) => {
  return useQuery<AuditLogList>({
    queryKey: ["audit-logs", params],
    queryFn: () => auditLogService.getAllAuditLogs(params),
    keepPreviousData: true,
  });
};

export const useGetAuditLogById = (id: string) => {
  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: () => auditLogService.getAuditLogById(id),
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
