"use client";

import { useState } from "react";
import { StatCard } from "../component/stat-card";
import { DocumentTypeChart } from "../component/document-type-chart";
import { DocumentStatusChart } from "../component/document-status-chart";
import { MonthlyTrendChart } from "../component/monthly-trend-chart";
import { DepartmentStatsChart } from "../component/department-stats-chart";
import { AnalyticsFiltersComponent } from "../component/analytics-filters";
import {
  FileText,
  Users,
  Building2,
  BookOpen,
  Workflow as WorkflowIcon,
  CheckSquare,
  TrendingUp,
  Clock,
  AlertCircle,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useDashboardAnalytics,
  useDocumentAnalytics,
  useWorkflowAnalytics,
  useUserAnalytics,
} from "../hook/statistics.hook";
import { AnalyticsFilters, TimeRange } from "../type/statistics.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StatisticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: TimeRange.MONTH,
  });

  const dashboardQuery = useDashboardAnalytics(filters);
  const documentsQuery = useDocumentAnalytics(filters);
  const workflowsQuery = useWorkflowAnalytics(filters);
  const usersQuery = useUserAnalytics(filters);

  const isLoading =
    dashboardQuery.isLoading ||
    documentsQuery.isLoading ||
    workflowsQuery.isLoading ||
    usersQuery.isLoading;

  // Show error only if ALL queries fail
  const allFailed =
    dashboardQuery.isError &&
    documentsQuery.isError &&
    workflowsQuery.isError &&
    usersQuery.isError;

  if (allFailed) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Statistika ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos,
            qayta urinib ko'ring.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatTrend = (value: number | null | undefined) => {
    if (value === null || value === undefined) return undefined;
    return {
      value: Math.abs(value),
      isPositive: value >= 0,
    };
  };

  const transformDocumentStatusData = () => {
    if (!documentsQuery.data?.documentsByStatus) return [];

    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: "Qoralama", color: "#6b7280" },
      pending: { label: "Kutilmoqda", color: "#f59e0b" },
      inReview: { label: "Ko'rib chiqilmoqda", color: "#3b82f6" },
      approved: { label: "Tasdiqlangan", color: "#10b981" },
      rejected: { label: "Rad etilgan", color: "#ef4444" },
      archived: { label: "Arxivlangan", color: "#8b5cf6" },
    };

    return Object.entries(documentsQuery.data.documentsByStatus).map(
      ([key, value]) => ({
        status: statusMap[key]?.label || key,
        count: value,
        color: statusMap[key]?.color || "#6b7280",
      }),
    );
  };

  // Transform document type data for chart
  const transformDocumentTypeData = () => {
    if (!documentsQuery.data?.documentsByType) return [];

    const total = documentsQuery.data.documentsByType.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    return documentsQuery.data.documentsByType.map((item) => ({
      documentType: item.typeName,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  };

  // Transform department data for chart
  const transformDepartmentData = () => {
    if (!usersQuery.data?.departmentActivity) return [];

    return usersQuery.data.departmentActivity.map((dept) => ({
      departmentName: dept.departmentName,
      documentCount: dept.documentsCreated,
      userCount: dept.activeUsers,
    }));
  };

  // Transform trend data for monthly chart
  const transformTrendData = () => {
    if (!documentsQuery.data?.creationTrend) return [];

    return documentsQuery.data.creationTrend.map((item) => ({
      month: item.period,
      documents: item.count,
      users: 0, // We don't have this data in document analytics
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <AnalyticsFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        showDepartmentFilter={true}
        showUserFilter={false}
      />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="documents">Hujjatlar</TabsTrigger>
          <TabsTrigger value="workflows">Workflow</TabsTrigger>
          <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Jami Hujjatlar"
                  value={
                    dashboardQuery.data?.totalDocuments.value.toLocaleString() ||
                    0
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
                  title="Jurnallar"
                  value={
                    dashboardQuery.data?.totalJournals.value.toLocaleString() ||
                    0
                  }
                  icon={BookOpen}
                  iconColor="text-orange-600"
                  iconBgColor="bg-orange-50"
                  trend={formatTrend(
                    dashboardQuery.data?.totalJournals.changePercentage,
                  )}
                  description="Hujjat jurnallari"
                />
                <StatCard
                  title="Aktiv Workflow"
                  value={dashboardQuery.data?.activeWorkflows || 0}
                  icon={WorkflowIcon}
                  iconColor="text-pink-600"
                  iconBgColor="bg-pink-50"
                  description="Jarayondagi workflowlar"
                />
                <StatCard
                  title="Kutilayotgan Vazifalar"
                  value={
                    dashboardQuery.data?.pendingTasks.value.toLocaleString() ||
                    0
                  }
                  icon={CheckSquare}
                  iconColor="text-yellow-600"
                  iconBgColor="bg-yellow-50"
                  trend={formatTrend(
                    dashboardQuery.data?.pendingTasks.changePercentage,
                  )}
                  description="Bajarilishi kerak vazifalar"
                />
              </div>

              {/* Charts */}
              {!documentsQuery.isLoading && !documentsQuery.isError && (
                <>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <DocumentTypeChart data={transformDocumentTypeData()} />
                    <DocumentStatusChart data={transformDocumentStatusData()} />
                  </div>

                  <div className="grid gap-6">
                    <MonthlyTrendChart data={transformTrendData()} />
                  </div>
                </>
              )}

              {!usersQuery.isLoading && !usersQuery.isError && (
                <div className="grid gap-6">
                  <DepartmentStatsChart data={transformDepartmentData()} />
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {documentsQuery.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Hujjat statistikasi ma'lumotlari hozircha mavjud emas. Backend
                xatolik yuz berdi.
              </AlertDescription>
            </Alert>
          )}
          {documentsQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !documentsQuery.isError ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Jami Hujjatlar"
                  value={
                    documentsQuery.data?.totalDocuments.toLocaleString() || 0
                  }
                  icon={FileText}
                  iconColor="text-blue-600"
                  iconBgColor="bg-blue-50"
                  description="Barcha hujjatlar"
                />
                <StatCard
                  title="Kunlik O'rtacha"
                  value={
                    documentsQuery.data?.averageDocumentsPerDay.toFixed(1) || 0
                  }
                  icon={TrendingUp}
                  iconColor="text-green-600"
                  iconBgColor="bg-green-50"
                  description="Hujjatlar soni (kunlik)"
                />
                <StatCard
                  title="Ilovalar bilan"
                  value={
                    documentsQuery.data?.documentsWithAttachments.toLocaleString() ||
                    0
                  }
                  icon={FileText}
                  iconColor="text-purple-600"
                  iconBgColor="bg-purple-50"
                  description="Ilovalar mavjud"
                />
                <StatCard
                  title="Jami Versiyalar"
                  value={
                    documentsQuery.data?.totalVersions.toLocaleString() || 0
                  }
                  icon={Activity}
                  iconColor="text-orange-600"
                  iconBgColor="bg-orange-50"
                  description="Barcha versiyalar"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DocumentStatusChart data={transformDocumentStatusData()} />
                <Card>
                  <CardHeader>
                    <CardTitle>Muhimlik darajasi bo'yicha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {documentsQuery.data?.documentsByPriority && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Yuqori</span>
                            <span className="font-bold text-red-600">
                              {documentsQuery.data.documentsByPriority.urgent}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">O'rtacha yuqori</span>
                            <span className="font-bold text-orange-600">
                              {documentsQuery.data.documentsByPriority.high}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">O'rtacha</span>
                            <span className="font-bold text-yellow-600">
                              {documentsQuery.data.documentsByPriority.medium}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Past</span>
                            <span className="font-bold text-green-600">
                              {documentsQuery.data.documentsByPriority.low}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DocumentTypeChart data={transformDocumentTypeData()} />
                <DepartmentStatsChart data={transformDepartmentData()} />
              </div>

              <MonthlyTrendChart data={transformTrendData()} />
            </>
          ) : null}
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          {workflowsQuery.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Workflow statistikasi ma'lumotlari hozircha mavjud emas. Backend
                xatolik yuz berdi.
              </AlertDescription>
            </Alert>
          )}
          {workflowsQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !workflowsQuery.isError ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Jami Workflowlar"
                  value={
                    workflowsQuery.data?.totalWorkflows.toLocaleString() || 0
                  }
                  icon={WorkflowIcon}
                  iconColor="text-blue-600"
                  iconBgColor="bg-blue-50"
                  description="Barcha workflowlar"
                />
                <StatCard
                  title="O'rtacha Bajarilish Vaqti"
                  value={`${workflowsQuery.data?.averageCompletionTime.toFixed(1) || 0}h`}
                  icon={Clock}
                  iconColor="text-green-600"
                  iconBgColor="bg-green-50"
                  description="Soatlarda"
                />
                <StatCard
                  title="Yakunlangan"
                  value={
                    workflowsQuery.data?.completedInPeriod.toLocaleString() || 0
                  }
                  icon={CheckSquare}
                  iconColor="text-green-600"
                  iconBgColor="bg-green-50"
                  description="Tanlangan davrda"
                />
                <StatCard
                  title="Rad etilgan"
                  value={
                    workflowsQuery.data?.rejectedInPeriod.toLocaleString() || 0
                  }
                  icon={AlertCircle}
                  iconColor="text-red-600"
                  iconBgColor="bg-red-50"
                  description="Tanlangan davrda"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Status bo'yicha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {workflowsQuery.data?.workflowsByStatus && (
                      <>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">
                            {workflowsQuery.data.workflowsByStatus.pending}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Kutilmoqda
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {workflowsQuery.data.workflowsByStatus.inProgress}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Jarayonda
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {workflowsQuery.data.workflowsByStatus.completed}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Yakunlangan
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {workflowsQuery.data.workflowsByStatus.rejected}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rad etilgan
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Step Completion Rates */}
              {workflowsQuery.data?.stepCompletionRates &&
                workflowsQuery.data.stepCompletionRates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Qadam bajarilish darajasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Qadam</TableHead>
                            <TableHead>Bajarilish %</TableHead>
                            <TableHead>O'rtacha vaqt (soat)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workflowsQuery.data.stepCompletionRates.map(
                            (step) => (
                              <TableRow key={step.stepOrder}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      #{step.stepOrder}
                                    </span>
                                    {step.stepName}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                                      <div
                                        className="h-2 bg-green-600 rounded-full"
                                        style={{
                                          width: `${step.completionRate}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="font-medium">
                                      {step.completionRate}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {step.averageCompletionTime.toFixed(1)}h
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
            </>
          ) : null}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {usersQuery.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Foydalanuvchi statistikasi ma'lumotlari hozircha mavjud emas.
                Backend xatolik yuz berdi.
              </AlertDescription>
            </Alert>
          )}
          {usersQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !usersQuery.isError ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Aktiv Foydalanuvchilar"
                  value={
                    usersQuery.data?.totalActiveUsers.toLocaleString() || 0
                  }
                  icon={Users}
                  iconColor="text-blue-600"
                  iconBgColor="bg-blue-50"
                  description="Faol foydalanuvchilar"
                />
                <StatCard
                  title="O'rtacha Hujjatlar"
                  value={
                    usersQuery.data?.averageDocumentsPerUser.toFixed(1) || 0
                  }
                  icon={FileText}
                  iconColor="text-green-600"
                  iconBgColor="bg-green-50"
                  description="Har bir foydalanuvchiga"
                />
                <StatCard
                  title="O'rtacha Qadam"
                  value={
                    usersQuery.data?.averageWorkflowStepsPerUser.toFixed(1) || 0
                  }
                  icon={Activity}
                  iconColor="text-purple-600"
                  iconBgColor="bg-purple-50"
                  description="Workflow qadamlari"
                />
              </div>

              {/* Top Active Users */}
              {usersQuery.data?.topActiveUsers &&
                usersQuery.data.topActiveUsers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Eng faol foydalanuvchilar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Foydalanuvchi</TableHead>
                            <TableHead>Yaratilgan hujjatlar</TableHead>
                            <TableHead>Bajarilgan qadam</TableHead>
                            <TableHead>Kutilayotgan qadam</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersQuery.data.topActiveUsers.map((user) => (
                            <TableRow key={user.userId}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {user.fullName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    @{user.username}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{user.documentsCreated}</TableCell>
                              <TableCell>
                                {user.workflowStepsCompleted}
                              </TableCell>
                              <TableCell>{user.workflowStepsPending}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

              {/* Department Activity */}
              <DepartmentStatsChart data={transformDepartmentData()} />
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
