"use client";

import {
  Box,
  Tabs,
  TextInput,
  Button,
  Text,
  Group,
  Badge,
  Paper,
  ScrollArea,
  ActionIcon,
  Skeleton,
  Stack,
  Select,
  Collapse,
  SimpleGrid,
} from "@mantine/core";
import {
  IconSearch,
  IconFileText,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconFilterOff,
  IconX,
} from "@tabler/icons-react";
import { ReactNode, memo, useCallback, useState } from "react";
import { GuardedButton } from "@/components/shared/permission";
import { colors } from "@/lib/colors";

interface Tab {
  value: string;
  label: string;
  badge?: number;
}

interface ListItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  [key: string]: any;
}

interface ActionButton {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  /** Permission key required to enable this action (e.g. "document:delete") */
  permission?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  status?: {
    value: string | null;
    onChange: (value: string | null) => void;
    options: FilterOption[];
  };
  priority?: {
    value: string | null;
    onChange: (value: string | null) => void;
    options: FilterOption[];
  };
  journalId?: {
    value: string | null;
    onChange: (value: string | null) => void;
    options: FilterOption[];
    label?: string;
  };
  templateId?: {
    value: string | null;
    onChange: (value: string | null) => void;
    options: FilterOption[];
    label?: string;
  };
}

interface SplitLayoutWithTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  onCreateNew?: () => void;
  createButtonLabel?: string;
  /** Permission key required to use the create button (e.g. "document:create") */
  createPermission?: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  data?: ListItem[];
  isLoading?: boolean;
  selectedItem?: ListItem | null;
  onItemClick: (item: ListItem) => void;
  pageNumber: number;
  pageSize: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  rightPanelContent?: ReactNode;
  selectedItemActions?: ActionButton[];
  additionalActions?: ReactNode;
  renderListItem?: (item: ListItem, isSelected: boolean) => ReactNode;
  renderEmptyState?: (tabValue: string) => ReactNode;
  leftPanelWidth?: number;
  filters?: FilterConfig;
  showFilters?: boolean;
}

// Status va Priority badgelar
const StatusBadge = memo(({ status }: { status: string }) => {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    DRAFT: {
      label: "Tayyorlanmoqda",
      bg: colors.bgSubtle,
      color: colors.textSecondary,
    },
    PENDING: {
      label: "Jarayonda",
      bg: colors.warningLight,
      color: colors.warningDark,
    },
    IN_REVIEW: {
      label: "Tekshiruvda",
      bg: colors.infoBg,
      color: colors.infoDark,
    },
    APPROVED: {
      label: "Tasdiqlangan",
      bg: colors.successBg,
      color: colors.successDark,
    },
    REJECTED: {
      label: "Bekor qilingan",
      bg: colors.errorBg,
      color: colors.errorDark,
    },
    ARCHIVED: {
      label: "Arxiv",
      bg: colors.border,
      color: colors.textDimmed,
    },
    PUBLISHED: {
      label: "Chop etilgan",
      bg: colors.successBg,
      color: colors.successDark,
    },
  };

  const cfg = config[status] || { label: status, bg: colors.bgSubtle, color: colors.textSecondary };

  return (
    <Badge
      size="sm"
      radius="sm"
      variant="filled"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        textTransform: "none",
      }}
    >
      {cfg.label}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

const PriorityBadge = memo(({ priority }: { priority: string }) => {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    LOW: {
      label: "Oddiy",
      bg: colors.bgSubtle,
      color: colors.textSecondary,
    },
    MEDIUM: {
      label: "O'rtacha",
      bg: colors.warningLight,
      color: colors.warningDark,
    },
    HIGH: {
      label: "Muhim",
      bg: colors.warningBg,
      color: "#d9480f",
    },
    URGENT: {
      label: "Juda muhim",
      bg: colors.errorBg,
      color: colors.errorDark,
    },
  };

  const cfg = config[priority] || { label: priority, bg: colors.bgSubtle, color: colors.textSecondary };

  return (
    <Badge
      size="sm"
      radius="sm"
      variant="filled"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        textTransform: "none",
      }}
    >
      {cfg.label}
    </Badge>
  );
});

PriorityBadge.displayName = "PriorityBadge";

