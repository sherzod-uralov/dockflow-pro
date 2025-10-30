"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { DocumentsByStatus } from "../type/statistics.type";

interface DocumentStatusChartProps {
  data: DocumentsByStatus[];
}

export function DocumentStatusChart({ data }: DocumentStatusChartProps) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    color: item.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hujjatlar Holati</CardTitle>
        <CardDescription>
          Hujjatlar holatiga ko'ra taqsimot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{item.status}</p>
                <p className="text-sm font-semibold">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
