"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Group,
  TextInput,
  Paper,
  Badge,
  ActionIcon,
  Menu,
  Stack,
  Center,
} from "@mantine/core";
import {
  IconSearch,
  IconDotsVertical,
  IconEye,
  IconCopy,
  IconActivity,
} from "@tabler/icons-react";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import { useGetAllAuditLogs } from "../hook/audit-log.hook";
import { AuditLog, AuditAction } from "../type/audit-log.type";
import AuditLogView from "../component/audit-log.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import { format } from "date-fns";

const AuditLogPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modals
  const viewModal = useModal();

  // State
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query
  const { data, isLoading } = useGetAllAuditLogs({
    search: debouncedSearch || undefined,
    pageSize,
    pageNumber: page,
  });

  // URL param uchun
  useEffect(() => {
    const auditLogId = searchParams.get("auditLogId");
    if (auditLogId && data?.data) {
      const auditLog = data.data.find((log: AuditLog) => log.id === auditLogId);
      if (auditLog) {
        setSelectedAuditLog(auditLog);
        viewModal.openModal();
      }
    }
  }, [searchParams, data]);

  // Handlers
  const handleView = (auditLog: AuditLog) => {
    setSelectedAuditLog(auditLog);
    viewModal.openModal();
    router.push(`?auditLogId=${auditLog.id}`, { scroll: false });
  };

  const handleCloseView = () => {
    viewModal.closeModal();
    setSelectedAuditLog(null);
    router.push(window.location.pathname, { scroll: false });
  };

  const getActionColor = (action: AuditAction): string => {
    switch (action) {
      case AuditAction.CREATE:
        return "green";
      case AuditAction.UPDATE:
        return "blue";
      case AuditAction.DELETE:
        return "red";
      case AuditAction.RESTORE:
        return "yellow";
      case AuditAction.LOGIN:
        return "violet";
      case AuditAction.LOGOUT:
        return "gray";
      case AuditAction.APPROVE:
        return "teal";
      case AuditAction.REJECT:
        return "orange";
      case AuditAction.ARCHIVE:
        return "indigo";
      default:
        return "gray";
    }
  };

  // Table columns
  const columns: DataTableColumn<AuditLog>[] = [
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => (
        <Badge variant="light" color="gray" radius="sm">
          {row.original.entity}
        </Badge>
      ),
      meta: { minWidth: 100 },
    },
    {
      accessorKey: "action",
      header: "Amal",
      cell: ({ row }) => (
        <Badge variant="light" color={getActionColor(row.original.action)} radius="sm">
          {row.original.action}
        </Badge>
      ),
      meta: { width: 100, truncate: false },
    },
    {
      accessorKey: "performedBy",
      header: "Foydalanuvchi",
      cell: ({ row }) => (
        <Box>
          <Text size="sm" fw={500} c="#212529">
            {row.original.performedBy?.fullname || "—"}
          </Text>
          <Text size="xs" c="dimmed">
            @{row.original.performedBy?.username || "—"}
          </Text>
        </Box>
      ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "performedAt",
      header: "Vaqt",
      cell: ({ row }) => (
        <Box>
          <Text size="sm" c="#212529">
            {format(new Date(row.original.performedAt), "dd.MM.yyyy")}
          </Text>
          <Text size="xs" c="dimmed">
            {format(new Date(row.original.performedAt), "HH:mm:ss")}
          </Text>
        </Box>
      ),
      meta: { minWidth: 100 },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <Text size="sm" c="#495057" ff="monospace">
          {row.original.ipAddress || "—"}
        </Text>
      ),
      meta: { minWidth: 120 },
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => (
        <Menu shadow="md" width={180} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="sm">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} />}
              onClick={() => handleView(row.original)}
            >
              Ko'rish
            </Menu.Item>
            <Menu.Item
              leftSection={<IconCopy size={16} />}
              onClick={() => handleCopyToClipboard(row.original.id, "ID")}
            >
              ID nusxalash
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
      meta: { width: 80, truncate: false },
    },
  ];

  // Empty state
  const EmptyState = () => (
    <Center py={60}>
      <Stack align="center" gap="md">
        <Box
          p={16}
          style={{
            backgroundColor: "#f1f3f5",
            borderRadius: 12,
          }}
        >
          <IconActivity size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
          Audit log topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Hozircha tizimda hech qanday harakat qayd etilmagan
        </Text>
      </Stack>
    </Center>
  );

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Box>
          <Text size="lg" fw={600} c="#212529">
            Audit jurnallari
          </Text>
          <Text size="sm" c="dimmed">
            Tizim harakatlari monitoringi
          </Text>
        </Box>
      </Group>

      {/* Search */}
      <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: "#e9ecef" }}>
        <TextInput
          placeholder="Audit loglarni qidirish..."
          leftSection={<IconSearch size={18} color="#868e96" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
        />
      </Paper>

      {/* Table */}
      {!isLoading && data?.data?.length === 0 ? (
        <Paper radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <EmptyState />
        </Paper>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          totalCount={data?.count || 0}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          emptyMessage="Audit log topilmadi"
        />
      )}

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseView}
        title="Audit log ma'lumotlari"
        description="Tizim harakati haqida to'liq ma'lumot"
        size="2xl"
      >
        <AuditLogView />
      </CustomModal>
    </Box>
  );
};

export default AuditLogPage;
