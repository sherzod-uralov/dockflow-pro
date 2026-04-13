"use client";

import { Paper, Text, Box, Group, Stack } from "@mantine/core";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DocumentsByType } from "../type/statistics.type";
import { colors } from "@/lib/colors";

interface DocumentTypeChartProps {
  data: DocumentsByType[];
}

// Jiddiy kulrang-ko'k tonlar
const COLORS = [colors.primary, colors.primaryHover, colors.textDimmed, colors.borderDark, colors.textMuted, colors.borderLight];

export function DocumentTypeChart({ data }: DocumentTypeChartProps) {
  const chartData = data.map((item) => ({
    name: item.documentType,
    value: item.count,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Paper p="lg" radius="sm" withBorder style={{ borderColor: colors.border }}>
      <Text size="md" fw={600} c={colors.textPrimary} mb={4}>
        Hujjat turlari
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Turlar bo'yicha taqsimot
      </Text>

      <Box h={240}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: 4,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Stack gap={6} mt="md">
        {chartData.map((item, index) => (
          <Group
            key={item.name}
            justify="space-between"
            py={6}
            px="sm"
            style={{ backgroundColor: colors.bg, borderRadius: 4 }}
          >
            <Group gap="sm">
              <Box
                w={12}
                h={12}
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                  borderRadius: 2,
                }}
              />
              <Text size="sm" c={colors.textSecondary}>
                {item.name}
              </Text>
            </Group>
            <Group gap={6}>
              <Text size="sm" fw={600} c={colors.textPrimary}>
                {item.value}
              </Text>
              <Text size="sm" c="dimmed">
                ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </Text>
            </Group>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
