"use client";

import { Paper, Text, Box } from "@mantine/core";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyTrend } from "../type/statistics.type";
import { colors } from "@/lib/colors";

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <Paper p="lg" radius="sm" withBorder style={{ borderColor: colors.border }}>
      <Text size="md" fw={600} c={colors.textPrimary} mb={4}>
        Oylik statistika
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Hujjatlar yaratilish tendensiyasi
      </Text>

      <Box h={280}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: colors.textDimmed }}
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
            <Area
              type="monotone"
              dataKey="documents"
              stroke={colors.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDocs)"
              name="Hujjatlar"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
