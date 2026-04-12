"use client";

import React, { useCallback, memo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUrlFilter } from "@/hooks/use-url-filters";
import {
  GuardedButton,
  GuardedMenuItem,
} from "@/components/shared/permission";
import {
  Box,
  Text,
  Button,
  TextInput,
  Select,
  Group,
  Paper,
  Skeleton,
  Stack,
  Badge,
  ActionIcon,
  Tabs,
  Pagination,
  Progress,
  Tooltip,
  Menu,
  Collapse,
  SimpleGrid,
  Checkbox,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconPlus,
  IconSearch,
  IconTemplate,
  IconInbox,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconEye,
  IconFileText,
  IconUser,
  IconClock,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconPlayerPlay,
  IconHourglass,
  IconFilter,
  IconFilterOff,

} from "@tabler/icons-react";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { usePagination } from "@/hooks/use-pagination";
import { ModalState } from "@/types/modal";
import {
  WorkflowApiResponse,
  WorkflowStatus,
  WorkflowType,
} from "@/features/workflow/type/workflow.type";
import {
  useDeleteWorkflow,
  useGetAllWorkflows,
} from "@/features/workflow/hook/workflow.hook";
import WorkflowForm from "@/features/workflow/component/workflow.form";
import WorkflowFromTemplateForm from "@/features/workflow/component/workflow-from-template.form";
import { formatDate } from "@/lib/date-utils";
import { useGetAllDocuments } from "@/features/document";
import { useGetAllDocumentTypes } from "@/features/document-type/hook/document-type.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useOnboarding, TourButton } from "@/hooks/use-onboarding";
import { ACTION_TYPE_OPTIONS } from "@/features/workflow/type/workflow.type";
import { colors, WORKFLOW_STATUS, getStatusConfig } from "@/lib/colors";

const STATUS_ICONS: Record<string, any> = {
  ACTIVE: IconPlayerPlay,
  COMPLETED: IconCircleCheck,
  CANCELLED: IconCircleX,
  DRAFT: IconHourglass,
};

const TYPE_OPTIONS = [
  { value: "CONSECUTIVE", label: "Ketma-ket" },
  { value: "PARALLEL", label: "Parallel" },
];

