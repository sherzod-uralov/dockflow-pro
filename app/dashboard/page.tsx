"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import { Home, FileText, Users, Building2, Workflow as WorkflowIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyTasks from "@/features/workflow/component/my-tasks";
import { StatCard } from "@/features/statistics/component/stat-card";
import { useDashboardAnalytics } from "@/features/statistics/hook/statistics.hook";
import { TimeRange } from "@/features/statistics/type/statistics.type";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const dashboardQuery = useDashboardAnalytics({ timeRange: TimeRange.MONTH });

  const formatTrend = (value: number | null | undefined) => {
    if (value === null || value === undefined) return undefined;
    return {
      value: Math.abs(value),
      isPositive: value >= 0,
    };
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Bosh sahifa"
          description="Tizim ko'rsatkichlari va sizning vazifalaringiz"
          items={[
            {
              label: "Bosh sahifa",
              href: "/dashboard",
              icon: <Home size={16} />,
            },
          ]}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="documents">Hujjatlar</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="tasks">Mening vazifalarim</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {dashboardQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Jami Hujjatlar"
                value={
                  dashboardQuery.data?.totalDocuments.value.toLocaleString() || 0
                }
                icon={FileText}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-50"
                trend={formatTrend(
                  dashboardQuery.data?.totalDocuments.changePercentage,
                )}
                description="Tizimdagi barcha hujjatlar"
              />
              <StatCard
                title="Aktiv Foydalanuvchilar"
                value={
                  dashboardQuery.data?.activeUsers.value.toLocaleString() || 0
                }
                icon={Users}
                iconColor="text-green-600"
                iconBgColor="bg-green-50"
                trend={formatTrend(
                  dashboardQuery.data?.activeUsers.changePercentage,
                )}
                description="Faol foydalanuvchilar soni"
              />
              <StatCard
                title="Bo'limlar"
                value={dashboardQuery.data?.totalDepartments || 0}
                icon={Building2}
                iconColor="text-purple-600"
                iconBgColor="bg-purple-50"
                description="Tashkilot bo'limlari"
              />
              <StatCard
                title="Aktiv Workflow"
                value={dashboardQuery.data?.activeWorkflows || 0}
                icon={WorkflowIcon}
                iconColor="text-pink-600"
                iconBgColor="bg-pink-50"
                description="Jarayondagi workflowlar"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <div className="text-center py-12 text-muted-foreground">
            Hujjatlar bo'limi ishlab chiqilmoqda...
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <MyTasks />
        </TabsContent>

        <TabsContent value="tasks">
          <MyTasks />
        </TabsContent>
      </Tabs>
    </>
  );
}