// List item komponenti - memo bilan optimizatsiya
const ListItemCard = memo(({
  item,
  isSelected,
  onClick,
}: {
  item: ListItem;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <Paper
    p="sm"
    radius="sm"
    withBorder
    onClick={onClick}
    style={{
      cursor: "pointer",
      borderColor: isSelected ? colors.primary : colors.border,
      backgroundColor: isSelected ? colors.bg : colors.white,
    }}
  >
    <Text size="sm" fw={500} c={colors.textPrimary} mb={4} lineClamp={1}>
      {item.title}
    </Text>
    <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
      {item.description || "Ma'lumot yo'q"}
    </Text>
    <Group gap={6}>
      {item.status && <StatusBadge status={item.status} />}
      {item.priority && <PriorityBadge priority={item.priority} />}
    </Group>
  </Paper>
));

ListItemCard.displayName = "ListItemCard";

export const SplitLayoutWithTabs = ({
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  onCreateNew,
  createButtonLabel = "+ Yangi",
  createPermission,
  searchPlaceholder = "Qidirish...",
  searchValue,
  onSearchChange,
  data = [],
  isLoading = false,
  selectedItem,
  onItemClick,
  pageNumber,
  pageSize,
  totalCount = 0,
  onPageChange,
  rightPanelContent,
  selectedItemActions = [],
  additionalActions,
  leftPanelWidth = 420,
  filters,
  showFilters = false,
}: SplitLayoutWithTabsProps) => {
  const [filtersOpen, setFiltersOpen] = useState(showFilters);

  const validTabs = tabs.filter((tab) => tab.value && tab.value.trim() !== "");
  const effectiveDefaultTab = defaultTab || validTabs[0]?.value || "default";

  const handleItemClick = useCallback(
    (item: ListItem) => {
      onItemClick(item);
    },
    [onItemClick]
  );

  const activeFilterCount = filters
    ? [
        filters.status?.value,
        filters.priority?.value,
        filters.journalId?.value,
        filters.templateId?.value,
      ].filter(Boolean).length
    : 0;

  // Clear all filters
  const clearAllFilters = () => {
    filters?.status?.onChange(null);
    filters?.priority?.onChange(null);
    filters?.journalId?.onChange(null);
    filters?.templateId?.onChange(null);
  };

  return (
    <Box style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <Tabs
        value={activeTab || undefined}
        defaultValue={effectiveDefaultTab}
        onChange={(value) => onTabChange?.(value || "")}
        style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
      >
        {/* Tab header */}
        <Box
          px="md"
          style={{
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.white,
          }}
        >

          <Group justify="space-between" py="xs">
            <Tabs.List style={{ border: "none" }}>
              {validTabs.map((tab) => (
                <Tabs.Tab
                  key={tab.value}
                  value={tab.value}
                  px="md"
                  py="sm"
                  style={{ fontSize: 14 }}
                  rightSection={
                    tab.badge !== undefined ? (
                      <Badge size="xs" circle color={colors.primary}>
                        {tab.badge}
                      </Badge>
                    ) : null
                  }
                >
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {onCreateNew && (
              <GuardedButton
                permission={createPermission}
                size="sm"
                radius="sm"
                onClick={onCreateNew}
                style={{ backgroundColor: colors.primary }}
                data-tour="document-create"
              >
                {createButtonLabel}
              </GuardedButton>
            )}
          </Group>
        </Box>

        {/* Main content */}
        <Box style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left panel - list */}
          <Box
            style={{
              width: leftPanelWidth,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
              flexDirection: "column",
              backgroundColor: colors.white,
            }}
          >
            {/* Search and Filter Toggle */}
            <Box p="sm" style={{ borderBottom: `1px solid ${colors.border}` }} data-tour="document-search">
              <Group gap="xs">
                <TextInput
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  leftSection={<IconSearch size={16} color={colors.textDimmed} />}
                  size="sm"
                  radius="sm"
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                    },
                  }}
                />
                {filters && (
                  <ActionIcon
                    variant={filtersOpen ? "filled" : "light"}
                    size="lg"
                    radius="sm"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    style={{
                      backgroundColor: filtersOpen ? colors.primary : colors.bgSubtle,
                      color: filtersOpen ? colors.white : colors.textSecondary,
                    }}
                    data-tour="document-filter"
                  >
                    {activeFilterCount > 0 ? (
                      <Badge
                        size="xs"
                        circle
                        color="red"
                        style={{ position: "absolute", top: -4, right: -4 }}
                      >
                        {activeFilterCount}
                      </Badge>
                    ) : null}
                    <IconFilter size={18} />
                  </ActionIcon>
                )}
              </Group>

              {/* Filter Panel */}
              {filters && (
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
                        Filterlar
                      </Text>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="subtle"
                          size="compact-xs"
                          color="red"
                          leftSection={<IconFilterOff size={12} />}
                          onClick={clearAllFilters}
                        >
                          Tozalash
                        </Button>
                      )}
                    </Group>
                    <SimpleGrid cols={2} spacing="xs">
                      {filters.status && (
                        <Select
                          size="xs"
                          radius="sm"
                          placeholder="Holat"
                          clearable
                          value={filters.status.value}
                          onChange={filters.status.onChange}
                          data={filters.status.options}
                          styles={{
                            input: {
                              backgroundColor: colors.white,
                              fontSize: 12,
                            },
                          }}
                        />
                      )}
                      {filters.priority && (
                        <Select
                          size="xs"
                          radius="sm"
                          placeholder="Muhimlik"
                          clearable
                          value={filters.priority.value}
                          onChange={filters.priority.onChange}
                          data={filters.priority.options}
                          styles={{
                            input: {
                              backgroundColor: colors.white,
                              fontSize: 12,
                            },
                          }}
                        />
                      )}
                      {filters.journalId && (
                        <Select
                          size="xs"
                          radius="sm"
                          placeholder={filters.journalId.label || "Jurnal"}
                          clearable
                          searchable
                          value={filters.journalId.value}
                          onChange={filters.journalId.onChange}
                          data={filters.journalId.options}
                          styles={{
                            input: {
                              backgroundColor: colors.white,
                              fontSize: 12,
                            },
                          }}
                        />
                      )}
                      {filters.templateId && (
                        <Select
                          size="xs"
                          radius="sm"
                          placeholder={filters.templateId.label || "Shablon"}
                          clearable
                          searchable
                          value={filters.templateId.value}
                          onChange={filters.templateId.onChange}
                          data={filters.templateId.options}
                          styles={{
                            input: {
                              backgroundColor: colors.white,
                              fontSize: 12,
                            },
                          }}
                        />
                      )}
                    </SimpleGrid>
                  </Box>
                </Collapse>
              )}
            </Box>

            {/* List content */}
            <ScrollArea style={{ flex: 1 }} type="auto" scrollbarSize={6} data-tour="document-list">
              <Stack gap="xs" p="sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} height={80} radius="sm" />
                  ))
                ) : data.length > 0 ? (
                  data.map((item) => (
                    <ListItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedItem?.id === item.id}
                      onClick={() => handleItemClick(item)}
                    />
                  ))
                ) : (
                  <Box py="xl" ta="center">
                    <Text size="sm" c="dimmed">
                      Ma'lumotlar mavjud emas
                    </Text>
                  </Box>
                )}
              </Stack>
            </ScrollArea>

            {/* Pagination */}
            <Box
              p="xs"
              style={{
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: colors.bg,
              }}
            >
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {totalCount} ta
                </Text>
                <Group gap={4}>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="gray"
                    onClick={() => onPageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
                  >
                    <IconChevronLeft size={16} />
                  </ActionIcon>
                  <Text size="xs" c="dimmed" px="xs">
                    {pageNumber}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="gray"
                    onClick={() => onPageChange(pageNumber + 1)}
                    disabled={pageNumber * pageSize >= totalCount}
                  >
                    <IconChevronRight size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Box>
          </Box>

          {/* Right panel - detail */}
          <Box style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {selectedItem ? (
              <>
                {/* Action buttons */}
                <Box
                  px="md"
                  py="sm"
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                    backgroundColor: colors.white,
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="xs">
                      {selectedItemActions.map((action, index) => (
                        <GuardedButton
                          key={index}
                          permission={action.permission}
                          variant="outline"
                          size="xs"
                          radius="sm"
                          leftSection={action.icon}
                          onClick={action.onClick}
                          styles={{
                            root: {
                              borderColor: colors.border,
                              color: colors.textSecondary,
                              "&:hover": {
                                backgroundColor: colors.bg,
                              },
                            },
                          }}
                        >
                          {action.label}
                        </GuardedButton>
                      ))}
                    </Group>
                    {additionalActions}
                  </Group>
                </Box>

                {/* Content */}
                <ScrollArea style={{ flex: 1 }} p="md" type="auto">
                  <Paper p="lg" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    {rightPanelContent}
                  </Paper>
                </ScrollArea>
              </>
            ) : (
              <Box
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box ta="center">
                  <IconFileText size={48} color={colors.borderLight} stroke={1} />
                  <Text size="md" fw={500} c={colors.textSecondary} mt="md">
                    Element tanlanmagan
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    Tafsilotlarni ko'rish uchun ro'yxatdan element tanlang
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Tabs>
    </Box>
  );
};

export { StatusBadge, PriorityBadge };
