"use client";

import { useState } from "react";
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
  IconTemplate,
} from "@tabler/icons-react";
import {
  useGetAllDocumentTemplates,
  useDeleteDocumentTemplate,
  DocumentTemplateResponse,
} from "@/features/document-template";
import { useDebounce } from "@/hooks/use-debaunce";
import DocumentTemplateFormModal from "../component/document-template.form";
import DocumentTemplateView from "../component/document-template.view";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import { CustomModal, ConfirmationModal, useModal } from "@/components/shared/ui/custom-modal";
import { colors } from "@/lib/colors";

const DocumentTemplatePage = () => {
  // Modals
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  // State
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query
  const { data, isLoading } = useGetAllDocumentTemplates({
    search: debouncedSearch,
    pageSize,
    pageNumber: page,
  });

  const deleteMutation = useDeleteDocumentTemplate();

  // Handlers
  const handleView = (template: DocumentTemplateResponse) => {
    setSelectedTemplate(template);
    viewModal.openModal();
  };

  const handleEdit = (template: DocumentTemplateResponse) => {
    setSelectedTemplate(template);
    editModal.openModal();
  };

  const handleDeleteClick = (template: DocumentTemplateResponse) => {
    setSelectedTemplate(template);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedTemplate) {
      deleteMutation.mutate(selectedTemplate.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedTemplate(null);
        },
      });
    }
  };

  const handleEditClose = () => {
    editModal.closeModal();
    setSelectedTemplate(null);
  };

  // Table columns
  const columns: DataTableColumn<DocumentTemplateResponse>[] = [
    {
      accessorKey: "name",
      header: "Nomi",
      cell: ({ row }) => (
        <Box>
          <Text size="sm" fw={500} c={colors.textPrimary} lineClamp={1}>
            {row.original.name}
          </Text>
          {row.original.description && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {row.original.description}
            </Text>
          )}
        </Box>
      ),
      meta: { minWidth: 200 },
    },
    {
      accessorKey: "documentType",
      header: "Hujjat turi",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary}>
          {row.original.documentType?.name || "—"}
        </Text>
      ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "templateFile",
      header: "Fayl",
      cell: ({ row }) =>
        row.original.templateFile ? (
          <Group gap="xs" wrap="nowrap">
            <IconFileText size={16} color={colors.textDimmed} style={{ flexShrink: 0 }} />
            <Text size="sm" c={colors.textSecondary} lineClamp={1}>
              {row.original.templateFile.fileName}
            </Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            Fayl yo'q
          </Text>
        ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "isActive",
      header: "Holati",
      cell: ({ row }) => (
        <Badge
          variant="light"
          color={row.original.isActive ? "green" : "gray"}
          radius="sm"
        >
          {row.original.isActive ? "Faol" : "Nofaol"}
        </Badge>
      ),
      meta: { width: 100, truncate: false },
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => (
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="sm">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <GuardedMenuItem
              permission="document-template:read"
              leftSection={<IconEye size={16} />}
              onClick={() => handleView(row.original)}
            >
              Ko'rish
            </GuardedMenuItem>
            <GuardedMenuItem
              permission="document-template:update"
              leftSection={<IconEdit size={16} />}
              onClick={() => handleEdit(row.original)}
            >
              Tahrirlash
            </GuardedMenuItem>
            <Menu.Divider />
            <GuardedMenuItem
              permission="document-template:delete"
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
          <IconTemplate size={40} color={colors.textDimmed} stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c={colors.textSecondary}>
          Shablon topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi shablon qo'shish uchun yuqoridagi tugmani bosing
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
            Hujjat shablonlari
          </Text>
          <Text size="sm" c="dimmed">
            Hujjatlar uchun tayyor shablonlar
          </Text>
        </Box>
        <GuardedButton
          permission="document-template:create"
          leftSection={<IconPlus size={18} />}
          onClick={createModal.openModal}
          radius="sm"
          styles={{
            root: {
              backgroundColor: colors.primary,
              "&:hover": { backgroundColor: colors.primaryHover },
            },
          }}
        >
          Shablon qo'shish
        </GuardedButton>
      </Group>

      {/* Search */}
      <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: colors.border }}>
        <TextInput
          placeholder="Shablonlarni qidirish..."
          leftSection={<IconSearch size={18} color={colors.textDimmed} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
          styles={{
            input: {
              fontSize: 15,
            },
          }}
        />
      </Paper>

      {/* Table */}
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
          emptyMessage="Shablon topilmadi"
        />
      )}

      {/* Create Modal */}
      <CustomModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Yangi shablon qo'shish"
        size="lg"
        closeOnOverlayClick={false}
      >
        <DocumentTemplateFormModal
          mode="create"
          onClose={createModal.closeModal}
          onSuccess={createModal.closeModal}
        />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        title="Shablonni tahrirlash"
        size="lg"
        closeOnOverlayClick={false}
      >
        <DocumentTemplateFormModal
          mode="update"
          documentTemplate={selectedTemplate}
          onClose={handleEditClose}
          onSuccess={handleEditClose}
        />
      </CustomModal>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title="Shablon ma'lumotlari"
        size="lg"
      >
        {selectedTemplate && (
          <DocumentTemplateView template={selectedTemplate} />
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        title="Shablonni o'chirish"
        description={`"${selectedTemplate?.name}" shablonini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />
    </Box>
  );
};

export default DocumentTemplatePage;
