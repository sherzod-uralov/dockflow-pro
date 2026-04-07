"use client";

import { useState } from "react";
import {
  Box,
  Text,
  Group,
  Paper,
  Badge,
  ActionIcon,
  Menu,
  Stack,
  Center,
} from "@mantine/core";
import {
  GuardedButton,
  GuardedMenuItem,
} from "@/components/shared/permission";
import {
  IconPlus,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconTrophy,
  IconCopy,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useGetAllKpiRewardTiers,
  useDeleteKpiRewardTier,
  KpiRewardTierGetResponse,
} from "@/features/kpi-reward-tier";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import KpiRewardTierForm from "../component/kpi-reward-tier.form";
import KpiRewardTierView from "../component/kpi-reward-tier.view";

const KpiRewardTierPage = () => {
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedTier, setSelectedTier] = useState<KpiRewardTierGetResponse | null>(null);

  const { data, isLoading } = useGetAllKpiRewardTiers();

  const deleteMutation = useDeleteKpiRewardTier();

  const handleView = (tier: KpiRewardTierGetResponse) => {
    setSelectedTier(tier);
    viewModal.openModal();
  };

  const handleEdit = (tier: KpiRewardTierGetResponse) => {
    setSelectedTier(tier);
    editModal.openModal();
  };

  const handleDeleteClick = (tier: KpiRewardTierGetResponse) => {
    setSelectedTier(tier);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedTier) {
      deleteMutation.mutate(selectedTier.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedTier(null);
        },
      });
    }
  };

  const handleEditClose = () => {
    editModal.closeModal();
    setSelectedTier(null);
  };

  const handleViewClose = () => {
    viewModal.closeModal();
    setSelectedTier(null);
  };

  const columns: DataTableColumn<KpiRewardTierGetResponse>[] = [
    {
      accessorKey: "name",
      header: "Daraja",
      cell: ({ row }) => (
        <Group gap="sm" wrap="nowrap">
          <Box w={12} h={12} style={{
            borderRadius: "50%",
            backgroundColor: row.original.color || "#868e96",
            flexShrink: 0,
          }} />
          <Box>
            <Text size="sm" fw={500} c="#212529">{row.original.name}</Text>
            {row.original.description && (
              <Text size="xs" c="dimmed" lineClamp={1}>{row.original.description}</Text>
            )}
          </Box>
        </Group>
      ),
      meta: { minWidth: 180 },
    },
    {
      accessorKey: "scoreRange",
      header: "Ball",
      cell: ({ row }) => (
        <Text size="sm" c="#495057" fw={500}>
          {row.original.minScore}–{row.original.maxScore}
        </Text>
      ),
      meta: { width: 90 },
    },
    {
      accessorKey: "rewardAmount",
      header: "So'm",
      cell: ({ row }) => (
        <Text size="sm" fw={500} c="#212529">
          {row.original.rewardAmount != null
            ? row.original.rewardAmount.toLocaleString("uz-UZ")
            : "—"}
        </Text>
      ),
      meta: { width: 120 },
    },
    {
      accessorKey: "rewardBhm",
      header: "BHM",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">{row.original.rewardBhm ?? "—"}</Text>
      ),
      meta: { width: 60 },
    },
    {
      accessorKey: "isPenalty",
      header: "Turi",
      cell: ({ row }) => (
        <Badge variant="light" color={row.original.isPenalty ? "red" : "green"} radius="sm" size="sm">
          {row.original.isPenalty ? "Jarima" : "Mukofot"}
        </Badge>
      ),
      meta: { width: 90, truncate: false },
    },
    {
      accessorKey: "isActive",
      header: "Holat",
      cell: ({ row }) => (
        <Box w={8} h={8} style={{
          borderRadius: "50%",
          backgroundColor: row.original.isActive ? "#2ecc71" : "#adb5bd",
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
            <GuardedMenuItem permission="kpi-reward-tier:read" leftSection={<IconEye size={16} />} onClick={() => handleView(row.original)}>
              Ko'rish
            </GuardedMenuItem>
            <GuardedMenuItem permission="kpi-reward-tier:update" leftSection={<IconEdit size={16} />} onClick={() => handleEdit(row.original)}>
              Tahrirlash
            </GuardedMenuItem>
            <Menu.Divider />
            <GuardedMenuItem permission="kpi-reward-tier:delete" color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDeleteClick(row.original)}>
              O'chirish
            </GuardedMenuItem>
          </Menu.Dropdown>
        </Menu>
      ),
      meta: { width: 50, truncate: false },
    },
  ];

  const EmptyState = () => (
    <Center py={60}>
      <Stack align="center" gap="md">
        <Box
          p={16}
          style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}
        >
          <IconTrophy size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
          Mukofot darajasi topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi daraja qo'shish uchun yuqoridagi tugmani bosing
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
            Mukofot darajalari
          </Text>
          <Text size="sm" c="dimmed">
            KPI mukofot darajalari ro'yxati
          </Text>
        </Box>
        <GuardedButton
          permission="kpi-reward-tier:create"
          leftSection={<IconPlus size={18} />}
          onClick={createModal.openModal}
          radius="sm"
          styles={{
            root: {
              backgroundColor: "#1e3a5f",
              "&:hover": { backgroundColor: "#162d4a" },
            },
          }}
        >
          Daraja qo'shish
        </GuardedButton>
      </Group>

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
          currentPage={1}
          pageSize={100}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          emptyMessage="Mukofot darajasi topilmadi"
        />
      )}

      {/* Create Modal */}
      <CustomModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Daraja qo'shish"
        description="Yangi mukofot darajasi qo'shish uchun maydonlarni to'ldiring"
        size="lg"
        closeOnOverlayClick={false}
      >
        <KpiRewardTierForm
          mode="create"
          onClose={createModal.closeModal}
          onSuccess={createModal.closeModal}
        />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        title="Darajani tahrirlash"
        description="Mukofot darajasi ma'lumotlarini o'zgartirishingiz mumkin"
        size="lg"
        closeOnOverlayClick={false}
      >
        <KpiRewardTierForm
          mode="update"
          tier={selectedTier}
          onClose={handleEditClose}
          onSuccess={handleEditClose}
        />
      </CustomModal>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={handleViewClose}
        title="Daraja ma'lumotlari"
        description="Mukofot darajasi haqida to'liq ma'lumot"
        size="lg"
      >
        {selectedTier && <KpiRewardTierView tier={selectedTier} />}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        title="Darajani o'chirish"
        description={`"${selectedTier?.name}" darajasini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />
    </Box>
  );
};

export default KpiRewardTierPage;
