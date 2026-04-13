"use client";

import { Paper, Text, Box, Group, Stack, Progress } from "@mantine/core";
import type { DocumentStatusChartData } from "../type/statistics.type";
import { colors } from "@/lib/colors";

interface DocumentStatusChartProps {
  data: DocumentStatusChartData[];
}

// Status ranglari - tushunarli va jiddiy
const STATUS_COLORS: Record<string, string> = {
  "Tayyorlanmoqda": colors.textSecondary,
  "Jarayonda": colors.warningDark,
  "Tekshiruvda": colors.infoDark,
  "Tasdiqlangan": colors.successDark,
  "Bekor qilingan": colors.errorDark,
  "Arxiv": colors.textDimmed,
  "Chop etilgan": colors.successDark,
};

export function DocumentStatusChart({ data }: DocumentStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Paper p="lg" radius="sm" withBorder style={{ borderColor: colors.border }}>
      <Text size="md" fw={600} c={colors.textPrimary} mb={4}>
        Hujjatlar holati
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Holatlar bo'yicha taqsimot
      </Text>

      <Stack gap="md">
        {data.map((item) => {
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = STATUS_COLORS[item.status] || colors.textDimmed;
          return (
            <Box key={item.status}>
              <Group justify="space-between" mb={6}>
                <Text size="sm" c={colors.textSecondary}>
                  {item.status}
                </Text>
                <Group gap={6}>
                  <Text size="sm" fw={600} c={colors.textPrimary}>
                    {item.count}
                  </Text>
                  <Text size="sm" c="dimmed">
                    ({percentage}%)
                  </Text>
                </Group>
              </Group>
              <Progress
                value={percentage}
                size="md"
                radius="sm"
                color={color}
              />
            </Box>
          );
        })}
      </Stack>

      {total > 0 && (
        <Box
          mt="lg"
          p="md"
          style={{
            backgroundColor: colors.bg,
            borderRadius: 4,
          }}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Jami hujjatlar
            </Text>
            <Text size="md" fw={700} c={colors.textPrimary}>
              {total.toLocaleString()}
            </Text>
          </Group>
        </Box>
      )}
    </Paper>
  );
}
