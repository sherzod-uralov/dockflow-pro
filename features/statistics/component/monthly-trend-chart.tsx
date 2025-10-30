"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyTrend } from "../type/statistics.type";

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oylik Trend</CardTitle>
        <CardDescription>
          Hujjatlar va foydalanuvchilar o'sish tendensiyasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="documents"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Hujjatlar"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#10b981"
              strokeWidth={2}
              name="Foydalanuvchilar"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
