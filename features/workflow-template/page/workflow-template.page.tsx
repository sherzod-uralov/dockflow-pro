"use client";

import { useState, useCallback, memo } from "react";
import {
  Box,
  Text,
  Paper,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Stack,
  ActionIcon,
  Menu,
  Pagination,
  Skeleton,
  Modal,
  SimpleGrid,
  Timeline,
  ThemeIcon,
  Avatar,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconX,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconEye,
  IconCopy,
  IconChevronRight,
  IconTemplate,
  IconInbox,
  IconUser,
  IconCircleCheck,
  IconFileSearch,
  IconSignature,
  IconQrcode,
} from "@tabler/icons-react";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { ModalState } from "@/types/modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";
import {
  useGetAllWorkflowTemplates,
  useDeleteWorkflowTemplate,
} from "../hook/workflow-template.hook";
import {
  WorkflowTemplateResponse,
  WORKFLOW_TEMPLATE_TYPE_OPTIONS,
} from "../type/workflow-template.type";
import WorkflowTemplateForm from "../component/workflow-template.form";
import { useGetAllDocumentTypes } from "@/features/document-type";
import {
  GuardedButton,
  GuardedMenuItem,
} from "@/components/shared/permission";

// Action type icons
const ACTION_ICONS: Record<string, any> = {
  APPROVAL: IconCircleCheck,
  REVIEW: IconFileSearch,
  SIGN: IconSignature,
  QR_CODE: IconQrcode,
  ACKNOWLEDGE: IconEye,
};
import { colors } from "@/lib/colors";

