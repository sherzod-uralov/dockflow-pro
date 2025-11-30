"use client";

import { useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Badge,
  Paper,
  Group,
  Stack,
  Divider,
  Code,
  Skeleton,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconUser,
  IconCalendar,
  IconWorld,
  IconFileText,
  IconActivity,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { useGetAuditLogById } from "@/features/audit-logs/hook/audit-log.hook";
import { format } from "date-fns";
import { AuditAction } from "../type/audit-log.type";

const AuditLogView = () => {
  const params = useSearchParams();
  const auditLogId = params.get("auditLogId") || "";

  const { data, isLoading, isFetching } = useGetAuditLogById(auditLogId);

  const getActionColor = (action: AuditAction): string => {
    switch (action) {
      case AuditAction.CREATE:
        return "green";
      case AuditAction.UPDATE:
        return "blue";
      case AuditAction.DELETE:
        return "red";
      case AuditAction.RESTORE:
        return "yellow";
      case AuditAction.LOGIN:
        return "violet";
      case AuditAction.LOGOUT:
        return "gray";
      case AuditAction.APPROVE:
        return "teal";
      case AuditAction.REJECT:
        return "orange";
      case AuditAction.ARCHIVE:
        return "indigo";
      default:
        return "gray";
    }
  };

  if (isLoading || isFetching) {
    return (
      <Stack gap="md">
        <Skeleton height={100} radius="sm" />
        <Skeleton height={200} radius="sm" />
        <Skeleton height={100} radius="sm" />
      </Stack>
    );
  }

  if (!data) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Ma'lumot topilmadi
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {/* Header Card */}
      <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Box
              p={8}
              style={{
                backgroundColor: "#f1f3f5",
                borderRadius: 8,
              }}
            >
              <IconActivity size={20} color="#1e3a5f" />
            </Box>
            <Box>
              <Text size="md" fw={600} c="#212529">
                Audit Log #{data.id.slice(0, 8)}...
              </Text>
              <Text size="sm" c="dimmed">
                Tizim harakati haqida batafsil ma'lumotlar
              </Text>
            </Box>
          </Group>
          <CopyButton value={data.id}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Nusxalandi!" : "ID nusxalash"}>
                <Badge
                  variant="light"
                  color={copied ? "green" : "gray"}
                  radius="sm"
                  style={{ cursor: "pointer" }}
                  onClick={copy}
                  rightSection={
                    copied ? <IconCheck size={12} /> : <IconCopy size={12} />
                  }
                >
                  ID: {data.id.slice(0, 8)}...
                </Badge>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Paper>

      {/* Main Info */}
      <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          {/* Entity */}
          <Box>
            <Group gap="xs" mb={8}>
              <IconFileText size={16} color="#868e96" />
              <Text size="sm" fw={500} c="#495057">
                Entity
              </Text>
            </Group>
            <Paper p="sm" radius="sm" style={{ backgroundColor: "#f8f9fa" }}>
              <Text size="sm" fw={500} c="#212529">
                {data.entity}
              </Text>
            </Paper>
          </Box>

          {/* Action */}
          <Box>
            <Group gap="xs" mb={8}>
              <IconActivity size={16} color="#868e96" />
              <Text size="sm" fw={500} c="#495057">
                Amal
              </Text>
            </Group>
            <Badge variant="light" color={getActionColor(data.action)} radius="sm" size="lg">
              {data.action}
            </Badge>
          </Box>

          {/* User */}
          <Box>
            <Group gap="xs" mb={8}>
              <IconUser size={16} color="#868e96" />
              <Text size="sm" fw={500} c="#495057">
                Foydalanuvchi
              </Text>
            </Group>
            <Paper p="sm" radius="sm" style={{ backgroundColor: "#f8f9fa" }}>
              <Text size="sm" fw={500} c="#212529">
                {data.performedBy?.fullname || "—"}
              </Text>
              <Text size="xs" c="dimmed">
                @{data.performedBy?.username || "—"}
              </Text>
            </Paper>
          </Box>

          {/* Time */}
          <Box>
            <Group gap="xs" mb={8}>
              <IconCalendar size={16} color="#868e96" />
              <Text size="sm" fw={500} c="#495057">
                Vaqt
              </Text>
            </Group>
            <Paper p="sm" radius="sm" style={{ backgroundColor: "#f8f9fa" }}>
              <Text size="sm" c="#212529">
                {format(new Date(data.performedAt), "dd.MM.yyyy HH:mm:ss")}
              </Text>
            </Paper>
          </Box>

          {/* IP Address */}
          <Box style={{ gridColumn: "span 2" }}>
            <Group gap="xs" mb={8}>
              <IconWorld size={16} color="#868e96" />
              <Text size="sm" fw={500} c="#495057">
                IP Address
              </Text>
            </Group>
            <CopyButton value={data.ipAddress}>
              {({ copied, copy }) => (
                <Paper
                  p="sm"
                  radius="sm"
                  style={{
                    backgroundColor: "#e7f5ff",
                    border: "1px solid #a5d8ff",
                    cursor: "pointer",
                  }}
                  onClick={copy}
                >
                  <Group justify="space-between">
                    <Code
                      style={{
                        backgroundColor: "transparent",
                        color: "#1971c2",
                      }}
                    >
                      {data.ipAddress}
                    </Code>
                    <ActionIcon variant="subtle" color={copied ? "green" : "blue"} size="sm">
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Group>
                </Paper>
              )}
            </CopyButton>
          </Box>
        </Box>
      </Paper>

      {/* Entity ID */}
      {data.entityId && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb={8}>
            <IconFileText size={16} color="#868e96" />
            <Text size="sm" fw={500} c="#495057">
              Entity ID
            </Text>
          </Group>
          <CopyButton value={data.entityId}>
            {({ copied, copy }) => (
              <Paper
                p="sm"
                radius="sm"
                style={{
                  backgroundColor: "#f8f9fa",
                  cursor: "pointer",
                }}
                onClick={copy}
              >
                <Group justify="space-between">
                  <Code style={{ backgroundColor: "transparent" }}>
                    {data.entityId}
                  </Code>
                  <ActionIcon variant="subtle" color={copied ? "green" : "gray"} size="sm">
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </ActionIcon>
                </Group>
              </Paper>
            )}
          </CopyButton>
        </Paper>
      )}

      {/* Changes */}
      {data.changes && Object.keys(data.changes).length > 0 && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb={8}>
            <IconActivity size={16} color="#868e96" />
            <Text size="sm" fw={500} c="#495057">
              O'zgarishlar
            </Text>
          </Group>
          <Paper
            p="sm"
            radius="sm"
            style={{
              backgroundColor: "#f8f9fa",
              maxHeight: 300,
              overflow: "auto",
            }}
          >
            <Code block style={{ backgroundColor: "transparent" }}>
              {JSON.stringify(data.changes, null, 2)}
            </Code>
          </Paper>
        </Paper>
      )}
    </Stack>
  );
};

export default AuditLogView;
