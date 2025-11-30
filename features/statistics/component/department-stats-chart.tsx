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

interface DepartmentStatsChartProps {
  data: DepartmentStatistics[];
}

export function DepartmentStatsChart({ data }: DepartmentStatsChartProps) {
  return (
    <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
      <Text size="md" fw={600} c="#212529" mb={4}>
        Bo'limlar statistikasi
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Hujjatlar va foydalanuvchilar soni
      </Text>

      <Box h={280}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis
              dataKey="departmentName"
              tick={{ fontSize: 11, fill: "#868e96" }}
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
            <Legend
              wrapperStyle={{ fontSize: 13 }}
            />
            <Bar
              dataKey="documentCount"
              fill="#1e3a5f"
              name="Hujjatlar"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="userCount"
              fill="#5c7a99"
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
