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

// Action type icons
const ACTION_ICONS: Record<string, any> = {
  APPROVAL: IconCircleCheck,
  REVIEW: IconFileSearch,
  SIGN: IconSignature,
  QR_CODE: IconQrcode,
  ACKNOWLEDGE: IconEye,
};

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
        borderColor: "#e9ecef",
        borderLeft: `3px solid ${template.isActive ? "#1971c2" : "#868e96"}`,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onClick={onView}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f8f9fa";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "white";
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="sm" mb={6} wrap="nowrap">
            <Text size="md" fw={600} c="#212529" lineClamp={1}>
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
              <IconTemplate size={14} color="#868e96" />
              <Text size="sm" c="#495057">{typeLabel}</Text>
            </Group>

            {template.documentType && (
              <Text size="sm" c="#868e96">
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
              <Menu.Item
                leftSection={<IconPencil size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Tahrirlash
              </Menu.Item>
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
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                O'chirish
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <IconChevronRight size={18} color="#868e96" />
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
      <Paper key={i} p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
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
  <Paper p="xl" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
    <Stack align="center" gap="md" py="xl">
      <Box
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: "#f1f3f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconInbox size={40} color="#adb5bd" stroke={1.5} />
      </Box>
      <Text size="lg" fw={600} c="#495057">
        Shablon topilmadi
      </Text>
      <Text size="sm" c="dimmed" ta="center" maw={400}>
        Hozircha hech qanday shablon mavjud emas
      </Text>
      <Button
        size="md"
        radius="sm"
        leftSection={<IconPlus size={18} />}
        onClick={onCreateNew}
        style={{ backgroundColor: "#1e3a5f" }}
      >
        Shablon yaratish
      </Button>
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
          <Text size="xl" fw={700} c="#212529">
            Aylanma shablonlari
          </Text>
          <Text size="sm" c="dimmed">
            Hujjat aylanmalari uchun shablonlarni boshqaring
          </Text>
        </Box>

        <Button
          size="sm"
          radius="sm"
          leftSection={<IconPlus size={16} />}
          onClick={() => createModal.openModal()}
          style={{ backgroundColor: "#1e3a5f" }}
        >
          Shablon qo'shish
        </Button>
      </Group>

      {/* Filters */}
      <Paper p="md" radius="sm" mb="md" withBorder style={{ borderColor: "#e9ecef" }}>
        <Group gap="sm">
          <TextInput
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={16} color="#868e96" />}
            size="sm"
            radius="sm"
            w={280}
            styles={{
              input: {
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                "&:focus": { borderColor: "#1e3a5f" },
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
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
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
                Jami: <Text span fw={600} c="#212529">{data.count || data.total}</Text> ta
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
                    borderColor: "#e9ecef",
                    "&[data-active]": {
                      backgroundColor: "#1e3a5f",
                      borderColor: "#1e3a5f",
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
        title={<Text fw={600} c="#212529">Shablon ma'lumotlari</Text>}
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
                <Text size="sm" fw={500} c="#212529">{selectedTemplate.name}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Hujjat turi</Text>
                <Text size="sm" c="#495057">{selectedTemplate.documentType?.name || "—"}</Text>
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
                <Text size="sm" c="#495057">{selectedTemplate.description}</Text>
              </Box>
            )}

            {/* Bosqichlar */}
            {selectedTemplate.steps && selectedTemplate.steps.length > 0 && (
              <Box>
                <Text size="sm" fw={600} c="#212529" mb="sm">
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
                          <Text size="sm" c="#495057">
                            {step.assignedToUser?.fullname || "Tayinlanmagan"}
                          </Text>
                        </Group>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Box>
            )}

            <Group justify="flex-end" pt="md" style={{ borderTop: "1px solid #e9ecef" }}>
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
              <Button
                size="sm"
                radius="sm"
                leftSection={<IconPencil size={16} />}
                onClick={() => {
                  viewModal.closeModal();
                  handleEdit(selectedTemplate);
                }}
                style={{ backgroundColor: "#1e3a5f" }}
              >
                Tahrirlash
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default WorkflowTemplatePage;
