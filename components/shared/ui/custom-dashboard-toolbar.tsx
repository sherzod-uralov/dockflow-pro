"use client";

import { Group, Button, TextInput, Box } from "@mantine/core";
import {
  IconUserCheck,
  IconPlus,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";

interface UserToolbarProps {
  selectedCount?: number;
  searchQuery: string;
  onSearch: (value: string) => void;
  onCreate?: () => void;
  onFilter?: () => void;
  onBulkAction?: () => void;
  searchPlaceholder?: string;
  createLabel?: string;
  filterLabel?: string;
  bulkLabel?: string;
}

export function UserToolbar({
  selectedCount = 0,
  searchQuery,
  onSearch,
  onCreate,
  onFilter,
  searchPlaceholder = "Qidirish...",
  createLabel = "Yangi element qo'shish",
  filterLabel = "Filtrlash",
  bulkLabel = "Tanlangan",
  onBulkAction,
}: UserToolbarProps) {
  return (
    <Group justify="space-between" mb="md">
      {/* Search & Filter */}
      <Group gap="sm">
        <TextInput
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          leftSection={<IconSearch size={16} color="#868e96" />}
          size="sm"
          radius="sm"
          w={320}
          styles={{
            input: {
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              "&:focus": {
                borderColor: "#1e3a5f",
              },
            },
          }}
        />
        {onFilter && (
          <Button
            variant="outline"
            size="sm"
            radius="sm"
            leftSection={<IconFilter size={16} />}
            onClick={onFilter}
            styles={{
              root: {
                borderColor: "#e9ecef",
                color: "#495057",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              },
            }}
          >
            {filterLabel}
          </Button>
        )}
      </Group>

      {/* Actions */}
      <Group gap="sm">
        {selectedCount > 0 && (
          <Button
            variant="subtle"
            size="sm"
            radius="sm"
            leftSection={<IconUserCheck size={16} />}
            onClick={onBulkAction}
            c="dimmed"
          >
            {bulkLabel} ({selectedCount})
          </Button>
        )}
        {onCreate && (
          <Button
            size="sm"
            radius="sm"
            leftSection={<IconPlus size={16} />}
            onClick={onCreate}
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {createLabel}
          </Button>
        )}
      </Group>
    </Group>
  );
}
