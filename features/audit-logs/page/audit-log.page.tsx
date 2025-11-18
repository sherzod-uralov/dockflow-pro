// audit-log.page.tsx
"use client";

import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import { useGetAllAuditLogs } from "../hook/audit-log.hook";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  CustomAction,
  ActionItem,
  createViewAction,
} from "@/components/shared/ui/custom-action";
import { AuditLog, AuditAction } from "../type/audit-log.type";
import AuditLogView from "../component/audit-log.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { usePagination } from "@/hooks/use-pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

const AuditLogPage = () => {
  const viewModal: ModalState = useModal();

  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(
    null,
  );
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const { data, isLoading } = useGetAllAuditLogs({
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const auditLogId = searchParams.get("auditLogId");

    if (auditLogId) {
      const auditLog = data?.data?.find(
        (log: AuditLog) => log.id === auditLogId,
      );

      if (auditLog) {
        setSelectedAuditLog(auditLog);
        viewModal.openModal();
      }
    } else {
      if (viewModal.isOpen) {
        viewModal.closeModal();
      }
    }
  }, [searchParams, data]);

  const handleView = (auditLog: AuditLog) => {
    setSelectedAuditLog(auditLog);
    viewModal.openModal();
    router.push(`?auditLogId=${auditLog.id}`, { scroll: false });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCloseViewModal = () => {
    viewModal.closeModal();
    setSelectedAuditLog(null);
    router.push("/dashboard/admin/audit-logs", { scroll: false });
  };

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return "bg-green-100 text-green-700";
      case AuditAction.UPDATE:
        return "bg-blue-100 text-blue-700";
      case AuditAction.DELETE:
        return "bg-red-100 text-red-700";
      case AuditAction.RESTORE:
        return "bg-yellow-100 text-yellow-700";
      case AuditAction.LOGIN:
        return "bg-purple-100 text-purple-700";
      case AuditAction.LOGOUT:
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <UserToolbar
        searchQuery={searchQuery}
        searchPlaceholder="Audit loglarni qidirish..."
        onSearch={handleSearch}
      />

      <DataTable
        loading={isLoading}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={data?.count || 0}
        currentPage={pageNumber}
        columns={[
          {
            header: "Entity",
            accessorKey: "entity",
            cell: ({ row }) => (
              <Badge variant="outline" className="bg-gray-100">
                {row.original.entity}
              </Badge>
            ),
          },
          {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }) => (
              <Badge
                variant="outline"
                className={getActionColor(row.original.action)}
              >
                {row.original.action}
              </Badge>
            ),
          },
          {
            header: "Foydalanuvchi",
            accessorKey: "performedBy.fullname",
            cell: ({ row }) => (
              <div className="flex flex-col">
                <span className="font-medium">
                  {row.original.performedBy?.fullname}
                </span>
                <span className="text-sm text-muted-foreground">
                  @{row.original.performedBy?.username}
                </span>
              </div>
            ),
          },
          {
            header: "Vaqt",
            accessorKey: "performedAt",
            cell: ({ row }) => (
              <div className="flex flex-col">
                <span className="text-sm">
                  {format(new Date(row.original.performedAt), "dd.MM.yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(row.original.performedAt), "HH:mm:ss")}
                </span>
              </div>
            ),
          },
          {
            header: "IP Address",
            accessorKey: "ipAddress",
            cell: ({ row }) => (
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {row.original.ipAddress}
              </code>
            ),
          },
          {
            header: "Harakatlar",
            accessorKey: "actions",
            cell: ({ row }) => {
              const auditLog = row.original;

              const actions: ActionItem[] = [
                createViewAction(() => handleView(auditLog)),
              ];

              return <CustomAction actions={actions} />;
            },
            meta: {
              width: 20,
            },
          },
        ]}
        data={data?.data || []}
      />

      <CustomModal
        size="2xl"
        closeOnOverlayClick
        title="Audit Log haqida to'liq ma'lumotlar"
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
      >
        <AuditLogView />
      </CustomModal>
    </>
  );
};

export default AuditLogPage;
