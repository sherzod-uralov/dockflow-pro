"use client";

import { useState } from "react";
import {
  Box,
  Text,
  Group,
  Checkbox,
  TextInput,
  Badge,
  Stack,
  UnstyledButton,
  Collapse,
  Center,
  Loader,
} from "@mantine/core";
import {
  IconSearch,
  IconChevronDown,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import {
  getAllPermissions,
  Permission,
} from "../../permissions/type/permission.type";

interface PermissionSelectorProps {
  permissions: getAllPermissions | undefined;
  selectedPermissions: string[];
  onPermissionChange: (permissionIds: string[]) => void;
  isLoading?: boolean;
}

const PermissionSelector = ({
  permissions,
  selectedPermissions,
  onPermissionChange,
  isLoading,
}: PermissionSelectorProps) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const permissionData = permissions?.data || [];

  const filteredPermissions = permissionData
    .map((moduleData) => ({
      ...moduleData,
      permissions: moduleData.permissions.filter(
        (permission: Permission) =>
          permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permission.key.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((moduleData) => moduleData.permissions.length > 0);

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((name) => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newSelections = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];

    onPermissionChange(newSelections);
  };

  const handleModuleToggle = (moduleData: any) => {
    const modulePermissionIds = moduleData.permissions
      .filter((p: Permission) => p.id)
      .map((p: Permission) => p.id!);
    const selectedInModule = modulePermissionIds.filter((id: string) =>
      selectedPermissions.includes(id)
    ).length;

    let newSelections: string[];
    if (selectedInModule === modulePermissionIds.length) {
      newSelections = selectedPermissions.filter(
        (id) => !modulePermissionIds.includes(id)
      );
    } else {
      const otherPermissions = selectedPermissions.filter(
        (id) => !modulePermissionIds.includes(id)
      );
      newSelections = [...otherPermissions, ...modulePermissionIds];
    }

    onPermissionChange(newSelections);
  };

  const handleClearAll = () => {
    onPermissionChange([]);
  };

  if (isLoading) {
    return (
      <Center py="xl">
        <Group gap="xs">
          <Loader size="sm" color="dark" />
          <Text size="sm" c="dimmed">
            Yuklanmoqda...
          </Text>
        </Group>
      </Center>
    );
  }

  return (
    <Stack gap="sm">
      {/* Search */}
      <TextInput
        placeholder="Qidirish..."
        leftSection={<IconSearch size={16} color={colors.textDimmed} />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="xs"
        radius="sm"
        styles={{
          input: {
            backgroundColor: "white",
            border: `1px solid ${colors.border}`,
          },
        }}
      />

      {/* Selected count & clear */}
      <Group justify="space-between">
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            Tanlangan:
          </Text>
          <Badge size="sm" variant="light" color="dark">
            {selectedPermissions.length}
          </Badge>
        </Group>
        {selectedPermissions.length > 0 && (
          <UnstyledButton onClick={handleClearAll}>
            <Group gap={4}>
              <IconX size={12} color={colors.textDimmed} />
              <Text size="xs" c="dimmed">
                Tozalash
              </Text>
            </Group>
          </UnstyledButton>
        )}
      </Group>

      {/* Permissions list */}
      <Box
        style={{
          maxHeight: 280,
          overflowY: "auto",
        }}
      >
        {filteredPermissions.length === 0 ? (
          <Center py="lg">
            <Text size="sm" c="dimmed">
              Hech qanday ruxsat topilmadi
            </Text>
          </Center>
        ) : (
          <Stack gap="xs">
            {filteredPermissions.map((moduleData) => {
              const isExpanded = expandedModules.includes(moduleData.module);
              const modulePermissionIds = moduleData.permissions
                .filter((p: Permission) => p.id)
                .map((p: Permission) => p.id!);
              const selectedInModule = modulePermissionIds.filter((id: string) =>
                selectedPermissions.includes(id)
              ).length;
              const isAllSelected = selectedInModule === modulePermissionIds.length;
              const isPartiallySelected = selectedInModule > 0 && !isAllSelected;

              return (
                <Box
                  key={moduleData.module}
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 6,
                    backgroundColor: "white",
                  }}
                >
                  {/* Module header */}
                  <Group
                    justify="space-between"
                    p="xs"
                    style={{
                      backgroundColor: isExpanded ? colors.bg : "transparent",
                      borderRadius: isExpanded ? "6px 6px 0 0" : 6,
                    }}
                  >
                    <Group gap="xs">
                      <UnstyledButton
                        onClick={() => toggleModule(moduleData.module)}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        {isExpanded ? (
                          <IconChevronDown size={14} color={colors.textSecondary} />
                        ) : (
                          <IconChevronRight size={14} color={colors.textSecondary} />
                        )}
                      </UnstyledButton>
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isPartiallySelected}
                        onChange={() => handleModuleToggle(moduleData)}
                        size="xs"
                        color="dark"
                      />
                      <Text size="sm" fw={500} c={colors.textPrimary} tt="capitalize">
                        {moduleData.module}
                      </Text>
                    </Group>
                    <Badge size="xs" variant="outline" color="gray">
                      {selectedInModule}/{modulePermissionIds.length}
                    </Badge>
                  </Group>

                  {/* Permissions */}
                  <Collapse in={isExpanded}>
                    <Stack gap={0} p="xs" pt={0}>
                      {moduleData.permissions
                        .filter((permission: Permission) => permission.id)
                        .map((permission: Permission) => (
                          <UnstyledButton
                            key={permission.id}
                            onClick={() => handlePermissionToggle(permission.id!)}
                            p="xs"
                            style={{
                              borderRadius: 4,
                              backgroundColor: selectedPermissions.includes(permission.id!)
                                ? colors.bgSubtle
                                : "transparent",
                              "&:hover": {
                                backgroundColor: colors.bg,
                              },
                            }}
                          >
                            <Group gap="xs" wrap="nowrap">
                              <Checkbox
                                checked={selectedPermissions.includes(permission.id!)}
                                onChange={() => handlePermissionToggle(permission.id!)}
                                size="xs"
                                color="dark"
                                styles={{ input: { cursor: "pointer" } }}
                              />
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text size="xs" fw={500} c={colors.textPrimary}>
                                  {permission.name}
                                </Text>
                                <Text
                                  size="xs"
                                  c="dimmed"
                                  style={{ fontFamily: "monospace" }}
                                >
                                  {permission.key}
                                </Text>
                              </Box>
                            </Group>
                          </UnstyledButton>
                        ))}
                    </Stack>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};
import { colors } from "@/lib/colors";

export default PermissionSelector;
