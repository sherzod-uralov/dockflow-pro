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

interface UserMonthlyKpiLeaderboardViewProps {
  year: number;
  month: number;
}

const RANK_STYLES: Record<number, { bg: string; border: string; medal: string; label: string }> = {
  1: { bg: "linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%)", border: "#FFD700", medal: "#FFD700", label: "1-o'rin" },
  2: { bg: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", border: "#C0C0C0", medal: "#C0C0C0", label: "2-o'rin" },
  3: { bg: "linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%)", border: "#CD7F32", medal: "#CD7F32", label: "3-o'rin" },
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
          <Box p={16} style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}>
            <IconTrophy size={40} color="#868e96" stroke={1.5} />
          </Box>
          <Text size="lg" fw={500} c="#495057">Reyting topilmadi</Text>
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
                  background: style?.bg || "#f8f9fa",
                  border: `2px solid ${style?.border || "#e9ecef"}`,
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
                      style={{ border: `3px solid ${style?.border || "#e9ecef"}` }}
                    >
                      <Text size="sm" fw={600}>{getInitials(entry.user.fullname)}</Text>
                    </Avatar>
                  </Box>
                  <Text size="sm" fw={700} c={style?.medal || "#495057"}>
                    {entry.rank}
                  </Text>
                  <Box style={{ width: "100%" }}>
                    <Text size="sm" fw={600} c="#212529" lineClamp={1}>{entry.user.fullname}</Text>
                  </Box>
                  <Text
                    fw={700}
                    c="#1e3a5f"
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
        <Paper radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Stack gap={0}>
            {rest.map((entry) => {
              const percent = Math.round((entry.finalScore / maxScore) * 100);
              return (
                <Box
                  key={entry.userId}
                  px="md"
                  py="sm"
                  style={{ borderBottom: "1px solid #f1f3f5" }}
                >
                  <Group justify="space-between" mb={6}>
                    <Group gap="sm" wrap="nowrap">
                      <Text size="sm" fw={600} c="dimmed" w={28} ta="center">
                        {entry.rank}
                      </Text>
                      <Avatar size="sm" radius="xl" src={entry.user.avatarUrl}>
                        <Text size="xs" fw={500}>{getInitials(entry.user.fullname)}</Text>
                      </Avatar>
                      <Text size="sm" fw={500} c="#212529">{entry.user.fullname}</Text>
                    </Group>
                    <Text size="sm" fw={600} c="#1e3a5f">{entry.finalScore}</Text>
                  </Group>
                  <Progress value={percent} size={4} radius="xl" color="#1e3a5f" ml={42} />
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
