"use client";

import { useState } from "react";
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
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import {
  IconClipboardCheck,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconTarget,
  IconExternalLink,
} from "@tabler/icons-react";
import { useGetUserMonthlyKpiTaskScores } from "../hook/user-monthly-kpi.hook";
import { UserMonthlyKpiTaskScore } from "../type/user-monthly-kpi.type";
import { TaskDetailDrawer } from "@/features/task/component/task-detail-drawer";
import { formatDate } from "@/lib/date-utils";
import { colors } from "@/lib/colors";

interface UserMonthlyKpiTaskScoresViewProps {
  userId: string;
  year: number;
  month: number;
}


const ScoreItem = ({
  ts,
  index,
  onOpenTask,
}: {
  ts: UserMonthlyKpiTaskScore;
  index: number;
  onOpenTask: (taskId: string) => void;
}) => {
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
                backgroundColor: isPerfect ? colors.successLight : isLate ? colors.errorLight : colors.infoLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isPerfect ? (
                <IconCheck size={14} color={colors.success} />
              ) : isLate ? (
                <IconAlertTriangle size={14} color={colors.error} />
              ) : (
                <IconTarget size={14} color={colors.info} />
              )}
            </Box>
            <Box>
              <Text size="sm" fw={500} c={colors.textPrimary}>
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
            <Tooltip label="Vazifani ko'rish">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="md"
                radius="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTask(ts.taskId);
                }}
              >
                <IconExternalLink size={16} />
              </ActionIcon>
            </Tooltip>
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
              <Text size="xs" fw={600} c={isPerfect ? colors.success : colors.textSecondary}>{percentage}%</Text>
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
              <Text size="sm" fw={600} c={isPerfect ? colors.success : colors.textSecondary}>{ts.earnedScore}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">Jarima</Text>
              <Text size="sm" fw={600} c={ts.penaltyApplied > 0 ? colors.error : colors.textSecondary}>
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
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

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
          <Box p={16} style={{ backgroundColor: colors.bgSubtle, borderRadius: 12 }}>
            <IconClipboardCheck size={40} color={colors.textDimmed} stroke={1.5} />
          </Box>
          <Text size="lg" fw={500} c={colors.textSecondary}>
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
        <Paper p="sm" radius="sm" style={{ backgroundColor: colors.infoLight, border: `1px solid ${colors.infoBg}` }}>
          <Group gap={8}>
            <IconTarget size={16} color={colors.info} />
            <Text size="xs" c={colors.info} fw={600}>Yakuniy</Text>
          </Group>
          <Text size="xl" fw={700} c={colors.primary} mt={4}>{totalEarned}</Text>
          <Text size="xs" c="dimmed">{totalBase} dan</Text>
        </Paper>
        <Paper p="sm" radius="sm" style={{ backgroundColor: totalPenalty > 0 ? colors.errorLight : colors.bg, border: `1px solid ${totalPenalty > 0 ? colors.errorBg : colors.border}` }}>
          <Group gap={8}>
            <IconAlertTriangle size={16} color={totalPenalty > 0 ? colors.error : colors.textMuted} />
            <Text size="xs" c={totalPenalty > 0 ? colors.error : "dimmed"} fw={600}>Jarima</Text>
          </Group>
          <Text size="xl" fw={700} c={totalPenalty > 0 ? colors.error : colors.textSecondary} mt={4}>
            {totalPenalty > 0 ? `-${totalPenalty}` : "0"}
          </Text>
          <Text size="xs" c="dimmed">jami ball</Text>
        </Paper>
        <Paper p="sm" radius="sm" style={{ backgroundColor: colors.successLight, border: `1px solid ${colors.successBg}` }}>
          <Group gap={8}>
            <IconCheck size={16} color={colors.success} />
            <Text size="xs" c={colors.success} fw={600}>O'z vaqtida</Text>
          </Group>
          <Text size="xl" fw={700} c={colors.textPrimary} mt={4}>{onTimeCount}/{taskScores.length}</Text>
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
          item: { border: `1px solid ${colors.border}`, backgroundColor: colors.white },
          control: { padding: "10px 12px" },
          panel: { padding: "0 12px 12px" },
        }}
      >
        {taskScores.map((ts: UserMonthlyKpiTaskScore, index: number) => (
          <ScoreItem key={ts.id} ts={ts} index={index} onOpenTask={setOpenTaskId} />
        ))}
      </Accordion>

      <TaskDetailDrawer
        taskId={openTaskId}
        isOpen={!!openTaskId}
        onClose={() => setOpenTaskId(null)}
      />
    </Stack>
  );
};

export default UserMonthlyKpiTaskScoresView;
