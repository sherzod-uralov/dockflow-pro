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
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconFileText,
  IconBook,
  IconCopy,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useGetAllJournals,
  useDeleteJournal,
} from "@/features/journal/hook/journal.hook";
import { SingleJournalApiResponse } from "@/features/journal/type/journal.types";
import { useDebounce } from "@/hooks/use-debaunce";
import JournalForm from "../component/journal-form";
import JournalView from "../component/journal-view";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { useOnboarding, TourButton } from "@/hooks/use-onboarding";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";

const JournalPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Onboarding tour
  useOnboarding("journal");

  // Modals
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  // State
  const [selectedJournal, setSelectedJournal] = useState<SingleJournalApiResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query
  const { data, isLoading } = useGetAllJournals({
    search: debouncedSearch,
    pageSize,
    pageNumber: page,
  });

  const deleteMutation = useDeleteJournal();

  // URL param uchun
  useEffect(() => {
    const journalId = searchParams.get("journalId");
    if (journalId && data?.data) {
      const journal = data.data.find((j) => j.id === journalId);
      if (journal) {
        setSelectedJournal(journal);
        viewModal.openModal();
      }
    }
  }, [searchParams, data]);

  // Handlers
  const handleView = (journal: SingleJournalApiResponse) => {
    setSelectedJournal(journal);
    viewModal.openModal();
    router.push(`?journalId=${journal.id}`, { scroll: false });
  };

  const handleViewDocuments = (journal: SingleJournalApiResponse) => {
    router.push(`/dashboard/journal/${journal.id}`);
  };

  const handleEdit = (journal: SingleJournalApiResponse) => {
    setSelectedJournal(journal);
    editModal.openModal();
  };

  const handleDeleteClick = (journal: SingleJournalApiResponse) => {
    setSelectedJournal(journal);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedJournal) {
      deleteMutation.mutate(selectedJournal.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedJournal(null);
        },
      });
    }
  };

  const handleCloseView = () => {
    viewModal.closeModal();
    setSelectedJournal(null);
    router.push(window.location.pathname, { scroll: false });
  };

  const handleEditClose = () => {
    editModal.closeModal();
    setSelectedJournal(null);
  };

  // Table columns
  const columns: DataTableColumn<SingleJournalApiResponse>[] = [
    {
      accessorKey: "name",
      header: "Jurnal nomi",
      cell: ({ row }) => (
        <Group gap="sm" wrap="nowrap">
          <IconBook size={18} color="#1e3a5f" style={{ flexShrink: 0 }} />
          <Text size="sm" fw={500} c="#212529">
            {row.original.name}
          </Text>
        </Group>
      ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "prefix",
      header: "Prefiks",
      cell: ({ row }) => (
        <Badge variant="light" color="blue" radius="sm">
          {row.original.prefix}
        </Badge>
      ),
      meta: { width: 100, truncate: false },
    },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }) => (
        <Text size="sm" c="#495057" ff="monospace">
          {row.original.format}
        </Text>
      ),
      meta: { minWidth: 120 },
    },
    {
      accessorKey: "department",
      header: "Bo'lim",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.department?.name || "—"}
        </Text>
      ),
      meta: { minWidth: 120 },
    },
    {
      accessorKey: "responsibleUser",
      header: "Mas'ul",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.responsibleUser?.username || "—"}
        </Text>
      ),
      meta: { minWidth: 100 },
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
              leftSection={<IconFileText size={16} />}
              onClick={() => handleViewDocuments(row.original)}
            >
              Hujjatlarni ko'rish
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
          <IconBook size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
          Jurnal topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi jurnal qo'shish uchun yuqoridagi tugmani bosing
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
            Jurnallar
          </Text>
          <Text size="sm" c="dimmed">
            Hujjat jurnallari ro'yxati
          </Text>
        </Box>
        <Group gap="xs">
          <TourButton tourKey="journal" variant="icon" size="md" />
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={createModal.openModal}
            radius="sm"
            data-tour="journal-create"
            styles={{
              root: {
                backgroundColor: "#1e3a5f",
                "&:hover": { backgroundColor: "#162d4a" },
              },
            }}
          >
            Jurnal qo'shish
          </Button>
        </Group>
      </Group>

      {/* Search */}
      <Paper
        p="md"
        radius="sm"
        withBorder
        mb="md"
        style={{ borderColor: "#e9ecef" }}
        data-tour="journal-search"
      >
        <TextInput
          placeholder="Jurnallarni qidirish..."
          leftSection={<IconSearch size={18} color="#868e96" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
        />
      </Paper>

      {/* Table */}
      <Box data-tour="journal-list">
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
            emptyMessage="Jurnal topilmadi"
          />
        )}
      </Box>

      {/* Create Modal */}
      <CustomModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Yangi jurnal qo'shish"
        description="Jurnal qo'shish uchun maydonlarni to'ldiring"
        size="lg"
        closeOnOverlayClick={false}
      >
        <JournalForm
          mode="create"
          onClose={createModal.closeModal}
          onSuccess={createModal.closeModal}
        />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        title="Jurnalni tahrirlash"
        description="Jurnal ma'lumotlarini o'zgartirishingiz mumkin"
        size="lg"
        closeOnOverlayClick={false}
      >
        <JournalForm
          mode="edit"
          journal={selectedJournal}
          onClose={handleEditClose}
          onSuccess={handleEditClose}
        />
      </CustomModal>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseView}
        title="Jurnal ma'lumotlari"
        description="Jurnalning to'liq ma'lumotlarini ko'rish"
        size="lg"
      >
        {selectedJournal && (
          <JournalView journal={selectedJournal} />
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        title="Jurnalni o'chirish"
        description={`"${selectedJournal?.name}" jurnalini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />
    </Box>
  );
};

export default JournalPage;
