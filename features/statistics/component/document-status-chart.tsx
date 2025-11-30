"use client";

import { Paper, Text, Box, Group, Stack, Progress } from "@mantine/core";
import type { DocumentStatusChartData } from "../type/statistics.type";

interface DocumentStatusChartProps {
  data: DocumentStatusChartData[];
}

// Status ranglari - tushunarli va jiddiy
const STATUS_COLORS: Record<string, string> = {
  "Tayyorlanmoqda": "#495057",
  "Jarayonda": "#e67700",
  "Tekshiruvda": "#1971c2",
  "Tasdiqlangan": "#2b8a3e",
  "Bekor qilingan": "#c92a2a",
  "Arxiv": "#868e96",
  "Chop etilgan": "#2b8a3e",
};

export function DocumentStatusChart({ data }: DocumentStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
      <Text size="md" fw={600} c="#212529" mb={4}>
        Hujjatlar holati
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Holatlar bo'yicha taqsimot
      </Text>

      <Stack gap="md">
        {data.map((item) => {
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = STATUS_COLORS[item.status] || "#868e96";
          return (
            <Box key={item.status}>
              <Group justify="space-between" mb={6}>
                <Text size="sm" c="#495057">
                  {item.status}
                </Text>
                <Group gap={6}>
                  <Text size="sm" fw={600} c="#212529">
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
            backgroundColor: "#f8f9fa",
            borderRadius: 4,
          }}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Jami hujjatlar
            </Text>
            <Text size="md" fw={700} c="#212529">
              {total.toLocaleString()}
            </Text>
          </Group>
        </Box>
      )}
    </Paper>
  );
}