// Template item
const TemplateItem = memo(({
  template,
  onView,
  onEdit,
  onDelete,
  onCopy,
}: {
  template: WorkflowTemplateResponse;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) => {
  const typeLabel = WORKFLOW_TEMPLATE_TYPE_OPTIONS.find(o => o.value === template.type)?.label || template.type;

  return (
    <Paper
      p="md"
      radius="sm"
      withBorder
      style={{
        borderColor: colors.border,
        borderLeft: `3px solid ${template.isActive ? colors.infoDark : colors.textDimmed}`,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onClick={onView}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "white";
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="sm" mb={6} wrap="nowrap">
            <Text size="md" fw={600} c={colors.textPrimary} lineClamp={1}>
              {template.name}
            </Text>
            <Badge
              size="sm"
              variant="light"
              color={template.isActive ? "blue" : "gray"}
            >
              {template.isActive ? "Faol" : "Nofaol"}
            </Badge>
          </Group>

          <Group gap="lg" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              <IconTemplate size={14} color={colors.textDimmed} />
              <Text size="sm" c={colors.textSecondary}>{typeLabel}</Text>
            </Group>

            {template.documentType && (
              <Text size="sm" c={colors.textDimmed}>
                {template.documentType.name}
              </Text>
            )}

            <Badge size="sm" variant="light" color="gray">
              {template.steps?.length || 0} ta bosqich
            </Badge>

            {template.isPublic && (
              <Badge size="sm" variant="light" color="green">
                Ommaviy
              </Badge>
            )}
          </Group>
        </Box>

        <Group gap="xs" style={{ flexShrink: 0 }}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <IconEye size={18} />
          </ActionIcon>

          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <GuardedMenuItem
                permission="workflow-template:update"
                leftSection={<IconPencil size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Tahrirlash
              </GuardedMenuItem>
              <Menu.Item
                leftSection={<IconCopy size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
              >
                ID nusxalash
              </Menu.Item>
              <Menu.Divider />
              <GuardedMenuItem
                permission="workflow-template:delete"
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                O'chirish
              </GuardedMenuItem>
            </Menu.Dropdown>
          </Menu>

          <IconChevronRight size={18} color={colors.textDimmed} />
        </Group>
      </Group>
    </Paper>
  );
});

TemplateItem.displayName = "TemplateItem";

// Loading skeleton
const LoadingSkeleton = () => (
  <Stack gap="sm">
    {[1, 2, 3, 4, 5].map((i) => (
      <Paper key={i} p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
        <Group justify="space-between">
          <Box style={{ flex: 1 }}>
            <Skeleton height={20} width="50%" mb={8} />
            <Group gap="lg">
              <Skeleton height={14} width={80} />
              <Skeleton height={14} width={100} />
              <Skeleton height={14} width={60} />
            </Group>
          </Box>
          <Skeleton height={24} width={80} />
        </Group>
      </Paper>
    ))}
  </Stack>
);

// Empty state
const EmptyState = ({ onCreateNew }: { onCreateNew: () => void }) => (
  <Paper p="xl" radius="sm" withBorder style={{ borderColor: colors.border }}>
    <Stack align="center" gap="md" py="xl">
      <Box
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: colors.bgSubtle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconInbox size={40} color={colors.textMuted} stroke={1.5} />
      </Box>
      <Text size="lg" fw={600} c={colors.textSecondary}>
        Shablon topilmadi
      </Text>
      <Text size="sm" c="dimmed" ta="center" maw={400}>
        Hozircha hech qanday shablon mavjud emas
      </Text>
      <GuardedButton
        permission="workflow-template:create"
        size="md"
        radius="sm"
        leftSection={<IconPlus size={18} />}
        onClick={onCreateNew}
        style={{ backgroundColor: colors.primary }}
      >
        Shablon yaratish
      </GuardedButton>
    </Stack>
  </Paper>
);

const WorkflowTemplatePage = () => {
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const viewModal: ModalState = useModal();

  const { handlePageChange, pageNumber, pageSize } = usePagination();

  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateResponse | null>(null);
  const [search, debouncedSearch, setSearch] = useDebounce("", 500);
  const [documentTypeId, setDocumentTypeId] = useState<string | null>(null);

  const { data: documentTypesData } = useGetAllDocumentTypes();
  const { data, isLoading } = useGetAllWorkflowTemplates({
    search: debouncedSearch,
    pageSize,
    pageNumber,
    documentTypeId: documentTypeId || undefined,
  });
  const deleteMutation = useDeleteWorkflowTemplate();

  const totalPages = Math.ceil((data?.count || data?.total || 0) / pageSize);

  const handleView = useCallback((template: WorkflowTemplateResponse) => {
    setSelectedTemplate(template);
    viewModal.openModal();
  }, [viewModal]);

  const handleEdit = useCallback((template: WorkflowTemplateResponse) => {
    setSelectedTemplate(template);
    editModal.openModal();
  }, [editModal]);

  const handleDelete = useCallback((template: WorkflowTemplateResponse) => {
    setSelectedTemplate(template);
    deleteModal.openModal();
  }, [deleteModal]);

  const confirmDelete = useCallback(() => {
    if (selectedTemplate) {
      deleteMutation.mutate(selectedTemplate.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedTemplate(null);
        },
      });
    }
  }, [selectedTemplate, deleteMutation, deleteModal]);

  const documentTypeOptions = [
    { value: "", label: "Barcha turlar" },
    ...(documentTypesData?.data?.map((t: any) => ({
      value: t.id,
      label: t.name,
    })) || []),
  ];

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700} c={colors.textPrimary}>
            Aylanma shablonlari
          </Text>
          <Text size="sm" c="dimmed">
            Hujjat aylanmalari uchun shablonlarni boshqaring
          </Text>
        </Box>

        <GuardedButton
          permission="workflow-template:create"
          size="sm"
          radius="sm"
          leftSection={<IconPlus size={16} />}
          onClick={() => createModal.openModal()}
          style={{ backgroundColor: colors.primary }}
        >
          Shablon qo'shish
        </GuardedButton>
      </Group>

      {/* Filters */}
      <Paper p="md" radius="sm" mb="md" withBorder style={{ borderColor: colors.border }}>
        <Group gap="sm">
          <TextInput
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={16} color={colors.textDimmed} />}
            size="sm"
            radius="sm"
            w={280}
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                "&:focus": { borderColor: colors.primary },
              },
            }}
          />

          <Select
            placeholder="Hujjat turi"
            value={documentTypeId}
            onChange={setDocumentTypeId}
            data={documentTypeOptions}
            size="sm"
            radius="sm"
            w={200}
            clearable
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
              },
            }}
          />

          {documentTypeId && (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setDocumentTypeId(null)}
            >
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
      </Paper>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !data || data.data.length === 0 ? (
        <EmptyState onCreateNew={() => createModal.openModal()} />
      ) : (
        <>
          <Stack gap="sm" mb="lg">
            {data.data.map((template: WorkflowTemplateResponse) => (
              <TemplateItem
                key={template.id}
                template={template}
                onView={() => handleView(template)}
                onEdit={() => handleEdit(template)}
                onDelete={() => handleDelete(template)}
                onCopy={() => handleCopyToClipboard(template.id, "ID nusxalandi")}
              />
            ))}
          </Stack>

          {totalPages > 1 && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Jami: <Text span fw={600} c={colors.textPrimary}>{data.count || data.total}</Text> ta
              </Text>
              <Pagination
                value={pageNumber}
                onChange={handlePageChange}
                total={totalPages}
                size="sm"
                radius="sm"
                withEdges
                styles={{
                  control: {
                    borderColor: colors.border,
                    "&[data-active]": {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
            </Group>
          )}
        </>
      )}

      {/* Create Modal */}
      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Yangi shablon"
        description="Hujjat aylanmasi shablonini yarating"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <WorkflowTemplateForm modal={createModal} mode="create" />
      </CustomModal>

      {/* Edit Modal */}
      {selectedTemplate && (
        <CustomModal
          size="3xl"
          closeOnOverlayClick={false}
          title="Shablonni tahrirlash"
          description="Shablon ma'lumotlarini o'zgartiring"
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.closeModal();
            setSelectedTemplate(null);
          }}
        >
          <WorkflowTemplateForm
            modal={editModal}
            mode="update"
            workflowTemplate={selectedTemplate}
            onSuccess={() => setSelectedTemplate(null)}
          />
        </CustomModal>
      )}

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        title="O'chirishni tasdiqlang"
        description="Bu shablonni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi."
        variant="destructive"
      />

      {/* View Modal */}
      <Modal
        opened={viewModal.isOpen}
        onClose={() => {
          viewModal.closeModal();
          setSelectedTemplate(null);
        }}
        title={<Text fw={600} c={colors.textPrimary}>Shablon ma'lumotlari</Text>}
        size="lg"
        radius="sm"
        centered
      >
        {selectedTemplate && (
          <Stack gap="md">
            {/* Asosiy ma'lumotlar */}
            <SimpleGrid cols={2} spacing="md">
              <Box>
                <Text size="xs" c="dimmed">Nomi</Text>
                <Text size="sm" fw={500} c={colors.textPrimary}>{selectedTemplate.name}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Hujjat turi</Text>
                <Text size="sm" c={colors.textSecondary}>{selectedTemplate.documentType?.name || "—"}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Turi</Text>
                <Badge size="sm" variant="light" color="gray">
                  {WORKFLOW_TEMPLATE_TYPE_OPTIONS.find(o => o.value === selectedTemplate.type)?.label}
                </Badge>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Holati</Text>
                <Badge size="sm" color={selectedTemplate.isActive ? "blue" : "gray"}>
                  {selectedTemplate.isActive ? "Faol" : "Nofaol"}
                </Badge>
              </Box>
            </SimpleGrid>

            {selectedTemplate.description && (
              <Box>
                <Text size="xs" c="dimmed">Tavsif</Text>
                <Text size="sm" c={colors.textSecondary}>{selectedTemplate.description}</Text>
              </Box>
            )}

            {/* Bosqichlar */}
            {selectedTemplate.steps && selectedTemplate.steps.length > 0 && (
              <Box>
                <Text size="sm" fw={600} c={colors.textPrimary} mb="sm">
                  Bosqichlar ({selectedTemplate.steps.length} ta)
                </Text>
                <Timeline active={-1} bulletSize={28} lineWidth={2}>
                  {selectedTemplate.steps.map((step, index) => {
                    const ActionIcon = ACTION_ICONS[step.actionType] || IconCircleCheck;
                    return (
                      <Timeline.Item
                        key={step.id || index}
                        bullet={
                          <ThemeIcon size={28} radius="xl" color="gray" variant="light">
                            <ActionIcon size={14} />
                          </ThemeIcon>
                        }
                        title={
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Bosqich {index + 1}</Text>
                            <Badge size="xs" variant="light" color="gray">
                              {step.actionType}
                            </Badge>
                          </Group>
                        }
                      >
                        <Group gap="xs" mt={4}>
                          <Avatar size="xs" radius="xl" color="blue">
                            {step.assignedToUser?.fullname?.charAt(0) || "?"}
                          </Avatar>
                          <Text size="sm" c={colors.textSecondary}>
                            {step.assignedToUser?.fullname || "Tayinlanmagan"}
                          </Text>
                        </Group>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Box>
            )}

            <Group justify="flex-end" pt="md" style={{ borderTop: `1px solid ${colors.border}` }}>
              <Button
                variant="light"
                size="sm"
                radius="sm"
                color="gray"
                onClick={() => {
                  viewModal.closeModal();
                  setSelectedTemplate(null);
                }}
              >
                Yopish
              </Button>
              <GuardedButton
                permission="workflow-template:update"
                size="sm"
                radius="sm"
                leftSection={<IconPencil size={16} />}
                onClick={() => {
                  viewModal.closeModal();
                  handleEdit(selectedTemplate);
                }}
                style={{ backgroundColor: colors.primary }}
              >
                Tahrirlash
              </GuardedButton>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default WorkflowTemplatePage;
