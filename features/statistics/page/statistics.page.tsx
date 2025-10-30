"use client";

import { StatCard } from "../component/stat-card";
import { DocumentTypeChart } from "../component/document-type-chart";
import { DocumentStatusChart } from "../component/document-status-chart";
import { MonthlyTrendChart } from "../component/monthly-trend-chart";
import { DepartmentStatsChart } from "../component/department-stats-chart";
import { RecentActivities } from "../component/recent-activities";
import {
  FileText,
  Users,
  Building2,
  BookOpen,
  Workflow as WorkflowIcon,
  CheckSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const mockData = {
  overview: {
    totalDocuments: 1234,
    totalUsers: 156,
    totalDepartments: 12,
    totalJournals: 45,
    activeWorkflows: 23,
    pendingTasks: 67,
  },
  documentsByType: [
    { documentType: "Buyruq", count: 345, percentage: 28 },
    { documentType: "Xat", count: 289, percentage: 23 },
    { documentType: "Ma'lumotnoma", count: 234, percentage: 19 },
    { documentType: "Shartnoma", count: 187, percentage: 15 },
    { documentType: "Hisobot", count: 179, percentage: 15 },
  ],
  documentsByStatus: [
    { status: "Tasdiqlangan", count: 567, color: "#10b981" },
    { status: "Ko'rib chiqilmoqda", count: 345, color: "#f59e0b" },
    { status: "Rad etilgan", count: 123, color: "#ef4444" },
    { status: "Qoralama", count: 199, color: "#6b7280" },
  ],
  monthlyTrends: [
    { month: "Yan", documents: 234, users: 12 },
    { month: "Fev", documents: 289, users: 15 },
    { month: "Mar", documents: 312, users: 18 },
    { month: "Apr", documents: 356, users: 22 },
    { month: "May", documents: 401, users: 28 },
    { month: "Iyun", documents: 478, users: 32 },
  ],
  departmentStats: [
    { departmentName: "IT", documentCount: 156, userCount: 12 },
    { departmentName: "HR", documentCount: 234, userCount: 8 },
    { departmentName: "Moliya", documentCount: 189, userCount: 15 },
    { departmentName: "Marketing", documentCount: 123, userCount: 10 },
    { departmentName: "Huquqiy", documentCount: 98, userCount: 6 },
  ],
  recentActivities: [
    {
      id: "1",
      type: "document" as const,
      description: "Yangi hujjat qo'shildi: Buyruq #1234",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      user: "Alisher Karimov",
    },
    {
      id: "2",
      type: "user" as const,
      description: "Yangi foydalanuvchi ro'yxatdan o'tdi",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      user: "Sistem",
    },
    {
      id: "3",
      type: "workflow" as const,
      description: "Workflow yakunlandi: Tasdiqlash jarayoni",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      user: "Nodira Ahmadova",
    },
    {
      id: "4",
      type: "task" as const,
      description: "Vazifa bajarildi: Hisobot tayyorlash",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      user: "Bobur Sharipov",
    },
    {
      id: "5",
      type: "document" as const,
      description: "Hujjat tahrirlandi: Shartnoma #567",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      user: "Malika Tursunova",
    },
  ],
};

export default function StatisticsPage() {
  // const { data, isLoading } = useGetStatistics();
  const isLoading = false;
  const data = mockData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Jami Hujjatlar"
          value={data.overview.totalDocuments.toLocaleString()}
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          trend={{ value: 12.5, isPositive: true }}
          description="Tizimdagi barcha hujjatlar"
        />
        <StatCard
          title="Foydalanuvchilar"
          value={data.overview.totalUsers}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          trend={{ value: 8.2, isPositive: true }}
          description="Aktiv foydalanuvchilar"
        />
        <StatCard
          title="Bo'limlar"
          value={data.overview.totalDepartments}
          icon={Building2}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          description="Tashkilot bo'limlari"
        />
        <StatCard
          title="Jurnallar"
          value={data.overview.totalJournals}
          icon={BookOpen}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
          trend={{ value: 5.4, isPositive: true }}
          description="Hujjat jurnallari"
        />
        <StatCard
          title="Aktiv Workflow"
          value={data.overview.activeWorkflows}
          icon={WorkflowIcon}
          iconColor="text-pink-600"
          iconBgColor="bg-pink-50"
          description="Jarayondagi workflowlar"
        />
        <StatCard
          title="Kutilayotgan Vazifalar"
          value={data.overview.pendingTasks}
          icon={CheckSquare}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-50"
          trend={{ value: 3.1, isPositive: false }}
          description="Bajarilishi kerak vazifalar"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentTypeChart data={data.documentsByType} />
        <DocumentStatusChart data={data.documentsByStatus} />
      </div>

      <div className="grid gap-6">
        <MonthlyTrendChart data={data.monthlyTrends} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DepartmentStatsChart data={data.departmentStats} />
        <RecentActivities activities={data.recentActivities} />
      </div>
    </div>
  );
}
