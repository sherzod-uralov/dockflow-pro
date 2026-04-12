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
  Avatar,
} from "@mantine/core";
import {
  IconTrophy,
  IconUser,
  IconCalendar,
  IconCash,
  IconFileDescription,
} from "@tabler/icons-react";
import {
  KpiRewardGetResponse,
  KPI_REWARD_STATUS_OPTIONS,
} from "../type/kpi-reward.type";
import { formatDate } from "@/lib/date-utils";

interface KpiRewardViewProps {
  reward: KpiRewardGetResponse;
}

const MONTH_LABELS: Record<number, string> = {
  1: "Yanvar",
  2: "Fevral",
  3: "Mart",
  4: "Aprel",
  5: "May",
  6: "Iyun",
  7: "Iyul",
  8: "Avgust",
  9: "Sentabr",
  10: "Oktabr",
  11: "Noyabr",
  12: "Dekabr",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const KpiRewardView = ({ reward }: KpiRewardViewProps) => {
  const statusOption = KPI_REWARD_STATUS_OPTIONS.find(
    (o) => o.value === reward.status
  );

  return (
    <Stack gap="lg">
      {/* Header - User Info */}
      <Box>
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            {reward.user ? (
              <>
                <Avatar
                  size="lg"
                  radius="xl"
                  src={reward.user.avatarUrl}
                  style={{ backgroundColor: "#e7f5ff" }}
                >
                  <Text size="sm" c="#1e3a5f" fw={500}>
                    {getInitials(reward.user.fullname)}
                  </Text>
                </Avatar>
                <Box>
                  <Text size="xl" fw={600} c="#212529">
                    {reward.user.fullname}
                  </Text>
                  <Text size="sm" c="dimmed">
                    @{reward.user.username}
                  </Text>
                </Box>
              </>
            ) : (
              <Box>
                <Text size="xl" fw={600} c="#212529">
                  Mukofot ma'lumotlari
                </Text>
              </Box>
            )}
          </Group>
          <Badge
            variant="light"
            size="lg"
            radius="sm"
            style={{ color: statusOption?.color }}
          >
            {statusOption?.label || reward.status}
          </Badge>
        </Group>
      </Box>

      <Divider />

      {/* Period, Score, Reward, Tier */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconCalendar size={16} color="#868e96" />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Davr
            </Text>
          </Group>
          <Text size="lg" fw={600} c="#212529">
            {MONTH_LABELS[reward.month]} {reward.year}
          </Text>
        </Paper>

        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconTrophy size={16} color="#868e96" />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Yakuniy ball
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="xl" radius="sm">
            {reward.finalScore}
          </Badge>
        </Paper>

        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconCash size={16} color="#868e96" />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Mukofot
            </Text>
          </Group>
          <Stack gap={4}>
            <Text size="lg" fw={600} c="#212529">
              {reward.rewardAmount?.toLocaleString("uz-UZ") ?? "—"} so'm
            </Text>
            <Text size="sm" c="#495057">
              {reward.rewardBhm} BHM
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb="sm">
            <IconTrophy size={16} color={reward.rewardTier?.color || "#868e96"} />
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Daraja
            </Text>
          </Group>
          <Group gap="sm">
            {reward.rewardTier ? (
              <Badge
                variant="light"
                size="lg"
                radius="sm"
                style={{ backgroundColor: `${reward.rewardTier.color}20`, color: reward.rewardTier.color }}
              >
                {reward.rewardTier.name}
              </Badge>
            ) : (
              <Text size="sm" c="dimmed">—</Text>
            )}
            <Badge
              variant="light"
              color={reward.isPenalty ? "red" : "green"}
              radius="sm"
              size="sm"
            >
              {reward.isPenalty ? "Jarima" : "Mukofot"}
            </Badge>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Dates */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {reward.approvedAt && (
          <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Group gap="xs" mb="sm">
              <IconCalendar size={16} color="#3498db" />
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Tasdiqlangan
              </Text>
            </Group>
            <Text size="sm" c="#495057">
              {formatDate(reward.approvedAt)}
              {reward.approvedBy && ` — ${reward.approvedBy.fullname}`}
            </Text>
          </Paper>
        )}

        {reward.paidAt && (
          <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Group gap="xs" mb="sm">
              <IconCalendar size={16} color="#2ecc71" />
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                To'langan sana
              </Text>
            </Group>
            <Text size="sm" c="#495057">
              {formatDate(reward.paidAt)}
            </Text>
          </Paper>
        )}

        {reward.rejectedAt && (
          <Paper p="md" radius="sm" withBorder style={{ borderColor: "#fde2e2" }}>
            <Group gap="xs" mb="sm">
              <IconCalendar size={16} color="#e74c3c" />
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Rad etilgan sana
              </Text>
            </Group>
            <Text size="sm" c="#495057">
              {formatDate(reward.rejectedAt)}
            </Text>
          </Paper>
        )}
      </SimpleGrid>

      {/* Rejection Reason */}
      {reward.rejectionReason && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: "#fde2e2" }}>
          <Group gap="xs" mb="sm">
            <IconFileDescription size={16} color="#e74c3c" />
            <Text size="xs" c="red" tt="uppercase" fw={600}>
              Rad etish sababi
            </Text>
          </Group>
          <Text size="sm" c="#495057" style={{ lineHeight: 1.6 }}>
            {reward.rejectionReason}
          </Text>
        </Paper>
      )}
    </Stack>
  );
};

export default KpiRewardView;
