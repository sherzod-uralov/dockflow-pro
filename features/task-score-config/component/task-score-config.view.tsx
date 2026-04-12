"use client";

import {
  Box,
  Text,
  Group,
  Badge,
  Paper,
  Stack,
  SimpleGrid,
  Divider,
  CopyButton,
  Tooltip,
} from "@mantine/core";
import {
  IconSettings,
  IconCopy,
  IconCheck,
  IconFileDescription,
  IconAlertTriangle,
  IconClock,
} from "@tabler/icons-react";
import { TaskScoreConfigGetResponse } from "../type/task-score-config.type";
import { colors } from "@/lib/colors";

interface TaskScoreConfigViewProps {
  config: TaskScoreConfigGetResponse;
}

const TaskScoreConfigView = ({ config }: TaskScoreConfigViewProps) => {
  return (
    <Stack gap="lg">
      {/* Header */}
      <Box>
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Box
              p={10}
              style={{ backgroundColor: colors.bgSubtle, borderRadius: 8 }}
            >
              <IconSettings size={24} color={colors.primary} />
            </Box>
            <Box>
              <Text size="xl" fw={600} c={colors.textPrimary}>
                {config.priorityCode} — Daraja {config.priorityLevel}
              </Text>
              <Text size="sm" c="dimmed">
                Ball konfiguratsiyasi haqida batafsil ma'lumotlar
              </Text>
            </Box>
          </Group>
          <Group gap="xs">
            <Badge
              variant="light"
              color={config.isActive ? "green" : "gray"}
              size="lg"
              radius="sm"
            >
              {config.isActive ? "Faol" : "Nofaol"}
            </Badge>
            <CopyButton value={config.id}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Nusxalandi!" : "ID nusxalash"}>
                  <Badge
                    variant="light"
                    color={copied ? "green" : "gray"}
                    radius="sm"
                    size="lg"
                    style={{ cursor: "pointer" }}
                    onClick={copy}
                    rightSection={
                      copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                    }
                  >
                    ID: {config.id.slice(0, 8)}...
                  </Badge>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Group>
      </Box>

      <Divider />

      {/* Score Info */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="sm">
            <IconSettings size={16} color={colors.textDimmed} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Asosiy ball
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="xl" radius="sm">
            {config.baseScore}
          </Badge>
        </Paper>

        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="sm">
            <IconClock size={16} color={colors.textDimmed} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Tavsiya etilgan kunlar
            </Text>
          </Group>
          <Text size="lg" fw={600} c={colors.textPrimary}>
            {config.recommendedDays} kun
          </Text>
        </Paper>

        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="sm">
            <IconAlertTriangle size={16} color={colors.textDimmed} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Maksimal jarima kunlari
            </Text>
          </Group>
          <Text size="lg" fw={600} c={colors.textPrimary}>
            {config.maxPenaltyDays ?? "—"} kun
          </Text>
        </Paper>
      </SimpleGrid>

      {/* Penalty */}
      <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.errorBg }}>
        <Group gap="xs" mb="sm">
          <IconAlertTriangle size={16} color={colors.error} />
          <Text size="xs" c="red" tt="uppercase" fw={600}>
            Kunlik jarima
          </Text>
        </Group>
        <Badge variant="light" color="red" size="lg" radius="sm">
          {config.penaltyPerDay} ball/kun
        </Badge>
      </Paper>

      {/* Description */}
      {config.description && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="sm">
            <IconFileDescription size={16} color={colors.textDimmed} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Tavsif
            </Text>
          </Group>
          <Text size="sm" c={colors.textSecondary} style={{ lineHeight: 1.6 }}>
            {config.description}
          </Text>
        </Paper>
      )}

      {/* Criteria */}
      {config.criteria && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="sm">
            <IconFileDescription size={16} color={colors.textDimmed} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Mezon
            </Text>
          </Group>
          <Text size="sm" c={colors.textSecondary} style={{ lineHeight: 1.6 }}>
            {config.criteria}
          </Text>
        </Paper>
      )}
    </Stack>
  );
};

export default TaskScoreConfigView;
