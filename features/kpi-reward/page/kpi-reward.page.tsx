"use client";

import { useState } from "react";
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
} from "@mantine/core";
import {
  GuardedButton,
  GuardedMenuItem,
} from "@/components/shared/permission";
import {
  IconDotsVertical,
  IconEye,
  IconCheck,
  IconCash,
  IconX,
  IconGift,
  IconTable,
  IconUser,
  IconChecks,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useGetAllKpiRewards,
  useGetMyKpiRewards,
  useApproveKpiReward,
  usePayKpiReward,
  useBulkApproveKpiRewards,
} from "../hook/kpi-reward.hook";
import {
  KpiRewardGetResponse,
  KpiRewardStatus,
  KPI_REWARD_STATUS_OPTIONS,
} from "../type/kpi-reward.type";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import KpiRewardView from "../component/kpi-reward.view";
import KpiRewardRejectForm from "../component/kpi-reward-reject.form";
import { colors } from "@/lib/colors";

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

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Barchasi" },
  ...KPI_REWARD_STATUS_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
  })),
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getStatusBadge = (status: KpiRewardStatus) => {
  const option = KPI_REWARD_STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <Badge variant="light" radius="sm" style={{ color: option?.color }}>
      {option?.label || status}
    </Badge>
  );
};

const KpiRewardPage = () => {
  const viewModal = useModal();
  const rejectModal = useModal();
  const approveModal = useModal();
  const payModal = useModal();
  const bulkApproveModal = useModal();

  const [selectedReward, setSelectedReward] = useState<KpiRewardGetResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [yearFilter, setYearFilter] = useState<string | null>(String(currentYear));
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>("all");

  const { data, isLoading } = useGetAllKpiRewards({
    pageSize,
    pageNumber: page,
    year: yearFilter ? Number(yearFilter) : undefined,
    month: monthFilter ? Number(monthFilter) : undefined,
    status: statusFilter && statusFilter !== "all" ? (statusFilter as KpiRewardStatus) : undefined,
  });

  const { data: myData, isLoading: myLoading } = useGetMyKpiRewards();

  const approveMutation = useApproveKpiReward();
  const payMutation = usePayKpiReward();
  const bulkApproveMutation = useBulkApproveKpiRewards();

  const handleView = (reward: KpiRewardGetResponse) => {
    setSelectedReward(reward);
    viewModal.openModal();
  };

  const handleApproveClick = (reward: KpiRewardGetResponse) => {
    setSelectedReward(reward);
    approveModal.openModal();
  };

  const handlePayClick = (reward: KpiRewardGetResponse) => {
    setSelectedReward(reward);
    payModal.openModal();
  };

  const handleRejectClick = (reward: KpiRewardGetResponse) => {
    setSelectedReward(reward);
    rejectModal.openModal();
  };

  const handleApproveConfirm = () => {
    if (selectedReward) {
      approveMutation.mutate(selectedReward.id, {
        onSuccess: () => {
          approveModal.closeModal();
          setSelectedReward(null);
        },
      });
    }
  };

  const handlePayConfirm = () => {
    if (selectedReward) {
      payMutation.mutate(selectedReward.id, {
        onSuccess: () => {
          payModal.closeModal();
          setSelectedReward(null);
        },
      });
    }
  };

  const handleBulkApprove = () => {
    const pendingIds =
      data?.data
        ?.filter((r) => r.status === KpiRewardStatus.PENDING)
        .map((r) => r.id) || [];
    if (pendingIds.length > 0) {
      bulkApproveMutation.mutate(
        { ids: pendingIds },
        { onSuccess: () => bulkApproveModal.closeModal() }
      );
    }
  };

  const pendingCount =
    data?.data?.filter((r) => r.status === KpiRewardStatus.PENDING).length || 0;

  const allColumns: DataTableColumn<KpiRewardGetResponse>[] = [
    {
      accessorKey: "user",
      header: "Xodim",
      cell: ({ row }) =>
        row.original.user ? (
          <Group gap="sm" wrap="nowrap">
            <Avatar size="sm" radius="xl" src={row.original.user.avatarUrl} style={{ backgroundColor: colors.primaryLight, flexShrink: 0 }}>
              <Text size="xs" c={colors.primary} fw={500}>{getInitials(row.original.user.fullname)}</Text>
            </Avatar>
            <Text size="sm" fw={500} c={colors.textPrimary} lineClamp={1}>{row.original.user.fullname}</Text>
          </Group>
        ) : <Text size="sm" c="dimmed">—</Text>,
      meta: { minWidth: 170 },
    },
    {
      accessorKey: "period",
      header: "Davr",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary}>
          {MONTH_OPTIONS.find((m) => m.value === String(row.original.month))?.label} {row.original.year}
        </Text>
      ),
      meta: { width: 120 },
    },
    {
      accessorKey: "finalScore",
      header: "Ball",
      cell: ({ row }) => (
        <Badge variant="light" color="blue" radius="sm" size="sm">{row.original.finalScore}</Badge>
      ),
      meta: { width: 70, truncate: false },
    },
    {
      accessorKey: "rewardTier",
      header: "Daraja",
      cell: ({ row }) => {
        const tier = row.original.rewardTier;
        return tier ? (
          <Badge variant="light" radius="sm" size="sm" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
            {tier.name}
          </Badge>
        ) : <Text size="sm" c="dimmed">—</Text>;
      },
      meta: { width: 100, truncate: false },
    },
    {
      accessorKey: "rewardAmount",
      header: "So'm",
      cell: ({ row }) => (
        <Text size="sm" fw={500} c={colors.textPrimary}>{row.original.rewardAmount?.toLocaleString("uz-UZ") ?? "—"}</Text>
      ),
      meta: { width: 120 },
    },
    {
      accessorKey: "rewardBhm",
      header: "BHM",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary}>{row.original.rewardBhm ?? "—"}</Text>
      ),
      meta: { width: 60 },
    },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => getStatusBadge(row.original.status),
      meta: { width: 110, truncate: false },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const reward = row.original;
        return (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" radius="sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <GuardedMenuItem permission="kpi-reward:read" leftSection={<IconEye size={16} />} onClick={() => handleView(reward)}>Ko'rish</GuardedMenuItem>
              {reward.status === KpiRewardStatus.PENDING && (
                <>
                  <GuardedMenuItem permission="kpi-reward:approve" leftSection={<IconCheck size={16} />} color="blue" onClick={() => handleApproveClick(reward)}>Tasdiqlash</GuardedMenuItem>
                  <GuardedMenuItem permission="kpi-reward:reject" leftSection={<IconX size={16} />} color="red" onClick={() => handleRejectClick(reward)}>Rad etish</GuardedMenuItem>
                </>
              )}
              {reward.status === KpiRewardStatus.APPROVED && (
                <GuardedMenuItem permission="kpi-reward:pay" leftSection={<IconCash size={16} />} color="green" onClick={() => handlePayClick(reward)}>To'lash</GuardedMenuItem>
              )}
            </Menu.Dropdown>
          </Menu>
        );
      },
      meta: { width: 50, truncate: false },
    },
  ];

  const myColumns: DataTableColumn<KpiRewardGetResponse>[] = [
    {
      accessorKey: "period",
      header: "Davr",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary}>
          {MONTH_OPTIONS.find((m) => m.value === String(row.original.month))?.label} {row.original.year}
        </Text>
      ),
      meta: { width: 120 },
    },
    {
      accessorKey: "finalScore",
      header: "Ball",
      cell: ({ row }) => (
        <Badge variant="light" color="blue" radius="sm" size="sm">{row.original.finalScore}</Badge>
      ),
      meta: { width: 70, truncate: false },
    },
    {
      accessorKey: "rewardTier",
      header: "Daraja",
      cell: ({ row }) => {
        const tier = row.original.rewardTier;
        return tier ? (
          <Badge variant="light" radius="sm" size="sm" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
            {tier.name}
          </Badge>
        ) : <Text size="sm" c="dimmed">—</Text>;
      },
      meta: { width: 100, truncate: false },
    },
    {
      accessorKey: "rewardAmount",
      header: "So'm",
      cell: ({ row }) => (
        <Text size="sm" fw={500} c={colors.textPrimary}>{row.original.rewardAmount?.toLocaleString("uz-UZ") ?? "—"}</Text>
      ),
      meta: { width: 120 },
    },
    {
      accessorKey: "rewardBhm",
      header: "BHM",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary}>{row.original.rewardBhm ?? "—"}</Text>
      ),
      meta: { width: 60 },
    },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => getStatusBadge(row.original.status),
      meta: { width: 110, truncate: false },
    },
  ];

  const EmptyState = () => (
    <Center py={60}>
      <Stack align="center" gap="md">
        <Box p={16} style={{ backgroundColor: colors.bgSubtle, borderRadius: 12 }}>
          <IconGift size={40} color={colors.textDimmed} stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c={colors.textSecondary}>
          Mukofot topilmadi
        </Text>
      </Stack>
    </Center>
  );

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Box>
          <Text size="lg" fw={600} c={colors.textPrimary}>
            KPI Mukofotlar
          </Text>
          <Text size="sm" c="dimmed">
            KPI mukofotlarni boshqarish
          </Text>
        </Box>
        {pendingCount > 0 && activeTab === "all" && (
          <GuardedButton
            permission="kpi-reward:approve"
            leftSection={<IconChecks size={18} />}
            onClick={bulkApproveModal.openModal}
            radius="sm"
            style={{ backgroundColor: colors.primary }}
          >
            Barchasini tasdiqlash ({pendingCount})
          </GuardedButton>
        )}
      </Group>

      {/* Filters */}
      <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: colors.border }}>
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
            data={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            size="sm"
            radius="sm"
            w={160}
          />
        </Group>
      </Paper>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} radius="sm">
        <Tabs.List mb="md">
          <Tabs.Tab value="all" leftSection={<IconTable size={18} />}>
            Barchasi
          </Tabs.Tab>
          <Tabs.Tab value="my" leftSection={<IconUser size={18} />}>
            Mening mukofotlarim
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="all">
          {!isLoading && data?.data?.length === 0 ? (
            <Paper radius="sm" withBorder style={{ borderColor: colors.border }}>
              <EmptyState />
            </Paper>
          ) : (
            <DataTable
              columns={allColumns}
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
              onRowClick={handleView}
              emptyMessage="Mukofot topilmadi"
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="my">
          {!myLoading && (!myData?.data || myData.data.length === 0) ? (
            <Paper radius="sm" withBorder style={{ borderColor: colors.border }}>
              <EmptyState />
            </Paper>
          ) : (
            <DataTable
              columns={myColumns}
              data={myData?.data || []}
              loading={myLoading}
              totalCount={myData?.count || 0}
              currentPage={1}
              pageSize={50}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              onRowClick={handleView}
              emptyMessage="Mukofot topilmadi"
            />
          )}
        </Tabs.Panel>
      </Tabs>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={() => {
          viewModal.closeModal();
          setSelectedReward(null);
        }}
        title="Mukofot ma'lumotlari"
        description="Mukofot haqida to'liq ma'lumot"
        size="lg"
      >
        {selectedReward && <KpiRewardView reward={selectedReward} />}
      </CustomModal>

      {/* Reject Modal */}
      <CustomModal
        isOpen={rejectModal.isOpen}
        onClose={() => {
          rejectModal.closeModal();
          setSelectedReward(null);
        }}
        title="Mukofotni rad etish"
        description="Rad etish sababini kiriting"
        size="md"
        closeOnOverlayClick={false}
      >
        {selectedReward && (
          <KpiRewardRejectForm
            rewardId={selectedReward.id}
            onClose={() => {
              rejectModal.closeModal();
              setSelectedReward(null);
            }}
            onSuccess={() => {
              rejectModal.closeModal();
              setSelectedReward(null);
            }}
          />
        )}
      </CustomModal>

      {/* Approve Confirmation */}
      <ConfirmationModal
        isOpen={approveModal.isOpen}
        onClose={approveModal.closeModal}
        onConfirm={handleApproveConfirm}
        title="Mukofotni tasdiqlash"
        description={`${selectedReward?.user?.fullname || ""} foydalanuvchisining mukofotini tasdiqlaysizmi?`}
        confirmText="Tasdiqlash"
        cancelText="Bekor qilish"
        variant="default"
      />

      {/* Pay Confirmation */}
      <ConfirmationModal
        isOpen={payModal.isOpen}
        onClose={payModal.closeModal}
        onConfirm={handlePayConfirm}
        title="Mukofotni to'lash"
        description={`${selectedReward?.user?.fullname || ""} foydalanuvchisiga ${
          selectedReward?.rewardAmount?.toLocaleString("uz-UZ") || "0"
        } so'm mukofotni to'laysizmi?`}
        confirmText="To'lash"
        cancelText="Bekor qilish"
        variant="default"
      />

      {/* Bulk Approve Confirmation */}
      <ConfirmationModal
        isOpen={bulkApproveModal.isOpen}
        onClose={bulkApproveModal.closeModal}
        onConfirm={handleBulkApprove}
        title="Barchasini tasdiqlash"
        description={`${pendingCount} ta kutilayotgan mukofotni tasdiqlaysizmi?`}
        confirmText="Barchasini tasdiqlash"
        cancelText="Bekor qilish"
        variant="default"
      />
    </Box>
  );
};

export default KpiRewardPage;
