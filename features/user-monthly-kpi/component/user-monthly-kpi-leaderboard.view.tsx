"use client";

import {
  Box,
  Text,
  Group,
  Avatar,
  Paper,
  Stack,
  Loader,
  Center,
  Badge,
  Progress,
} from "@mantine/core";
import {
  IconTrophy,
  IconMedal,
} from "@tabler/icons-react";
import { useGetUserMonthlyKpiLeaderboard } from "../hook/user-monthly-kpi.hook";
import { UserMonthlyKpiLeaderboardEntry } from "../type/user-monthly-kpi.type";
import { colors } from "@/lib/colors";

interface UserMonthlyKpiLeaderboardViewProps {
  year: number;
  month: number;
}

const RANK_STYLES: Record<number, { bg: string; border: string; medal: string; label: string }> = {
  1: { bg: `linear-gradient(135deg, ${colors.warningLight} 0%, ${colors.warningLight} 100%)`, border: colors.warning, medal: colors.warning, label: "1-o'rin" },
  2: { bg: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%)`, border: colors.textMuted, medal: colors.textMuted, label: "2-o'rin" },
  3: { bg: `linear-gradient(135deg, ${colors.errorLight} 0%, ${colors.warningBg} 100%)`, border: colors.warningDark, medal: colors.warningDark, label: "3-o'rin" },
};

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

const UserMonthlyKpiLeaderboardView = ({ year, month }: UserMonthlyKpiLeaderboardViewProps) => {
  const { data, isLoading } = useGetUserMonthlyKpiLeaderboard({ year, month });

  if (isLoading) {
    return <Center py={40}><Loader size="md" /></Center>;
  }

  const entries: UserMonthlyKpiLeaderboardEntry[] = Array.isArray(data)
    ? data
    : (data as any)?.data || [];

  if (entries.length === 0) {
    return (
      <Center py={40}>
        <Stack align="center" gap="md">
          <Box p={16} style={{ backgroundColor: colors.bgSubtle, borderRadius: 12 }}>
            <IconTrophy size={40} color={colors.textDimmed} stroke={1.5} />
          </Box>
          <Text size="lg" fw={500} c={colors.textSecondary}>Reyting topilmadi</Text>
          <Text size="sm" c="dimmed">Tanlangan davr uchun ma'lumot yo'q</Text>
        </Stack>
      </Center>
    );
  }

  const maxScore = entries[0]?.finalScore || 1;
  const top3 = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  return (
    <Stack gap="lg">
      {/* Top 3 podium */}
      {top3.length > 0 && (
        <Group gap="md" justify="center" wrap="wrap">
          {top3.map((entry) => {
            const style = RANK_STYLES[entry.rank];
            return (
              <Paper
                key={entry.userId}
                p="lg"
                radius="md"
                style={{
                  background: style?.bg || colors.bg,
                  border: `2px solid ${style?.border || colors.border}`,
                  minWidth: 220,
                  maxWidth: 260,
                  textAlign: "center",
                  flex: 1,
                }}
              >
                <Stack align="center" gap="sm">
                  <Box pos="relative">
                    <Avatar
                      size={56}
                      radius="xl"
                      src={entry.user.avatarUrl}
                      style={{ border: `3px solid ${style?.border || colors.border}` }}
                    >
                      <Text size="sm" fw={600}>{getInitials(entry.user.fullname)}</Text>
                    </Avatar>
                  </Box>
                  <Text size="sm" fw={700} c={style?.medal || colors.textSecondary}>
                    {entry.rank}
                  </Text>
                  <Box style={{ width: "100%" }}>
                    <Text size="sm" fw={600} c={colors.textPrimary} lineClamp={1}>{entry.user.fullname}</Text>
                  </Box>
                  <Text
                    fw={700}
                    c={colors.primary}
                    style={{ fontSize: 28, lineHeight: 1.1, whiteSpace: "nowrap" }}
                  >
                    {entry.finalScore}
                  </Text>
                  <Text size="xs" c="dimmed">ball</Text>
                </Stack>
              </Paper>
            );
          })}
        </Group>
      )}

      {/* Rest — progress bar list */}
      {rest.length > 0 && (
        <Paper radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Stack gap={0}>
            {rest.map((entry) => {
              const percent = Math.round((entry.finalScore / maxScore) * 100);
              return (
                <Box
                  key={entry.userId}
                  px="md"
                  py="sm"
                  style={{ borderBottom: `1px solid ${colors.bgSubtle}` }}
                >
                  <Group justify="space-between" mb={6}>
                    <Group gap="sm" wrap="nowrap">
                      <Text size="sm" fw={600} c="dimmed" w={28} ta="center">
                        {entry.rank}
                      </Text>
                      <Avatar size="sm" radius="xl" src={entry.user.avatarUrl}>
                        <Text size="xs" fw={500}>{getInitials(entry.user.fullname)}</Text>
                      </Avatar>
                      <Text size="sm" fw={500} c={colors.textPrimary}>{entry.user.fullname}</Text>
                    </Group>
                    <Text size="sm" fw={600} c={colors.primary}>{entry.finalScore}</Text>
                  </Group>
                  <Progress value={percent} size={4} radius="xl" color={colors.primary} ml={42} />
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default UserMonthlyKpiLeaderboardView;
