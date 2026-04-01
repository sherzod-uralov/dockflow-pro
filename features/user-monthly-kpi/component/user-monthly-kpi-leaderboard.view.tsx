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

const MEDAL_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const UserMonthlyKpiLeaderboardView = ({
  year,
  month,
}: UserMonthlyKpiLeaderboardViewProps) => {
  const { data, isLoading } = useGetUserMonthlyKpiLeaderboard({
    year,
    month,
  });

  if (isLoading) {
    return (
      <Center py={40}>
        <Loader size="md" />
      </Center>
    );
  }

  const entries: UserMonthlyKpiLeaderboardEntry[] = Array.isArray(data)
    ? data
    : (data as unknown as { data: UserMonthlyKpiLeaderboardEntry[] })?.data || [];

  if (entries.length === 0) {
    return (
      <Center py={40}>
        <Stack align="center" gap="md">
          <Box p={16} style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}>
            <IconTrophy size={40} color="#868e96" stroke={1.5} />
          </Box>
          <Text size="lg" fw={500} c="#495057">
            Reyting ma'lumotlari topilmadi
          </Text>
        </Stack>
      </Center>
    );
  }

  const top3 = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  return (
    <Stack gap="lg">
      {/* Top 3 */}
      {top3.length > 0 && (
        <Group gap="md" justify="center" wrap="wrap">
          {top3.map((entry) => (
            <Paper
              key={entry.userId}
              p="lg"
              radius="md"
              withBorder
              style={{
                borderColor: MEDAL_COLORS[entry.rank] || "#e9ecef",
                borderWidth: 2,
                minWidth: 180,
                textAlign: "center",
              }}
            >
              <Stack align="center" gap="sm">
                <Box pos="relative">
                  <Avatar
                    size="lg"
                    radius="xl"
                    src={entry.user.avatarUrl}
                    style={{
                      border: `3px solid ${MEDAL_COLORS[entry.rank] || "#e9ecef"}`,
                    }}
                  >
                    <Text size="sm" fw={500}>
                      {getInitials(entry.user.fullname)}
                    </Text>
                  </Avatar>
                  <Badge
                    size="sm"
                    variant="filled"
                    color={
                      entry.rank === 1
                        ? "yellow"
                        : entry.rank === 2
                        ? "gray"
                        : "orange"
                    }
                    style={{
                      position: "absolute",
                      bottom: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <Group gap={2}>
                      <IconMedal size={12} />
                      {entry.rank}
                    </Group>
                  </Badge>
                </Box>
                <Box>
                  <Text size="sm" fw={600} c="#212529">
                    {entry.user.fullname}
                  </Text>
                  <Text size="xs" c="dimmed">
                    @{entry.user.username}
                  </Text>
                </Box>
                <Badge variant="light" color="blue" size="lg" radius="sm">
                  {entry.totalScore} ball
                </Badge>
              </Stack>
            </Paper>
          ))}
        </Group>
      )}

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <Paper radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Stack gap={0}>
            {rest.map((entry) => (
              <Group
                key={entry.userId}
                px="md"
                py="sm"
                justify="space-between"
                style={{
                  borderBottom: "1px solid #f1f3f5",
                }}
              >
                <Group gap="sm">
                  <Text size="sm" fw={600} c="dimmed" w={30} ta="center">
                    #{entry.rank}
                  </Text>
                  <Avatar size="sm" radius="xl" src={entry.user.avatarUrl}>
                    <Text size="xs" fw={500}>
                      {getInitials(entry.user.fullname)}
                    </Text>
                  </Avatar>
                  <Box>
                    <Text size="sm" fw={500} c="#212529">
                      {entry.user.fullname}
                    </Text>
                    <Text size="xs" c="dimmed">
                      @{entry.user.username}
                    </Text>
                  </Box>
                </Group>
                <Badge variant="light" color="blue" radius="sm">
                  {entry.totalScore} ball
                </Badge>
              </Group>
            ))}
          </Stack>
        </Paper>
      )}

    </Stack>
  );
};

export default UserMonthlyKpiLeaderboardView;
