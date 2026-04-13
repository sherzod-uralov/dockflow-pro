"use client";

import {
  Box,
  Text,
  Group,
  Paper,
  Stack,
  Loader,
  Center,
  Badge,
  Progress,
  SimpleGrid,
  ThemeIcon,
  Avatar,
  RingProgress,
} from "@mantine/core";
import {
  IconTrophy,
  IconTarget,
  IconCheck,
  IconAlertTriangle,
  IconTrendingUp,
  IconUsers,
  IconCurrencyDollar,
  IconAward,
  IconClipboardCheck,
  IconChartBar,
  IconCalendar,
} from "@tabler/icons-react";
import { useGetKpiAnalytics } from "../hook/kpi-analytics.hook";
import {
  KpiAnalyticsParams,
  KpiTrendPoint,
  KpiTopTask,
  KpiLeaderboardEntry,
} from "../type/kpi-analytics.type";

const MONTH_LABELS = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];

const formatNumber = (n?: number) =>
  typeof n === "number" ? n.toLocaleString("uz-UZ") : "0";

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  color = colors.primary,
  bg = colors.bg,
  border = colors.border,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  bg?: string;
  border?: string;
}) => (
  <Paper p="md" radius="sm" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
    <Group gap="xs" mb={6}>
      <ThemeIcon size={28} radius="sm" variant="light" style={{ color, backgroundColor: "transparent" }}>
        <Icon size={18} />
      </ThemeIcon>
      <Text size="xs" fw={600} c={color} tt="uppercase">
        {label}
      </Text>
    </Group>
    <Text fw={700} c={color} style={{ fontSize: 26, lineHeight: 1.1 }}>
      {value}
    </Text>
    {subtitle && (
      <Text size="xs" c="dimmed" mt={4}>
        {subtitle}
      </Text>
    )}
  </Paper>
);