const WorkflowItem = memo(({
  workflow,
  onView,
  onEdit,
  onDelete,
}: {
  workflow: WorkflowApiResponse;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const status = getStatusConfig(WORKFLOW_STATUS, workflow.status);
  const StatusIcon = STATUS_ICONS[workflow.status] || IconHourglass;

  const totalSteps = workflow.workflowSteps?.length || 0;
  const completedSteps = workflow.workflowSteps?.filter(s => s.status === "COMPLETED").length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const currentStep = workflow.workflowSteps?.find(
    step => step.order === workflow.currentStepOrder
  );

  return (
    <Paper
      p="md"
      radius="sm"
      withBorder
      style={{
        borderColor: colors.border,
        borderLeft: `3px solid ${status.color}`,
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
        {/* Asosiy ma'lumot */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="sm" mb={8} wrap="nowrap">
            <Text size="md" fw={600} c={colors.textPrimary} lineClamp={1}>
              {workflow.document?.title || "Nomsiz hujjat"}
            </Text>
            <Badge
              size="sm"
              variant="light"
              leftSection={<StatusIcon size={12} />}
              style={{ backgroundColor: status.bg, color: status.color, flexShrink: 0 }}
            >
              {status.label}
            </Badge>
          </Group>

          <Group gap="lg" wrap="nowrap">
            {/* Hujjat raqami */}
            <Group gap={6} wrap="nowrap">
              <IconFileText size={14} color={colors.textDimmed} />
              <Text size="sm" c={colors.textSecondary} style={{ fontFamily: "monospace" }}>
                {workflow.document?.documentNumber || "—"}
              </Text>
            </Group>

            {/* Joriy bosqich */}
            <Group gap={6} wrap="nowrap">
              <IconUser size={14} color={colors.textDimmed} />
              <Text size="sm" c={colors.textSecondary} lineClamp={1}>
                {currentStep?.assignedToUser?.fullname || "Tayinlanmagan"}
              </Text>
            </Group>

            {/* Sana */}
            <Group gap={6} wrap="nowrap">
              <IconClock size={14} color={colors.textDimmed} />
              <Text size="sm" c={colors.textDimmed}>
                {formatDate(workflow.createdAt)}
              </Text>
            </Group>

            {/* Deadline */}
            {workflow.deadline && (
              <Group gap={6} wrap="nowrap">
                <IconClock size={14} color={new Date(workflow.deadline) < new Date() && workflow.status !== 'COMPLETED' ? "red" : colors.textDimmed} />
                <Text size="sm" c={new Date(workflow.deadline) < new Date() && workflow.status !== 'COMPLETED' ? "red" : colors.textDimmed}>
                  {formatDate(workflow.deadline)}
                </Text>
              </Group>
            )}
          </Group>
        </Box>

        {/* Progress */}
        <Box w={120} style={{ flexShrink: 0 }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c={colors.textDimmed}>Jarayon</Text>
            <Text size="xs" fw={500} c={colors.textSecondary}>{completedSteps}/{totalSteps}</Text>
          </Group>
          <Progress
            value={progress}
            size="sm"
            radius="xl"
            color={workflow.status === "COMPLETED" ? "green" : "blue"}
          />
        </Box>

        {/* Amallar */}
        <Group gap="xs" style={{ flexShrink: 0 }}>
          <Tooltip label="Ko'rish" position="top">
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
          </Tooltip>

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
                permission="workflow:update"
                leftSection={<IconPencil size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Tahrirlash
              </GuardedMenuItem>
              <GuardedMenuItem
                permission="workflow:delete"
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

WorkflowItem.displayName = "WorkflowItem";

// Loading skeleton
const LoadingSkeleton = () => (
  <Stack gap="sm">
    {[1, 2, 3, 4, 5].map((i) => (
      <Paper key={i} p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
        <Group justify="space-between">
          <Box style={{ flex: 1 }}>
            <Skeleton height={20} width="60%" mb={8} />
            <Group gap="lg">
              <Skeleton height={14} width={100} />
              <Skeleton height={14} width={120} />
              <Skeleton height={14} width={80} />
            </Group>
          </Box>
          <Skeleton height={24} width={120} />
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
        Hujjat aylanmasi topilmadi
      </Text>
      <Text size="sm" c="dimmed" ta="center" maw={400}>
        Hozircha hech qanday hujjat aylanmasi mavjud emas
      </Text>
      <Button
        size="md"
        radius="sm"
        leftSection={<IconPlus size={18} />}
        onClick={onCreateNew}
        style={{ backgroundColor: colors.primary }}
      >
        Yangi aylanma yaratish
      </Button>
    </Stack>
  </Paper>
);

const WorkflowPage = () => {
  const router = useRouter();

  useOnboarding("workflow");

  const createModal: ModalState = useModal();
  const templateModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();

  const { pageNumber, pageSize, handlePageChange } = usePagination();

  const [selectedWorkflow, setSelectedWorkflow] =
    React.useState<WorkflowApiResponse | null>(null);

  const [search, debouncedSearch, setSearch] = useDebounce("", 500);
  const [activeStatus, setActiveStatus] = useUrlFilter("status");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states (URL-persisted)
  const [documentFilter, setDocumentFilter] = useUrlFilter("document");
  const [typeFilter, setTypeFilter] = useUrlFilter("type");
  const [documentTypeFilter, setDocumentTypeFilter] = useUrlFilter("documentTypeId");
  const [assigneeFilter, setAssigneeFilter] = useUrlFilter("assignee");
  const [creatorFilter, setCreatorFilter] = useUrlFilter("creator");
  const [stepActionFilter, setStepActionFilter] = useUrlFilter("stepAction");
  const [dateFrom, setDateFrom] = useUrlFilter("dateFrom");
  const [dateTo, setDateTo] = useUrlFilter("dateTo");
  const [overdueFilter, setOverdueFilter] = useUrlFilter("overdue");
  const [sortBy, setSortBy] = useUrlFilter("sortBy");
  const [sortOrder, setSortOrder] = useUrlFilter("sortOrder");

  const { data: documentsData } = useGetAllDocuments({
    pageNumber: 1,
    pageSize: 100,
  });

  const { data: documentTypesData } = useGetAllDocumentTypes({
    pageNumber: 1,
    pageSize: 100,
  });

  const { data: usersData } = useGetUserQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const { data: activeWorkflowsCheck } = useGetAllWorkflows({
    status: WorkflowStatus.ACTIVE,
    page: 1,
    limit: 1,
  });

  // Set default tab based on active workflows
  useEffect(() => {
    if (!activeStatus && activeWorkflowsCheck !== undefined) {
      if (activeWorkflowsCheck.count > 0) {
        setActiveStatus(WorkflowStatus.ACTIVE);
      } else {
        setActiveStatus("all");
      }
    }
  }, [activeWorkflowsCheck, activeStatus, setActiveStatus]);

  const { data, isLoading } = useGetAllWorkflows({
    search: debouncedSearch || undefined,
    documentId: documentFilter || undefined,
    status: activeStatus && activeStatus !== "all" ? (activeStatus as WorkflowStatus) : undefined,
    type: typeFilter || undefined,
    documentTypeId: documentTypeFilter || undefined,
    assignedToUserId: assigneeFilter || undefined,
    createdById: creatorFilter || undefined,
    stepActionType: stepActionFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    overdue: overdueFilter === "true" ? true : undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
    page: pageNumber,
    limit: pageSize,
  });

  const deleteMutation = useDeleteWorkflow();

  const confirmDelete = useCallback(() => {
    if (selectedWorkflow) {
      deleteMutation.mutate(selectedWorkflow.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedWorkflow(null);
        },
      });
    }
  }, [selectedWorkflow, deleteMutation, deleteModal]);

  const handleView = useCallback((workflow: WorkflowApiResponse) => {
    router.push(`/dashboard/workflow/${workflow.id}`);
  }, [router]);

  const handleEdit = useCallback((workflow: WorkflowApiResponse) => {
    setSelectedWorkflow(workflow);
    editModal.openModal();
  }, [editModal]);

  const handleDelete = useCallback((workflow: WorkflowApiResponse) => {
    setSelectedWorkflow(workflow);
    deleteModal.openModal();
  }, [deleteModal]);

  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  // Active filter count
  const activeFilterCount = [
    documentFilter, typeFilter, documentTypeFilter, assigneeFilter,
    creatorFilter, stepActionFilter, dateFrom, dateTo, overdueFilter, sortBy,
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setDocumentFilter("");
    setTypeFilter("");
    setDocumentTypeFilter("");
    setAssigneeFilter("");
    setCreatorFilter("");
    setStepActionFilter("");
    setDateFrom("");
    setDateTo("");
    setOverdueFilter("");
    setSortBy("");
    setSortOrder("");
  };

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700} c={colors.textPrimary}>
            Hujjat aylanmalari
          </Text>
          <Text size="sm" c="dimmed">
            Barcha hujjat aylanmalarini boshqaring
          </Text>
        </Box>

        <Group gap="sm">
          <TourButton tourKey="workflow" variant="icon" size="md" />
          <GuardedButton
            permission="workflow:create"
            variant="outline"
            size="sm"
            radius="sm"
            leftSection={<IconTemplate size={16} />}
            onClick={() => templateModal.openModal()}
            data-tour="workflow-template"
            styles={{
              root: {
                borderColor: colors.borderLight,
                color: colors.textSecondary,
                "&:hover": {
                  backgroundColor: colors.bg,
                },
              },
            }}
          >
            Shablondan
          </GuardedButton>
          <GuardedButton
            permission="workflow:create"
            size="sm"
            radius="sm"
            leftSection={<IconPlus size={16} />}
            onClick={() => createModal.openModal()}
            style={{ backgroundColor: colors.primary }}
            data-tour="workflow-create"
          >
            Yangi aylanma
          </GuardedButton>
        </Group>
      </Group>

      {/* Filters */}
      <Paper p="md" radius="sm" mb="md" withBorder style={{ borderColor: colors.border }}>
        <Group justify="space-between" mb={filtersOpen ? "sm" : 0}>
          <Group gap="sm">
            <TextInput
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={16} color={colors.textDimmed} />}
              size="sm"
              radius="sm"
              w={250}
              data-tour="workflow-search"
              styles={{
                input: {
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  "&:focus": {
                    borderColor: colors.primary,
                  },
                },
              }}
            />
            <ActionIcon
              variant={filtersOpen ? "filled" : "light"}
              size="lg"
              radius="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              data-tour="workflow-filter"
              style={{
                backgroundColor: filtersOpen ? colors.primary : colors.bgSubtle,
                color: filtersOpen ? colors.white : colors.textSecondary,
                position: "relative",
              }}
            >
              {activeFilterCount > 0 && (
                <Badge
                  size="xs"
                  circle
                  color="red"
                  style={{ position: "absolute", top: -4, right: -4 }}
                >
                  {activeFilterCount}
                </Badge>
              )}
              <IconFilter size={18} />
            </ActionIcon>
          </Group>

          <Tabs
            value={activeStatus || "all"}
            onChange={(value) => {
              setActiveStatus(value || "all");
              handlePageChange(1);
            }}
            variant="pills"
            radius="sm"
            data-tour="workflow-tabs"
          >
            <Tabs.List>
              <Tabs.Tab value="all" style={{ fontWeight: 500 }}>
                Barchasi
              </Tabs.Tab>
              <Tabs.Tab
                value={WorkflowStatus.ACTIVE}
                leftSection={<IconPlayerPlay size={14} />}
                style={{ fontWeight: 500 }}
              >
                Faol
              </Tabs.Tab>
              <Tabs.Tab
                value={WorkflowStatus.COMPLETED}
                leftSection={<IconCircleCheck size={14} />}
                style={{ fontWeight: 500 }}
              >
                Tugallangan
              </Tabs.Tab>
              <Tabs.Tab
                value={WorkflowStatus.CANCELLED}
                leftSection={<IconCircleX size={14} />}
                style={{ fontWeight: 500 }}
              >
                Bekor qilingan
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Group>

        {/* Expanded Filters */}
        <Collapse in={filtersOpen}>
          <Box
            mt="sm"
            p="sm"
            style={{
              backgroundColor: colors.bg,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
            }}
          >
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={600} c={colors.textSecondary} tt="uppercase">
                Qo'shimcha filterlar
              </Text>
              {activeFilterCount > 0 && (
                <Button
                  variant="subtle"
                  size="compact-xs"
                  color="red"
                  leftSection={<IconFilterOff size={12} />}
                  onClick={clearAllFilters}
                >
                  Tozalash ({activeFilterCount})
                </Button>
              )}
            </Group>
            <SimpleGrid cols={3} spacing="sm">
              <Select
                size="sm"
                radius="sm"
                placeholder="Hujjat bo'yicha"
                label="Hujjat"
                clearable
                searchable
                value={documentFilter || null}
                onChange={(val) => setDocumentFilter(val || "")}
                data={
                  documentsData?.data?.map((doc) => ({
                    value: doc.id || "",
                    label: `${doc.documentNumber} - ${doc.title}`,
                  })) || []
                }
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
              <Select
                size="sm"
                radius="sm"
                placeholder="Turi bo'yicha"
                label="Aylanma turi"
                clearable
                value={typeFilter || null}
                onChange={(val) => setTypeFilter(val || "")}
                data={TYPE_OPTIONS}
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
              <Select
                size="sm"
                radius="sm"
                placeholder="Hujjat turi bo'yicha"
                label="Hujjat turi"
                clearable
                searchable
                value={documentTypeFilter || null}
                onChange={(val) => setDocumentTypeFilter(val || "")}
                data={
                  documentTypesData?.data?.map((dt: any) => ({
                    value: dt.id,
                    label: dt.name,
                  })) || []
                }
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
              <Select
                size="sm"
                radius="sm"
                placeholder="Tayinlangan shaxs"
                label="Tayinlangan"
                clearable
                searchable
                value={assigneeFilter || null}
                onChange={(val) => setAssigneeFilter(val || "")}
                data={
                  usersData?.data?.map((user: any) => ({
                    value: user.id,
                    label: `${user.fullname} (@${user.username})`,
                  })) || []
                }
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
              <Select
                size="sm"
                radius="sm"
                placeholder="Yaratuvchi"
                label="Yaratuvchi"
                clearable
                searchable
                value={creatorFilter || null}
                onChange={(val) => setCreatorFilter(val || "")}
                data={
                  usersData?.data?.map((user: any) => ({
                    value: user.id,
                    label: `${user.fullname} (@${user.username})`,
                  })) || []
                }
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
              <Select
                size="sm"
                radius="sm"
                placeholder="Amal turi"
                label="Bosqich amal turi"
                clearable
                value={stepActionFilter || null}
                onChange={(val) => setStepActionFilter(val || "")}
                data={ACTION_TYPE_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
              <DatePickerInput
                size="sm"
                radius="sm"
                label="Boshlanish sanasi"
                placeholder="Dan"
                clearable
                value={dateFrom ? new Date(dateFrom) : null}
                onChange={(val) => setDateFrom(val ? new Date(val as unknown as Date).toISOString().split("T")[0] : "")}
                maxDate={dateTo ? new Date(dateTo) : undefined}
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
              <DatePickerInput
                size="sm"
                radius="sm"
                label="Tugash sanasi"
                placeholder="Gacha"
                clearable
                value={dateTo ? new Date(dateTo) : null}
                onChange={(val) => setDateTo(val ? new Date(val as unknown as Date).toISOString().split("T")[0] : "")}
                minDate={dateFrom ? new Date(dateFrom) : undefined}
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
              <Select
                size="sm"
                radius="sm"
                placeholder="Saralash"
                label="Saralash"
                clearable
                value={sortBy || null}
                onChange={(val) => {
                  setSortBy(val || "");
                  if (!val) setSortOrder("");
                  else if (!sortOrder) setSortOrder("desc");
                }}
                data={[
                  { value: "createdAt", label: "Yaratilgan sana" },
                  { value: "updatedAt", label: "Yangilangan sana" },
                  { value: "deadline", label: "Muddat" },
                  { value: "status", label: "Status" },
                ]}
                styles={{
                  label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                  input: { backgroundColor: "#fff" },
                }}
              />
            </SimpleGrid>
            <Group mt="sm" gap="md">
              <Checkbox
                size="sm"
                label="Muddati o'tganlar"
                checked={overdueFilter === "true"}
                onChange={(e) => setOverdueFilter(e.currentTarget.checked ? "true" : "")}
                styles={{
                  label: { fontSize: 12, fontWeight: 500, color: colors.textSecondary },
                }}
              />
              {sortBy && (
                <Select
                  size="sm"
                  radius="sm"
                  label="Tartib"
                  value={sortOrder || "desc"}
                  onChange={(val) => setSortOrder(val || "desc")}
                  data={[
                    { value: "desc", label: "Kamayish" },
                    { value: "asc", label: "O'sish" },
                  ]}
                  styles={{
                    label: { fontSize: 12, fontWeight: 500, marginBottom: 4 },
                    input: { backgroundColor: "#fff" },
                  }}
                  w={150}
                />
              )}
            </Group>
          </Box>
        </Collapse>
      </Paper>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !data || data.data.length === 0 ? (
        <EmptyState onCreateNew={() => createModal.openModal()} />
      ) : (
        <>
          <Stack gap="sm" mb="lg" data-tour="workflow-list">
            {data.data.map((workflow) => (
              <WorkflowItem
                key={workflow.id}
                workflow={workflow}
                onView={() => handleView(workflow)}
                onEdit={() => handleEdit(workflow)}
                onDelete={() => handleDelete(workflow)}
              />
            ))}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Jami: <Text span fw={600} c={colors.textPrimary}>{data.count}</Text> ta
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

      {/* Modals */}
      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Yangi hujjat aylanmasi"
        description="Hujjat uchun aylanma yarating"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <WorkflowForm modal={createModal} mode="create" />
      </CustomModal>

      <CustomModal
        size="lg"
        closeOnOverlayClick={false}
        title="Shablondan yaratish"
        description="Hujjat va shablonni tanlang"
        isOpen={templateModal.isOpen}
        onClose={templateModal.closeModal}
      >
        <WorkflowFromTemplateForm modal={templateModal} />
      </CustomModal>

      {selectedWorkflow && (
        <CustomModal
          size="3xl"
          closeOnOverlayClick={false}
          title="Aylanmani tahrirlash"
          description="Aylanma ma'lumotlarini o'zgartiring"
          isOpen={editModal.isOpen}
          onClose={editModal.closeModal}
        >
          <WorkflowForm
            modal={editModal}
            mode="edit"
            workflow={selectedWorkflow}
          />
        </CustomModal>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        title="O'chirishni tasdiqlang"
        description="Bu aylanmani o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi."
        variant="destructive"
      />
    </Box>
  );
};

export default WorkflowPage;
