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

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
      <Text size="md" fw={600} c="#212529" mb={4}>
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
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#868e96" }}
              axisLine={{ stroke: "#dee2e6" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#868e96" }}
              axisLine={{ stroke: "#dee2e6" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #dee2e6",
                borderRadius: 4,
                fontSize: 13,
              }}
              labelStyle={{ fontWeight: 600, color: "#212529" }}
            />
            <Area
              type="monotone"
              dataKey="documents"
              stroke="#1e3a5f"
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