const TrendChart = ({ trend }: { trend: KpiTrendPoint[] }) => {
  if (!trend?.length) return null;
  const max = Math.max(...trend.map((t) => t.finalScore), 100);

  return (
    <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
      <Group gap="xs" mb="md">
        <IconTrendingUp size={18} color={colors.primary} />
        <Text size="sm" fw={600} c={colors.textPrimary}>
          Oxirgi 12 oylik dinamika
        </Text>
      </Group>
      <Box style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "0 4px" }}>
        {trend.map((t, i) => {
          const heightPct = (t.finalScore / max) * 100;
          const isFull = t.finalScore >= 100;
          return (
            <Box key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Text size="xs" fw={600} c={colors.textSecondary}>
                {t.finalScore}
              </Text>
              <Box
                style={{
                  width: "100%",
                  height: `${heightPct}%`,
                  minHeight: 4,
                  borderRadius: "4px 4px 0 0",
                  backgroundColor: isFull ? colors.success : colors.primary,
                  transition: "height 0.3s",
                }}
              />
              <Text size="xs" c="dimmed">
                {MONTH_LABELS[t.month - 1]}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
import { colors } from "@/lib/colors";

const LeaderboardMini = ({
  entries,
  currentUserId,
}: {
  entries: KpiLeaderboardEntry[];
  currentUserId?: string;
}) => {
  if (!entries?.length) return null;

  return (
    <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
      <Group gap="xs" mb="md">
        <IconTrophy size={18} color={colors.warning} />
        <Text size="sm" fw={600} c={colors.textPrimary}>
          Reyting (Top {entries.length})
        </Text>
      </Group>
      <Stack gap="xs">
        {entries.slice(0, 10).map((e) => {
          const isMe = e.userId === currentUserId;
          return (
            <Group
              key={e.userId}
              gap="sm"
              p="xs"
              style={{
                backgroundColor: isMe ? colors.primaryLight : "transparent",
                borderRadius: 6,
                border: isMe ? `1px solid ${colors.infoBg}` : "1px solid transparent",
              }}
            >
              <Text size="sm" fw={700} c={e.rank <= 3 ? colors.warning : "dimmed"} w={24} ta="center">
                {e.rank}
              </Text>
              <Avatar size={28} radius="xl" src={e.user.avatarUrl} color="blue">
                {e.user.fullname?.charAt(0)}
              </Avatar>
              <Text size="sm" fw={isMe ? 600 : 500} c={colors.textPrimary} style={{ flex: 1 }} lineClamp={1}>
                {e.user.fullname}
              </Text>
              <Badge variant="light" color={e.rank <= 3 ? "yellow" : "blue"} size="sm">
                {e.finalScore}
              </Badge>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
};

const TopTasksList = ({ tasks, title, icon: Icon }: { tasks: KpiTopTask[]; title: string; icon: any }) => {
  if (!tasks?.length) return null;
  return (
    <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
      <Group gap="xs" mb="md">
        <Icon size={18} color={colors.primary} />
        <Text size="sm" fw={600} c={colors.textPrimary}>
          {title}
        </Text>
      </Group>
      <Stack gap="xs">
        {tasks.slice(0, 5).map((t) => (
          <Group key={t.id} gap="sm" justify="space-between">
            <Text size="sm" c={colors.textSecondary} lineClamp={1} style={{ flex: 1 }}>
              {t.title || `Vazifa ${(t.taskId || t.id || "").slice(0, 8)}`}
            </Text>
            <Badge variant="light" color="blue" size="sm" radius="sm">
              {t.earnedScore}/{t.baseScore}
            </Badge>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};

interface KpiAnalyticsViewProps {
  year?: number;
  month?: number;
  userId?: string;
  currentUserId?: string;
}

export const KpiAnalyticsView = ({ year, month, userId, currentUserId }: KpiAnalyticsViewProps) => {
  const params: KpiAnalyticsParams = { year, month, userId };
  const { data, isLoading } = useGetKpiAnalytics(params);

  if (isLoading) {
    return (
      <Center py={60}>
        <Loader size="md" color={colors.primary} />
      </Center>
    );
  }

  if (!data) {
    return (
      <Center py={60}>
        <Stack align="center" gap="md">
          <ThemeIcon size={60} radius="md" variant="light" color="gray">
            <IconChartBar size={30} />
          </ThemeIcon>
          <Text c="dimmed">Statistika topilmadi</Text>
        </Stack>
      </Center>
    );
  }

  const personal = data.personal || {
    finalScore: 0,
    totalBaseScore: 0,
    totalEarnedScore: 0,
    totalPenalty: 0,
    tasksCompleted: 0,
    tasksOnTime: 0,
    tasksLate: 0,
    isFullScore: false,
    consecutiveFullMonths: 0,
    position: undefined,
    totalUsers: undefined,
  };
  const trend = data.trend || [];
  const scoreBreakdown = data.scoreBreakdown || {
    byPriority: {},
    onTimeCount: 0,
    lateCount: 0,
    totalPenalty: 0,
    averageDaysLate: 0,
  };
  const topTasks = data.topTasks || [];
  const recentCompletedTasks = data.recentCompletedTasks || [];
  const department = data.department;
  const leaderboard = data.leaderboard || [];
  const companyStats = data.companyStats;
  const rewards = data.rewards || [];

  const onTimePercent =
    personal.tasksCompleted > 0
      ? Math.round((personal.tasksOnTime / personal.tasksCompleted) * 100)
      : 0;

  return (
    <Stack gap="md">
      {/* Personal stat cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <StatCard
          icon={IconTarget}
          label="Yakuniy ball"
          value={personal.finalScore}
          subtitle={`${personal.totalEarnedScore}/${personal.totalBaseScore}`}
          color={colors.primary}
          bg={colors.infoLight}
          border={colors.infoBg}
        />
        <StatCard
          icon={IconCheck}
          label="Bajarilgan"
          value={personal.tasksCompleted}
          subtitle={`${personal.tasksOnTime} o'z vaqtida (${onTimePercent}%)`}
          color={colors.success}
          bg={colors.successLight}
          border={colors.successBg}
        />
        <StatCard
          icon={IconAlertTriangle}
          label="Jarima"
          value={`-${personal.totalPenalty}`}
          subtitle={`${personal.tasksLate} ta kech`}
          color={personal.totalPenalty > 0 ? colors.error : colors.textDimmed}
          bg={personal.totalPenalty > 0 ? colors.errorLight : colors.bg}
          border={personal.totalPenalty > 0 ? colors.errorBg : colors.border}
        />
        <StatCard
          icon={IconTrophy}
          label="O'rin"
          value={personal.position ? `#${personal.position}` : "-"}
          subtitle={personal.totalUsers ? `${personal.totalUsers} foydalanuvchidan` : ""}
          color={colors.warning}
          bg={colors.warningLight}
          border={colors.warningLight}
        />
      </SimpleGrid>

      {/* Trend chart */}
      <TrendChart trend={trend} />

      {/* Two columns: Score breakdown + Department */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="md">
            <IconChartBar size={18} color={colors.primary} />
            <Text size="sm" fw={600} c={colors.textPrimary}>
              Samaradorlik tahlili
            </Text>
          </Group>
          <Center py="sm">
            <RingProgress
              size={140}
              thickness={14}
              roundCaps
              sections={[
                {
                  value: onTimePercent,
                  color: colors.success,
                  tooltip: `O'z vaqtida ${personal.tasksOnTime}`,
                },
                {
                  value: 100 - onTimePercent,
                  color: colors.error,
                  tooltip: `Kech ${personal.tasksLate}`,
                },
              ]}
              label={
                <Center>
                  <Stack gap={0} align="center">
                    <Text size="xl" fw={700} c={colors.primary}>
                      {onTimePercent}%
                    </Text>
                    <Text size="xs" c="dimmed">
                      o'z vaqtida
                    </Text>
                  </Stack>
                </Center>
              }
            />
          </Center>
          <SimpleGrid cols={2} spacing="xs" mt="sm">
            <Box>
              <Text size="xs" c="dimmed">O'rtacha kechikish</Text>
              <Text size="sm" fw={600} c={colors.textPrimary}>
                {(scoreBreakdown.averageDaysLate || 0).toFixed(1)} kun
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">Ketma-ket to'liq oylar</Text>
              <Text size="sm" fw={600} c={colors.success}>
                {personal.consecutiveFullMonths}
              </Text>
            </Box>
          </SimpleGrid>
        </Paper>

        {department && (
          <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
            <Group gap="xs" mb="md">
              <IconUsers size={18} color={colors.primary} />
              <Text size="sm" fw={600} c={colors.textPrimary}>
                Bo'lim statistikasi
              </Text>
              {department.isEligibleForTeamReward && (
                <Badge variant="light" color="green" size="xs">
                  Mukofot huquqi
                </Badge>
              )}
            </Group>
            <Text size="md" fw={600} c={colors.primary} mb="xs">
              {department.department.name}
            </Text>
            <SimpleGrid cols={2} spacing="md">
              <Box>
                <Text size="xs" c="dimmed">O'rtacha ball</Text>
                <Text fw={700} c={colors.primary} style={{ fontSize: 22 }}>
                  {(department.averageScore || 0).toFixed(1)}
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">A'zolar</Text>
                <Text fw={700} c={colors.primary} style={{ fontSize: 22 }}>
                  {department.totalUsers}
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">85+ ball</Text>
                <Text fw={600} c={colors.success}>
                  {department.usersAbove85} / {department.totalUsers}
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">100 ball</Text>
                <Text fw={600} c={colors.warning}>
                  {department.usersAt100}
                </Text>
              </Box>
            </SimpleGrid>
          </Paper>
        )}
      </SimpleGrid>

      {/* Top tasks + Recent */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <TopTasksList tasks={topTasks} title="Eng ko'p ball olgan vazifalar" icon={IconAward} />
        <TopTasksList
          tasks={recentCompletedTasks}
          title="Oxirgi yakunlangan vazifalar"
          icon={IconClipboardCheck}
        />
      </SimpleGrid>

      {/* Leaderboard */}
      <LeaderboardMini entries={leaderboard} currentUserId={currentUserId || userId} />

      {/* Company stats */}
      {companyStats && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="md">
            <IconUsers size={18} color={colors.primary} />
            <Text size="sm" fw={600} c={colors.textPrimary}>
              Kompaniya statistikasi
            </Text>
          </Group>
          <SimpleGrid cols={{ base: 2, md: 6 }} spacing="md">
            <Box>
              <Text size="xs" c="dimmed">Foydalanuvchilar</Text>
              <Text fw={700} c={colors.primary} style={{ fontSize: 20 }}>
                {companyStats.totalUsers}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">O'rtacha ball</Text>
              <Text fw={700} c={colors.primary} style={{ fontSize: 20 }}>
                {(companyStats.averageScore || 0).toFixed(1)}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">100 ball</Text>
              <Text fw={700} c={colors.warning} style={{ fontSize: 20 }}>
                {companyStats.usersAt100}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">85+ ball</Text>
              <Text fw={700} c={colors.success} style={{ fontSize: 20 }}>
                {companyStats.usersAbove85}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">50 dan kam</Text>
              <Text fw={700} c={colors.error} style={{ fontSize: 20 }}>
                {companyStats.usersBelow50}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">Bajarilgan vazifalar</Text>
              <Text fw={700} c={colors.primary} style={{ fontSize: 20 }}>
                {formatNumber(companyStats.totalTasksCompleted)}
              </Text>
            </Box>
          </SimpleGrid>
        </Paper>
      )}

      {/* Rewards history */}
      {rewards && rewards.length > 0 && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="md">
            <IconCurrencyDollar size={18} color={colors.success} />
            <Text size="sm" fw={600} c={colors.textPrimary}>
              Mukofotlar tarixi
            </Text>
          </Group>
          <Stack gap="xs">
            {rewards.slice(0, 6).map((r) => (
              <Group key={r.id} justify="space-between">
                <Group gap="sm">
                  <IconCalendar size={14} color={colors.textDimmed} />
                  <Text size="sm" c={colors.textSecondary}>
                    {MONTH_LABELS[r.month - 1]} {r.year}
                  </Text>
                  {r.rewardTier && (
                    <Badge variant="light" color={r.rewardTier.color || "blue"} size="xs">
                      {r.rewardTier.name}
                    </Badge>
                  )}
                </Group>
                <Group gap="xs">
                  <Text size="sm" fw={600} c={colors.success}>
                    {formatNumber(r.rewardAmount)} so'm
                  </Text>
                  <Badge variant="light" size="xs" color={r.status === "PAID" ? "green" : "yellow"}>
                    {r.status}
                  </Badge>
                </Group>
              </Group>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default KpiAnalyticsView;
