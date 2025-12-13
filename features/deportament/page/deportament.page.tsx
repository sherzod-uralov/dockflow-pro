"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Group,
  Button,
  TextInput,
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
  IconPlus,
  IconSearch,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconCopy,
  IconUsers,
  IconTable,
  IconHierarchy,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useGetAllDeportaments,
  useDeleteDeportament,
  useUpdateDepartmentParent,
} from "../hook/deportament.hook";
import { DepartmentResponse } from "../type/deportament.type";
import { useDebounce } from "@/hooks/use-debaunce";
import DeportamentFormModal from "../component/deportament.form";
import DeportamentView from "../component/deportament.view";
import DepartmentGraphView from "../component/deportament-graph.view";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";

const DeportamentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modals
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  // State
  const [selectedDeportament, setSelectedDeportament] = useState<DepartmentResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<string | null>("table");

  // Query
  const { data, isLoading } = useGetAllDeportaments({
    search: debouncedSearch,
    pageSize,
    pageNumber: page,
  });

  const deleteMutation = useDeleteDeportament();
  const updateParentMutation = useUpdateDepartmentParent();

  // URL param uchun
  useEffect(() => {
    const deportamentId = searchParams.get("deportamentId");
    if (deportamentId && data?.data) {
      const deportament = data.data.find((d) => d.id === deportamentId);
      if (deportament) {
        setSelectedDeportament(deportament);
        viewModal.openModal();
      }
    }
  }, [searchParams, data]);

  // Handlers
  const handleView = (deportament: DepartmentResponse) => {
    setSelectedDeportament(deportament);
    viewModal.openModal();
    router.push(`?deportamentId=${deportament.id}`, { scroll: false });
  };

  const handleViewUsers = (deportament: DepartmentResponse) => {
    router.push(`/dashboard/department/${deportament.id}`);
  };

  const handleEdit = (deportament: DepartmentResponse) => {
    setSelectedDeportament(deportament);
    editModal.openModal();
  };

  const handleDeleteClick = (deportament: DepartmentResponse) => {
    setSelectedDeportament(deportament);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedDeportament) {
      deleteMutation.mutate(selectedDeportament.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedDeportament(null);
        },
      });
    }
  };

  const handleCloseView = () => {
    viewModal.closeModal();
    setSelectedDeportament(null);
    router.push(window.location.pathname, { scroll: false });
  };

  const handleEditClose = () => {
    editModal.closeModal();
    setSelectedDeportament(null);
  };

  const handleConnectDepartments = (targetId: string, parentId: string) => {
    console.log("handleConnectDepartments called from deportament.page.tsx", { targetId, parentId });
    updateParentMutation.mutate({ id: targetId, parentId });
  };

  const handleDisconnectDepartment = (id: string) => {
    updateParentMutation.mutate({ id, parentId: null });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Table columns
  const columns: DataTableColumn<DepartmentResponse>[] = [
    {
      accessorKey: "name",
      header: "Nomi",
      cell: ({ row }) => (
        <Group gap="sm" wrap="nowrap">
          <IconBuilding size={18} color="#1e3a5f" style={{ flexShrink: 0 }} />
          <Text size="sm" fw={500} c="#212529">
            {row.original.name}
          </Text>
        </Group>
      ),
      meta: { minWidth: 150 },
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
      accessorKey: "code",
      header: "Kod",
      cell: ({ row }) =>
        row.original.code ? (
          <Badge variant="light" color="blue" radius="sm">
            {row.original.code}
          </Badge>
        ) : (
          <Text size="sm" c="dimmed">—</Text>
        ),
      meta: { width: 100, truncate: false },
    },
    {
      accessorKey: "location",
      header: "Joylashuv",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.location || "—"}
        </Text>
      ),
      meta: { minWidth: 120 },
    },
    {
      accessorKey: "director",
      header: "Bo'lim boshlig'i",
      cell: ({ row }) =>
        row.original.director ? (
          <Group gap="sm" wrap="nowrap">
            <Avatar
              size="sm"
              radius="xl"
              src={row.original.director.avatarUrl}
              style={{ backgroundColor: "#e7f5ff", flexShrink: 0 }}
            >
              <Text size="xs" c="#1e3a5f" fw={500}>
                {getInitials(row.original.director.fullname)}
              </Text>
            </Avatar>
            <Text size="sm" c="#212529" lineClamp={1}>
              {row.original.director.fullname}
            </Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">—</Text>
        ),
      meta: { minWidth: 150 },
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
              leftSection={<IconUsers size={16} />}
              onClick={() => handleViewUsers(row.original)}
            >
              Foydalanuvchilarni ko'rish
            </Menu.Item>
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
          <IconBuilding size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
          Bo'lim topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi bo'lim qo'shish uchun yuqoridagi tugmani bosing
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
            Bo'limlar
          </Text>
          <Text size="sm" c="dimmed">
            Tashkilot bo'limlari ro'yxati
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
          Bo'lim qo'shish
        </Button>
      </Group>

      {/* Search */}
      <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: "#e9ecef" }}>
        <TextInput
          placeholder="Bo'limlarni qidirish..."
          leftSection={<IconSearch size={18} color="#868e96" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
        />
      </Paper>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} radius="sm">
        <Tabs.List mb="md">
          <Tabs.Tab value="table" leftSection={<IconTable size={18} />}>
            Jadval
          </Tabs.Tab>
          <Tabs.Tab value="graph" leftSection={<IconHierarchy size={18} />}>
            Ierarxiya
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
              emptyMessage="Bo'lim topilmadi"
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="graph">
          <DepartmentGraphView
            departments={data?.data || []}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleView}
            onConnectDepartments={handleConnectDepartments}
            onDisconnectDepartment={handleDisconnectDepartment}
            onViewUsers={(dept) => router.push(`/dashboard/department/${dept.id}`)}
          />
        </Tabs.Panel>
      </Tabs>

      {/* Create Modal */}
      <CustomModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Bo'lim qo'shish"
        description="Bo'lim qo'shish uchun maydonlarni to'ldiring"
        size="lg"
        closeOnOverlayClick={false}
      >
        <DeportamentFormModal
          mode="create"
          onClose={createModal.closeModal}
          onSuccess={createModal.closeModal}
        />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        title="Bo'limni tahrirlash"
        description="Bo'lim ma'lumotlarini o'zgartirishingiz mumkin"
        size="lg"
        closeOnOverlayClick={false}
      >
        <DeportamentFormModal
          mode="update"
          deportament={selectedDeportament}
          onClose={handleEditClose}
          onSuccess={handleEditClose}
        />
      </CustomModal>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseView}
        title="Bo'lim ma'lumotlari"
        description="Bo'lim haqida to'liq ma'lumot"
        size="lg"
      >
        {selectedDeportament && (
          <DeportamentView deportament={selectedDeportament} />
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        title="Bo'limni o'chirish"
        description={`"${selectedDeportament?.name}" bo'limini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />
    </Box>
  );
};

export default DeportamentPage;
