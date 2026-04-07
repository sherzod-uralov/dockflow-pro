"use client";

import { useState } from "react";
import { useUrlFilter } from "@/hooks/use-url-filters";
import {
  Box,
  Text,
  Group,
  Select,
  Paper,
  Badge,
  ActionIcon,
  Menu,
  Stack,
  Center,
  Avatar,
  Tabs,
  Tooltip,
} from "@mantine/core";
import {
  IconSearch,
  IconDotsVertical,
  IconEye,
  IconCheck,
  IconClipboardCheck,
  IconTrophy,
  IconTable,
  IconChartBar,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useGetAllUserMonthlyKpis,
  useFinalizeUserMonthlyKpi,
} from "../hook/user-monthly-kpi.hook";
import { UserMonthlyKpiGetResponse } from "../type/user-monthly-kpi.type";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import UserMonthlyKpiTaskScoresView from "../component/user-monthly-kpi-task-scores.view";
import UserMonthlyKpiLeaderboardView from "../component/user-monthly-kpi-leaderboard.view";
import KpiAnalyticsView from "../component/kpi-analytics.view";
import { GuardedMenuItem } from "@/components/shared/permission";

const MONTH_OPTIONS = [
  { value: "1", label: "Yanvar" },
  { value: "2", label: "Fevral" },
  { value: "3", label: "Mart" },
  { value: "4", label: "Aprel" },
  { value: "5", label: "May" },
  { value: "6", label: "Iyun" },
  { value: "7", label: "Iyul" },
  { value: "8", label: "Avgust" },
  { value: "9", label: "Sentabr" },
  { value: "10", label: "Oktabr" },
  { value: "11", label: "Noyabr" },
  { value: "12", label: "Dekabr" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

const FINALIZED_OPTIONS = [
  { value: "all", label: "Barchasi" },
  { value: "true", label: "Yakunlangan" },
  { value: "false", label: "Yakunlanmagan" },
];

const getInitials = (name?: string) =>
  (name || "?")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

const UserMonthlyKpiPage = () => {
  const viewModal = useModal();
  const finalizeModal = useModal();

  const [selectedKpi, setSelectedKpi] = useState<UserMonthlyKpiGetResponse | null>(null);
  const [activeTab, setActiveTab] = useUrlFilter("tab", "table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [yearFilter, setYearFilter] = useState<string | null>(String(currentYear));
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [finalizedFilter, setFinalizedFilter] = useState<string | null>("all");

  const { data, isLoading } = useGetAllUserMonthlyKpis({
    pageNumber: page,
    pageSize,
    year: yearFilter ? Number(yearFilter) : undefined,
    month: monthFilter ? Number(monthFilter) : undefined,
    isFinalized: finalizedFilter === "all" ? undefined : finalizedFilter === "true",
  });

  const finalizeMutation = useFinalizeUserMonthlyKpi();

  const handleViewScores = (kpi: UserMonthlyKpiGetResponse) => {
    setSelectedKpi(kpi);
    viewModal.openModal();
  };

  const handleFinalizeClick = (kpi: UserMonthlyKpiGetResponse) => {
    setSelectedKpi(kpi);
    finalizeModal.openModal();
  };

  const handleFinalizeConfirm = () => {
    if (selectedKpi) {
      finalizeMutation.mutate(
        { year: selectedKpi.year, month: selectedKpi.month },
        {
          onSuccess: () => {
            finalizeModal.closeModal();
            setSelectedKpi(null);
          },
        }
      );
    }
  };

  const columns: DataTableColumn<UserMonthlyKpiGetResponse>[] = [
    {
      accessorKey: "user",
      header: "Xodim",
      cell: ({ row }) => {
        const { user, department } = row.original;
        return user ? (
          <Group gap="sm" wrap="nowrap">
            <Avatar size="sm" radius="xl" src={user.avatarUrl} style={{ backgroundColor: "#e7f5ff", flexShrink: 0 }}>
              <Text size="xs" c="#1e3a5f" fw={500}>{getInitials(user.fullname)}</Text>
            </Avatar>
            <Box>
              <Text size="sm" fw={500} c="#212529" lineClamp={1}>{user.fullname}</Text>
              {department && <Text size="xs" c="dimmed" lineClamp={1}>{department.name}</Text>}
            </Box>
          </Group>
        ) : <Text size="sm" c="dimmed">—</Text>;
      },
      meta: { minWidth: 200 },
    },
    {
      accessorKey: "period",
      header: "Davr",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {MONTH_OPTIONS.find((m) => m.value === String(row.original.month))?.label} {row.original.year}
        </Text>
      ),
      meta: { width: 120 },
    },
    {
      accessorKey: "finalScore",
      header: "Ball",
      cell: ({ row }) => {
        const { finalScore, totalBaseScore, totalPenalty } = row.original;
        return (
          <Tooltip label={`Asosiy: ${totalBaseScore} | Jarima: -${totalPenalty}`}>
            <Badge variant="light" color={finalScore > 0 ? "blue" : "gray"} radius="sm" size="lg" style={{ cursor: "help" }}>
              {finalScore}
            </Badge>
          </Tooltip>
        );
      },
      meta: { width: 80, truncate: false },
    },
    {
      accessorKey: "tasks",
      header: "Vazifalar",
      cell: ({ row }) => {
        const { tasksCompleted, tasksOnTime, tasksLate } = row.original;
        return (
          <Group gap={6} wrap="nowrap">
            <Tooltip label="Bajarilgan"><Badge variant="light" color="blue" radius="sm" size="sm">{tasksCompleted}</Badge></Tooltip>
            <Tooltip label="O'z vaqtida"><Badge variant="light" color="green" radius="sm" size="sm">{tasksOnTime}</Badge></Tooltip>
            {tasksLate > 0 && (
              <Tooltip label="Kechikkan"><Badge variant="light" color="red" radius="sm" size="sm">{tasksLate}</Badge></Tooltip>
            )}
          </Group>
        );
      },
      meta: { width: 140, truncate: false },
    },
    {
      accessorKey: "isFinalized",
      header: "Holat",
      cell: ({ row }) => (
        <Box w={8} h={8} style={{
          borderRadius: "50%",
          backgroundColor: row.original.isFinalized ? "#2ecc71" : "#f39c12",
        }} />
      ),
      meta: { width: 50, truncate: false },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="sm">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <GuardedMenuItem permission="user-monthly-kpi:read" leftSection={<IconEye size={16} />} onClick={() => handleViewScores(row.original)}>
              Balllarni ko'rish
            </GuardedMenuItem>
            {!row.original.isFinalized && (
              <GuardedMenuItem permission="user-monthly-kpi:finalize" leftSection={<IconCheck size={16} />} onClick={() => handleFinalizeClick(row.original)}>
                Yakunlash
              </GuardedMenuItem>
            )}
          </Menu.Dropdown>
        </Menu>
      ),
      meta: { width: 50, truncate: false },
    },
  ];

  const EmptyState = () => (
    <Center py={60}>
      <Stack align="center" gap="md">
        <Box p={16} style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}>
          <IconClipboardCheck size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
          Oylik KPI ma'lumotlari topilmadi
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
            Oylik KPI
          </Text>
          <Text size="sm" c="dimmed">
            Foydalanuvchilarning oylik KPI natijalari
          </Text>
        </Box>
      </Group>

      {/* Filters */}
      <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: "#e9ecef" }}>
        <Group gap="md">
          <Select
            placeholder="Yil"
            data={YEAR_OPTIONS}
            value={yearFilter}
            onChange={setYearFilter}
            clearable
            size="sm"
            radius="sm"
            w={120}
          />
          <Select
            placeholder="Oy"
            data={MONTH_OPTIONS}
            value={monthFilter}
            onChange={setMonthFilter}
            clearable
            size="sm"
            radius="sm"
            w={140}
          />
          <Select
            placeholder="Holat"
            data={FINALIZED_OPTIONS}
            value={finalizedFilter}
            onChange={setFinalizedFilter}
            size="sm"
            radius="sm"
            w={160}
          />
        </Group>
      </Paper>

      {/* Tabs */}
      <Tabs value={activeTab || "table"} onChange={(val) => setActiveTab(val || "table")} radius="sm">
        <Tabs.List mb="md">
          <Tabs.Tab value="table" leftSection={<IconTable size={18} />}>
            Jadval
          </Tabs.Tab>
          <Tabs.Tab value="leaderboard" leftSection={<IconChartBar size={18} />}>
            Reyting
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={18} />}>
            Statistika
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="table">
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
              onRowClick={handleViewScores}
              emptyMessage="Oylik KPI topilmadi"
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="leaderboard">
          <UserMonthlyKpiLeaderboardView
            year={yearFilter ? Number(yearFilter) : currentYear}
            month={monthFilter ? Number(monthFilter) : new Date().getMonth() + 1}
          />
        </Tabs.Panel>

        <Tabs.Panel value="analytics">
          <KpiAnalyticsView
            year={yearFilter ? Number(yearFilter) : currentYear}
            month={monthFilter ? Number(monthFilter) : new Date().getMonth() + 1}
          />
        </Tabs.Panel>
      </Tabs>

      {/* View Task Scores Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={() => {
          viewModal.closeModal();
          setSelectedKpi(null);
        }}
        title="Vazifa ballari"
        description={
          selectedKpi?.user
            ? `${selectedKpi.user.fullname} — ${
                MONTH_OPTIONS.find((m) => m.value === String(selectedKpi.month))?.label
              } ${selectedKpi.year}`
            : "Vazifa ballari tafsilotlari"
        }
        size="xl"
      >
        {selectedKpi && (
          <UserMonthlyKpiTaskScoresView
            userId={selectedKpi.userId}
            year={selectedKpi.year}
            month={selectedKpi.month}
          />
        )}
      </CustomModal>

      {/* Finalize Confirmation Modal */}
      <ConfirmationModal
        isOpen={finalizeModal.isOpen}
        onClose={finalizeModal.closeModal}
        onConfirm={handleFinalizeConfirm}
        title="KPI yakunlash"
        description={`${selectedKpi?.user?.fullname || ""} foydalanuvchisining ${
          MONTH_OPTIONS.find((m) => m.value === String(selectedKpi?.month))?.label || ""
        } ${selectedKpi?.year || ""} oylik KPIsini yakunlamoqchimisiz?`}
        confirmText="Yakunlash"
        cancelText="Bekor qilish"
        variant="default"
      />
    </Box>
  );
};

export default UserMonthlyKpiPage;
