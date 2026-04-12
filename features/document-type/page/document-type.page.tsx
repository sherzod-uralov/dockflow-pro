"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Group,
  TextInput,
  Paper,
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
  IconSearch,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconFileText,
  IconCopy,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useDeleteDocumentType,
  useGetAllDocumentTypes,
} from "../hook/document-type.hook";
import { DocumentType } from "../type/document-type.type";
import DocumentTypeFormModal from "../component/document-type.form";
import DocumentTypeView from "../component/document-type.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { useOnboarding, TourButton } from "@/hooks/use-onboarding";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import { colors } from "@/lib/colors";

const DocumentTypePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Onboarding tour
  useOnboarding("document-type");

  // Modals
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  // State
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query
  const { data, isLoading } = useGetAllDocumentTypes({
    search: debouncedSearch || undefined,
    pageSize,
    pageNumber: page,
  });

  const deleteMutation = useDeleteDocumentType();

  // URL param uchun
  useEffect(() => {
    const documentTypeId = searchParams.get("documentTypeId");
    if (documentTypeId && data?.data) {
      const documentType = data.data.find((dt: DocumentType) => dt.id === documentTypeId);
      if (documentType) {
        setSelectedDocumentType(documentType);
        viewModal.openModal();
      }
    }
  }, [searchParams, data]);

  // Handlers
  const handleView = (documentType: DocumentType) => {
    setSelectedDocumentType(documentType);
    viewModal.openModal();
    router.push(`?documentTypeId=${documentType.id}`, { scroll: false });
  };

  const handleEdit = (documentType: DocumentType) => {
    setSelectedDocumentType(documentType);
    editModal.openModal();
  };

  const handleDeleteClick = (documentType: DocumentType) => {
    setSelectedDocumentType(documentType);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedDocumentType) {
      deleteMutation.mutate(selectedDocumentType.id as string, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedDocumentType(null);
        },
      });
    }
  };

  const handleCloseView = () => {
    viewModal.closeModal();
    setSelectedDocumentType(null);
    router.push(window.location.pathname, { scroll: false });
  };

  const handleEditClose = () => {
    editModal.closeModal();
    setSelectedDocumentType(null);
  };

  // Table columns
  const columns: DataTableColumn<DocumentType>[] = [
    {
      accessorKey: "name",
      header: "Nomi",
      cell: ({ row }) => (
        <Group gap="sm" wrap="nowrap">
          <IconFileText size={18} color={colors.primary} style={{ flexShrink: 0 }} />
          <Text size="sm" fw={500} c={colors.textPrimary}>
            {row.original.name}
          </Text>
        </Group>
      ),
      meta: { minWidth: 180 },
    },
    {
      accessorKey: "description",
      header: "Tavsif",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary} lineClamp={1}>
          {row.original.description || "—"}
        </Text>
      ),
      meta: { minWidth: 200 },
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
            <GuardedMenuItem
              permission="document-type:read"
              leftSection={<IconEye size={16} />}
              onClick={() => handleView(row.original)}
            >
              Ko'rish
            </GuardedMenuItem>
            <GuardedMenuItem
              permission="document-type:update"
              leftSection={<IconEdit size={16} />}
              onClick={() => handleEdit(row.original)}
            >
              Tahrirlash
            </GuardedMenuItem>
            <Menu.Item
              leftSection={<IconCopy size={16} />}
              onClick={() => handleCopyToClipboard(row.original.id || "", "ID")}
            >
              ID nusxalash
            </Menu.Item>
            <Menu.Divider />
            <GuardedMenuItem
              permission="document-type:delete"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => handleDeleteClick(row.original)}
            >
              O'chirish
            </GuardedMenuItem>
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
            backgroundColor: colors.bgSubtle,
            borderRadius: 12,
          }}
        >
          <IconFileText size={40} color={colors.textDimmed} stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c={colors.textSecondary}>
          Hujjat turi topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi hujjat turi qo'shish uchun yuqoridagi tugmani bosing
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
            Hujjat turlari
          </Text>
          <Text size="sm" c="dimmed">
            Hujjat turlarini boshqarish
          </Text>
        </Box>
        <Group gap="xs">
          <TourButton tourKey="document-type" variant="icon" size="md" />
          <GuardedButton
            permission="document-type:create"
            leftSection={<IconPlus size={18} />}
            onClick={createModal.openModal}
            radius="sm"
            data-tour="doctype-create"
            styles={{
              root: {
                backgroundColor: colors.primary,
                "&:hover": { backgroundColor: colors.primaryHover },
              },
            }}
          >
            Hujjat turini qo'shish
          </GuardedButton>
        </Group>
      </Group>

      {/* Search */}
      <Paper
        p="md"
        radius="sm"
        withBorder
        mb="md"
        style={{ borderColor: colors.border }}
        data-tour="doctype-search"
      >
        <TextInput
          placeholder="Hujjat turini qidirish..."
          leftSection={<IconSearch size={18} color={colors.textDimmed} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
        />
      </Paper>

      {/* Table */}
      <Box data-tour="doctype-list">
        {!isLoading && data?.data?.length === 0 ? (
          <Paper radius="sm" withBorder style={{ borderColor: colors.border }}>
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
            emptyMessage="Hujjat turi topilmadi"
          />
        )}
      </Box>

      {/* Create Modal */}
      <CustomModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Hujjat turini qo'shish"
        description="Hujjat turini qo'shish uchun maydonlarni to'ldiring"
        closeOnOverlayClick={false}
      >
        <DocumentTypeFormModal modal={createModal} mode="create" />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        title="Hujjat turini tahrirlash"
        description="Hujjat turi ma'lumotlarini o'zgartirishingiz mumkin"
        closeOnOverlayClick={false}
      >
        <DocumentTypeFormModal
          modal={editModal}
          mode="update"
          documentType={selectedDocumentType as any}
          onSuccess={handleEditClose}
        />
      </CustomModal>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseView}
        title="Hujjat turi ma'lumotlari"
        description="Hujjat turi haqida to'liq ma'lumot"
        size="lg"
      >
        <DocumentTypeView />
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        title="Hujjat turini o'chirish"
        description={`"${selectedDocumentType?.name}" hujjat turini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />
    </Box>
  );
};

export default DocumentTypePage;
