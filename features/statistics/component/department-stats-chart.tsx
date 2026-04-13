"use client";

import { Paper, Text, Box } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DepartmentStatistics } from "../type/statistics.type";
import { colors } from "@/lib/colors";

interface DepartmentStatsChartProps {
  data: DepartmentStatistics[];
}

export function DepartmentStatsChart({ data }: DepartmentStatsChartProps) {
  return (
    <Paper p="lg" radius="sm" withBorder style={{ borderColor: colors.border }}>
      <Text size="md" fw={600} c={colors.textPrimary} mb={4}>
        Bo'limlar statistikasi
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Hujjatlar va foydalanuvchilar soni
      </Text>

      <Box h={280}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              dataKey="departmentName"
              tick={{ fontSize: 11, fill: colors.textDimmed }}
              axisLine={{ stroke: colors.borderLight }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: colors.textDimmed }}
              axisLine={{ stroke: colors.borderLight }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: 4,
                fontSize: 13,
              }}
              labelStyle={{ fontWeight: 600, color: colors.textPrimary }}
            />
            <Legend
              wrapperStyle={{ fontSize: 13 }}
            />
            <Bar
              dataKey="documentCount"
              fill={colors.primary}
              name="Hujjatlar"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="userCount"
              fill={colors.textDimmed}
              name="Foydalanuvchilar"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
