"use client";

import { useState } from "react";
import {
  Box,
  Text,
  Group,
  Button,
  Paper,
  Badge,
  ActionIcon,
  Menu,
  Stack,
  Center,
} from "@mantine/core";
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
      header: "Nomi",
      cell: ({ row }) => (
        <Group gap="sm" wrap="nowrap">
          <Box
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: row.original.color || "#868e96",
              flexShrink: 0,
            }}
          />
          <Text size="sm" fw={500} c="#212529">
            {row.original.name}
          </Text>
        </Group>
      ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "scoreRange",
      header: "Ball oralig'i",
      cell: ({ row }) => (
        <Badge variant="light" color="blue" radius="sm">
          {row.original.minScore} — {row.original.maxScore}
        </Badge>
      ),
      meta: { width: 140, truncate: false },
    },
    {
      accessorKey: "rewardAmount",
      header: "Mukofot (so'm)",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.rewardAmount != null
            ? row.original.rewardAmount.toLocaleString("uz-UZ")
            : "—"}
        </Text>
      ),
      meta: { width: 130 },
    },
    {
      accessorKey: "rewardBhm",
      header: "Mukofot (BHM)",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.rewardBhm ?? "—"}
        </Text>
      ),
      meta: { width: 120 },
    },
    {
      accessorKey: "isPenalty",
      header: "Jarima",
      cell: ({ row }) => (
        <Badge
          variant="light"
          color={row.original.isPenalty ? "red" : "gray"}
          radius="sm"
        >
          {row.original.isPenalty ? "Ha" : "Yo'q"}
        </Badge>
      ),
      meta: { width: 90, truncate: false },
    },
    {
      accessorKey: "isActive",
      header: "Holat",
      cell: ({ row }) => (
        <Badge
          variant="light"
          color={row.original.isActive ? "green" : "gray"}
          radius="sm"
        >
          {row.original.isActive ? "Faol" : "Nofaol"}
        </Badge>
      ),
      meta: { width: 90, truncate: false },
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => (
        <Menu shadow="md" width={200} position="bottom-end">
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
              leftSection={<IconEdit size={16} />}
              onClick={() => handleEdit(row.original)}
            >
              Tahrirlash
            </Menu.Item>
            <Menu.Item
              leftSection={<IconCopy size={16} />}
              onClick={() => handleCopyToClipboard(row.original.id, "ID")}
            >
              ID nusxalash
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => handleDeleteClick(row.original)}
            >
              O'chirish
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
      meta: { width: 80, truncate: false },
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
        <Button
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
        </Button>
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
