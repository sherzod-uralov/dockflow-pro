"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Bo'limlar Statistikasi</CardTitle>
        <CardDescription>
          Bo'limlardagi hujjatlar va foydalanuvchilar soni
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="departmentName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="documentCount"
              fill="#3b82f6"
              name="Hujjatlar"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="userCount"
              fill="#10b981"
              name="Foydalanuvchilar"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
