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
  IconTag,
  IconCopy,
  IconCheck,
  IconFileDescription,
  IconTrophy,
  IconAlertTriangle,
  IconPalette,
} from "@tabler/icons-react";
import { KpiRewardTierGetResponse } from "../type/kpi-reward-tier.type";

interface KpiRewardTierViewProps {
  tier: KpiRewardTierGetResponse;
}

const KpiRewardTierView = ({ tier }: KpiRewardTierViewProps) => {
  return (
    <Stack gap="lg">
      {/* Header */}
      <Box>
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Box
              p={10}
              style={{
                backgroundColor: tier.color ? `${tier.color}20` : "#f1f3f5",
                borderRadius: 8,
              }}
            >
              <IconTrophy size={24} color={tier.color || "#1e3a5f"} />
            </Box>
            <Box>
              <Text size="xl" fw={600} c="#212529">
                {tier.name}
              </Text>
              <Text size="sm" c="dimmed">
                Mukofot darajasi haqida batafsil ma'lumotlar
              </Text>
            </Box>
          </Group>
          <CopyButton value={tier.id}>
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
                  ID: {tier.id.slice(0, 8)}...
                </Badge>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Box>

      <Divider />

      {/* Score Range */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconTag size={16} color="#868e96" />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Ball oralig'i
            </Text>
          </Group>
          <Group gap="xs">
            <Badge variant="light" color="blue" size="lg" radius="sm">
              {tier.minScore}
            </Badge>
            <Text c="dimmed">—</Text>
            <Badge variant="light" color="blue" size="lg" radius="sm">
              {tier.maxScore}
            </Badge>
          </Group>
        </Paper>

        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconPalette size={16} color="#868e96" />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Rang va holat
            </Text>
          </Group>
          <Group gap="sm">
            {tier.color && (
              <Box
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: tier.color,
                }}
              />
            )}
            <Badge
              variant="light"
              color={tier.isActive ? "green" : "gray"}
              size="lg"
              radius="sm"
            >
              {tier.isActive ? "Faol" : "Nofaol"}
            </Badge>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Reward Info */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconTrophy size={16} color="#868e96" />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Mukofot (BHM)
            </Text>
          </Group>
          <Text size="lg" fw={600} c="#212529">
            {tier.rewardBhm ?? "—"}
          </Text>
        </Paper>

        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconTrophy size={16} color="#868e96" />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Mukofot (so'm)
            </Text>
          </Group>
          <Text size="lg" fw={600} c="#212529">
            {tier.rewardAmount != null
              ? tier.rewardAmount.toLocaleString("uz-UZ")
              : "—"}
          </Text>
        </Paper>
      </SimpleGrid>

      {/* Penalty Info */}
      {tier.isPenalty && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#fde2e2" }}>
          <Group gap="xs" mb="sm">
            <IconAlertTriangle size={16} color="#e74c3c" />
            <Text size="xs" c="red" tt="uppercase" fw={600}>
              Jarima ma'lumotlari
            </Text>
          </Group>
          <Group gap="sm">
            <Badge variant="light" color="red" size="lg" radius="sm">
              Jarima
            </Badge>
            {tier.penaltyType && (
              <Badge variant="outline" color="red" size="lg" radius="sm">
                {tier.penaltyType}
              </Badge>
            )}
          </Group>
        </Paper>
      )}

      {/* Description */}
      {tier.description && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconFileDescription size={16} color="#868e96" />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Tavsif
            </Text>
          </Group>
          <Text size="sm" c="#495057" style={{ lineHeight: 1.6 }}>
            {tier.description}
          </Text>
        </Paper>
      )}
    </Stack>
  );
};

export default KpiRewardTierView;
