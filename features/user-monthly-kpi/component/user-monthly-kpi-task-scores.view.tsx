"use client";

import {
  Box,
  Text,
  Group,
  Badge,
  Paper,
  Stack,
  Loader,
  Center,
  Accordion,
  Progress,
} from "@mantine/core";
import {
  IconClipboardCheck,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconTarget,
} from "@tabler/icons-react";
import { useGetUserMonthlyKpiTaskScores } from "../hook/user-monthly-kpi.hook";
import { UserMonthlyKpiTaskScore } from "../type/user-monthly-kpi.type";

interface UserMonthlyKpiTaskScoresViewProps {
  userId: string;
  year: number;
  month: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
  return `${day}-${months[date.getMonth()]}`;
};

const ScoreItem = ({ ts, index }: { ts: UserMonthlyKpiTaskScore; index: number }) => {
  const percentage = ts.baseScore > 0 ? Math.round((ts.earnedScore / ts.baseScore) * 100) : 0;
  const isLate = ts.daysLate > 0;
  const isPerfect = ts.earnedScore === ts.baseScore;

  return (
    <Accordion.Item value={ts.id}>
      <Accordion.Control>
        <Group justify="space-between" wrap="nowrap" pr="xs">
          <Group gap="sm" wrap="nowrap">
            <Box
              w={28} h={28}
              style={{
                borderRadius: 8,
                backgroundColor: isPerfect ? "#e6f9ee" : isLate ? "#fff3f3" : "#f0f4ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isPerfect ? (
                <IconCheck size={14} color="#2ecc71" />
              ) : isLate ? (
                <IconAlertTriangle size={14} color="#e74c3c" />
              ) : (
                <IconTarget size={14} color="#3498db" />
              )}
            </Box>
            <Box>
              <Text size="sm" fw={500} c="#212529">
                Vazifa #{index + 1}
              </Text>
              <Text size="xs" c="dimmed">
                {formatDate(ts.completedDate)} bajarildi
              </Text>
            </Box>
          </Group>
          <Group gap="sm" wrap="nowrap">
            {isLate && (
              <Badge variant="light" color="red" size="xs" radius="sm">
                {ts.daysLate} kun kech
              </Badge>
            )}
            <Badge
              variant="light"
              color={isPerfect ? "green" : isLate ? "orange" : "blue"}
              size="lg"
              radius="sm"
              fw={700}
            >
              {ts.earnedScore}/{ts.baseScore}
            </Badge>
          </Group>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm" pl={40}>
          {/* Progress bar */}
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">Samaradorlik</Text>
              <Text size="xs" fw={600} c={isPerfect ? "#2ecc71" : "#495057"}>{percentage}%</Text>
            </Group>
            <Progress
              value={percentage}
              size="sm"
              radius="xl"
              color={isPerfect ? "green" : isLate ? "orange" : "blue"}
            />
          </Box>

          {/* Details grid */}
          <Group gap="lg">
            <Box>
              <Text size="xs" c="dimmed">Asosiy ball</Text>
              <Text size="sm" fw={600}>{ts.baseScore}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">Olingan</Text>
              <Text size="sm" fw={600} c={isPerfect ? "#2ecc71" : "#495057"}>{ts.earnedScore}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">Jarima</Text>
              <Text size="sm" fw={600} c={ts.penaltyApplied > 0 ? "#e74c3c" : "#495057"}>
                {ts.penaltyApplied > 0 ? `-${ts.penaltyApplied}` : "0"}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">Muddat</Text>
              <Text size="sm" fw={500}>{formatDate(ts.dueDate)}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">Kunlik jarima</Text>
              <Text size="sm" fw={500}>{ts.breakdown.penaltyPerDay}</Text>
            </Box>
          </Group>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

const UserMonthlyKpiTaskScoresView = ({ userId, year, month }: UserMonthlyKpiTaskScoresViewProps) => {
  const { data: taskScores, isLoading } = useGetUserMonthlyKpiTaskScores({ userId, year, month });

  if (isLoading) {
    return (
      <Center py={40}>
        <Loader size="md" />
      </Center>
    );
  }

  if (!taskScores || taskScores.length === 0) {
    return (
      <Center py={40}>
        <Stack align="center" gap="md">
          <Box p={16} style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}>
            <IconClipboardCheck size={40} color="#868e96" stroke={1.5} />
          </Box>
          <Text size="lg" fw={500} c="#495057">
            Vazifa ballari topilmadi
          </Text>
        </Stack>
      </Center>
    );
  }

  const totalEarned = taskScores.reduce((sum: number, ts: UserMonthlyKpiTaskScore) => sum + ts.earnedScore, 0);
  const totalBase = taskScores.reduce((sum: number, ts: UserMonthlyKpiTaskScore) => sum + ts.baseScore, 0);
  const totalPenalty = taskScores.reduce((sum: number, ts: UserMonthlyKpiTaskScore) => sum + ts.penaltyApplied, 0);
  const onTimeCount = taskScores.filter((ts: UserMonthlyKpiTaskScore) => ts.daysLate === 0).length;
  const overallPercent = totalBase > 0 ? Math.round((totalEarned / totalBase) * 100) : 0;

  return (
    <Stack gap="md">
      {/* Summary cards */}
      <Group gap="sm" grow>
        <Paper p="sm" radius="sm" style={{ backgroundColor: "#f0f4ff", border: "1px solid #dbe4ff" }}>
          <Group gap={8}>
            <IconTarget size={16} color="#3498db" />
            <Text size="xs" c="#3498db" fw={600}>Yakuniy</Text>
          </Group>
          <Text size="xl" fw={700} c="#1e3a5f" mt={4}>{totalEarned}</Text>
          <Text size="xs" c="dimmed">{totalBase} dan</Text>
        </Paper>
        <Paper p="sm" radius="sm" style={{ backgroundColor: totalPenalty > 0 ? "#fff3f3" : "#f8f9fa", border: `1px solid ${totalPenalty > 0 ? "#fde2e2" : "#e9ecef"}` }}>
          <Group gap={8}>
            <IconAlertTriangle size={16} color={totalPenalty > 0 ? "#e74c3c" : "#adb5bd"} />
            <Text size="xs" c={totalPenalty > 0 ? "#e74c3c" : "dimmed"} fw={600}>Jarima</Text>
          </Group>
          <Text size="xl" fw={700} c={totalPenalty > 0 ? "#e74c3c" : "#495057"} mt={4}>
            {totalPenalty > 0 ? `-${totalPenalty}` : "0"}
          </Text>
        </Paper>
        <Paper p="sm" radius="sm" style={{ backgroundColor: "#e6f9ee", border: "1px solid #c3e6cb" }}>
          <Group gap={8}>
            <IconCheck size={16} color="#2ecc71" />
            <Text size="xs" c="#2ecc71" fw={600}>O'z vaqtida</Text>
          </Group>
          <Text size="xl" fw={700} c="#212529" mt={4}>{onTimeCount}/{taskScores.length}</Text>
          <Text size="xs" c="dimmed">{overallPercent}% samaradorlik</Text>
        </Paper>
      </Group>

      {/* Accordion list */}
      <Accordion
        variant="separated"
        radius="sm"
        defaultValue={taskScores.length <= 5 ? taskScores.map((ts: UserMonthlyKpiTaskScore) => ts.id) : undefined}
        multiple
        styles={{
          item: { border: "1px solid #e9ecef", backgroundColor: "#fff" },
          control: { padding: "10px 12px" },
          panel: { padding: "0 12px 12px" },
        }}
      >
        {taskScores.map((ts: UserMonthlyKpiTaskScore, index: number) => (
          <ScoreItem key={ts.id} ts={ts} index={index} />
        ))}
      </Accordion>
    </Stack>
  );
};

export default UserMonthlyKpiTaskScoresView;
