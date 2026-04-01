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
  IconSettings,
  IconCopy,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useGetAllTaskScoreConfigs,
  useDeleteTaskScoreConfig,
  TaskScoreConfigGetResponse,
} from "@/features/task-score-config";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import TaskScoreConfigForm from "../component/task-score-config.form";
import TaskScoreConfigView from "../component/task-score-config.view";

const TaskScoreConfigPage = () => {
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedConfig, setSelectedConfig] = useState<TaskScoreConfigGetResponse | null>(null);

  const { data, isLoading } = useGetAllTaskScoreConfigs();

  const deleteMutation = useDeleteTaskScoreConfig();

  const handleView = (config: TaskScoreConfigGetResponse) => {
    setSelectedConfig(config);
    viewModal.openModal();
  };

  const handleEdit = (config: TaskScoreConfigGetResponse) => {
    setSelectedConfig(config);
    editModal.openModal();
  };

  const handleDeleteClick = (config: TaskScoreConfigGetResponse) => {
    setSelectedConfig(config);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedConfig) {
      deleteMutation.mutate(selectedConfig.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedConfig(null);
        },
      });
    }
  };

  const handleEditClose = () => {
    editModal.closeModal();
    setSelectedConfig(null);
  };

  const handleViewClose = () => {
    viewModal.closeModal();
    setSelectedConfig(null);
  };

  const columns: DataTableColumn<TaskScoreConfigGetResponse>[] = [
    {
      accessorKey: "priorityLevel",
      header: "Daraja",
      cell: ({ row }) => (
        <Badge variant="light" color="blue" radius="sm" size="lg">
          {row.original.priorityLevel}
        </Badge>
      ),
      meta: { width: 80, truncate: false },
    },
    {
      accessorKey: "priorityCode",
      header: "Kod",
      cell: ({ row }) => (
        <Text size="sm" fw={600} c="#212529">
          {row.original.priorityCode}
        </Text>
      ),
      meta: { width: 80 },
    },
    {
      accessorKey: "baseScore",
      header: "Asosiy ball",
      cell: ({ row }) => (
        <Badge variant="light" color="green" radius="sm">
          {row.original.baseScore}
        </Badge>
      ),
      meta: { width: 100, truncate: false },
    },
    {
      accessorKey: "recommendedDays",
      header: "Tavsiya kunlar",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.recommendedDays} kun
        </Text>
      ),
      meta: { width: 120 },
    },
    {
      accessorKey: "penaltyPerDay",
      header: "Kunlik jarima",
      cell: ({ row }) => (
        <Badge variant="light" color="red" radius="sm">
          {row.original.penaltyPerDay}
        </Badge>
      ),
      meta: { width: 110, truncate: false },
    },
    {
      accessorKey: "maxPenaltyDays",
      header: "Maks. jarima kun",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.maxPenaltyDays ?? "—"}
        </Text>
      ),
      meta: { width: 130 },
    },
    {
      accessorKey: "description",
      header: "Tavsif",
      cell: ({ row }) => (
        <Text size="sm" c="#495057" lineClamp={1}>
          {row.original.description || "—"}
        </Text>
      ),
      meta: { minWidth: 150 },
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
          <IconSettings size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
          Ball konfiguratsiyasi topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi konfiguratsiya qo'shish uchun yuqoridagi tugmani bosing
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
            Ball konfiguratsiyasi
          </Text>
          <Text size="sm" c="dimmed">
            Vazifa ball hisoblash sozlamalari
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
          Konfiguratsiya qo'shish
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
          emptyMessage="Ball konfiguratsiyasi topilmadi"
        />
      )}

      {/* Create Modal */}
      <CustomModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Konfiguratsiya qo'shish"
        description="Yangi ball konfiguratsiyasi qo'shish uchun maydonlarni to'ldiring"
        size="lg"
        closeOnOverlayClick={false}
      >
        <TaskScoreConfigForm
          mode="create"
          onClose={createModal.closeModal}
          onSuccess={createModal.closeModal}
        />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        title="Konfiguratsiyani tahrirlash"
        description="Ball konfiguratsiyasi ma'lumotlarini o'zgartirishingiz mumkin"
        size="lg"
        closeOnOverlayClick={false}
      >
        <TaskScoreConfigForm
          mode="update"
          config={selectedConfig}
          onClose={handleEditClose}
          onSuccess={handleEditClose}
        />
      </CustomModal>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={handleViewClose}
        title="Konfiguratsiya ma'lumotlari"
        description="Ball konfiguratsiyasi haqida to'liq ma'lumot"
        size="lg"
      >
        {selectedConfig && <TaskScoreConfigView config={selectedConfig} />}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        title="Konfiguratsiyani o'chirish"
        description={`"${selectedConfig?.priorityCode}" konfiguratsiyasini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />
    </Box>
  );
};

export default TaskScoreConfigPage;
