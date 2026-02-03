"use client";

import { useState } from "react";
import {
  Box,
  SimpleGrid,
  Tabs,
  Alert,
  Skeleton,
  Paper,
  Text,
  Group,
  Table,
  Progress,
  Stack,
} from "@mantine/core";
import {
  IconFileText,
  IconUsers,
  IconBuilding,
  IconBook,
  IconArrowsExchange,
  IconChecklist,
  IconTrendingUp,
  IconClock,
  IconAlertCircle,
  IconActivity,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { StatCard } from "../component/stat-card";

const DocumentTypeChart = dynamic(
  () => import("../component/document-type-chart").then((m) => ({ default: m.DocumentTypeChart })),
  { ssr: false }
);
const DocumentStatusChart = dynamic(
  () => import("../component/document-status-chart").then((m) => ({ default: m.DocumentStatusChart })),
  { ssr: false }
);
const MonthlyTrendChart = dynamic(
  () => import("../component/monthly-trend-chart").then((m) => ({ default: m.MonthlyTrendChart })),
  { ssr: false }
);
const DepartmentStatsChart = dynamic(
  () => import("../component/department-stats-chart").then((m) => ({ default: m.DepartmentStatsChart })),
  { ssr: false }
);
import {
  useDashboardAnalytics,
  useDocumentAnalytics,
  useWorkflowAnalytics,
  useUserAnalytics,
} from "../hook/statistics.hook";
import { AnalyticsFilters, TimeRange } from "../type/statistics.type";
import { useOnboarding, TourButton } from "@/hooks/use-onboarding";

export default function StatisticsPage() {
  const [filters] = useState<AnalyticsFilters>({
    timeRange: TimeRange.MONTH,
  });

  // Onboarding
  useOnboarding("dashboard");

  const dashboardQuery = useDashboardAnalytics(filters);
  const documentsQuery = useDocumentAnalytics(filters);
  const workflowsQuery = useWorkflowAnalytics(filters);
  const usersQuery = useUserAnalytics(filters);

  const allFailed =
    dashboardQuery.isError &&
    documentsQuery.isError &&
    workflowsQuery.isError &&
    usersQuery.isError;

  if (allFailed) {
    return (
      <Alert
        icon={<IconAlertCircle size={18} />}
        title="Xatolik"
        color="red"
        radius="sm"
      >
        Statistika ma'lumotlarini yuklashda xatolik yuz berdi.
      </Alert>
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
      draft: { label: "Qoralama", color: "#868e96" },
      pending: { label: "Kutilmoqda", color: "#495057" },
      inReview: { label: "Ko'rib chiqilmoqda", color: "#1e3a5f" },
      approved: { label: "Tasdiqlangan", color: "#2b8a3e" },
      rejected: { label: "Rad etilgan", color: "#c92a2a" },
      archived: { label: "Arxivlangan", color: "#5c7a99" },
    };

    return Object.entries(documentsQuery.data.documentsByStatus).map(
      ([key, value]) => ({
        status: statusMap[key]?.label || key,
        count: value,
        color: statusMap[key]?.color || "#868e96",
      })
    );
  };

  const transformDocumentTypeData = () => {
    if (!documentsQuery.data?.documentsByType) return [];

    const total = documentsQuery.data.documentsByType.reduce(
      (sum, item) => sum + item.count,
      0
    );

    return documentsQuery.data.documentsByType.map((item) => ({
      documentType: item.typeName,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  };

  const transformDepartmentData = () => {
    if (!usersQuery.data?.departmentActivity) return [];

    return usersQuery.data.departmentActivity.map((dept) => ({
      departmentName: dept.departmentName,
      documentCount: dept.documentsCreated,
      userCount: dept.activeUsers,
    }));
  };

  const transformTrendData = () => {
    if (!documentsQuery.data?.creationTrend) return [];

    return documentsQuery.data.creationTrend.map((item) => ({
      month: item.period,
      documents: item.count,
      users: 0,
    }));
  };

  const LoadingSkeleton = () => (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper key={i} p="lg" radius="sm" withBorder>
          <Skeleton height={80} radius="sm" />
        </Paper>
      ))}
    </SimpleGrid>
  );

  return (
    <Box>
      <Group justify="space-between" mb={4}>
        <Text size="lg" fw={600} c="var(--mantine-color-text)">
          Statistika
        </Text>
        <TourButton tourKey="dashboard" variant="subtle" size="xs" />
      </Group>
      <Text size="sm" c="dimmed" mb="xl">
        Tizim ko'rsatkichlari va tahlil
      </Text>

      <Tabs defaultValue="dashboard" radius="sm">
        <Tabs.List mb="lg" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
          <Tabs.Tab value="dashboard" fz="sm" fw={500} px="md" c="#495057">
            Umumiy
          </Tabs.Tab>
          <Tabs.Tab value="documents" fz="sm" fw={500} px="md" c="#495057">
            Hujjatlar
          </Tabs.Tab>
          <Tabs.Tab value="workflows" fz="sm" fw={500} px="md" c="#495057">
            Hujjat aylanmasi
          </Tabs.Tab>
          <Tabs.Tab value="users" fz="sm" fw={500} px="md" c="#495057">
            Foydalanuvchilar
          </Tabs.Tab>
        </Tabs.List>

        {/* Dashboard Tab */}
        <Tabs.Panel value="dashboard">
          <Stack gap="lg">
            {dashboardQuery.isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" data-tour="stats-cards">
                  <StatCard
                    href="document"
                    title="Jami hujjatlar"
                    value={dashboardQuery.data?.totalDocuments?.value?.toLocaleString() || 0}
                    icon={IconFileText}
                    trend={formatTrend(dashboardQuery.data?.totalDocuments?.changePercentage)}
                    description="Tizimdagi barcha hujjatlar"
                  />
                  <StatCard
                    href="admin/users"
                    title="Aktiv foydalanuvchilar"
                    value={dashboardQuery.data?.activeUsers?.value?.toLocaleString() || 0}
                    icon={IconUsers}
                    trend={formatTrend(dashboardQuery.data?.activeUsers?.changePercentage)}
                    description="Faol foydalanuvchilar"
                  />
                  <StatCard
                    href="department"
                    title="Bo'limlar"
                    value={dashboardQuery.data?.totalDepartments || 0}
                    icon={IconBuilding}
                    description="Tashkilot bo'limlari"
                  />
                  <StatCard
                    href="journal"
                    title="Jurnallar"
                    value={dashboardQuery.data?.totalJournals?.value?.toLocaleString() || 0}
                    icon={IconBook}
                    trend={formatTrend(dashboardQuery.data?.totalJournals?.changePercentage)}
                    description="Hujjat jurnallari"
                  />
                  <StatCard
                    href="workflow"
                    title="Aktiv jarayonlar"
                    value={dashboardQuery.data?.activeWorkflows || 0}
                    icon={IconArrowsExchange}
                    description="Jarayondagi hujjat aylanmasi"
                  />
                  <StatCard
                    href="workflow"
                    title="Kutilayotgan vazifalar"
                    value={dashboardQuery.data?.pendingTasks?.value?.toLocaleString() || 0}
                    icon={IconChecklist}
                    trend={formatTrend(dashboardQuery.data?.pendingTasks?.changePercentage)}
                    description="Bajarilishi kerak"
                  />
                </SimpleGrid>

                {!documentsQuery.isLoading && !documentsQuery.isError && (
                  <>
                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                      <Box data-tour="stats-chart-type">
                        <DocumentTypeChart data={transformDocumentTypeData()} />
                      </Box>
                      <Box data-tour="stats-chart-status">
                        <DocumentStatusChart data={transformDocumentStatusData()} />
                      </Box>
                    </SimpleGrid>

                    <Box data-tour="stats-chart-trend">
                      <MonthlyTrendChart data={transformTrendData()} />
                    </Box>
                  </>
                )}

                {!usersQuery.isLoading && !usersQuery.isError && (
                  <Box data-tour="stats-chart-department">
                    <DepartmentStatsChart data={transformDepartmentData()} />
                  </Box>
                )}
              </>
            )}
          </Stack>
        </Tabs.Panel>

        {/* Documents Tab */}
        <Tabs.Panel value="documents">
          <Stack gap="lg">
            {documentsQuery.isError && (
              <Alert icon={<IconAlertCircle size={18} />} color="red" radius="sm">
                Hujjat statistikasi ma'lumotlari hozircha mavjud emas.
              </Alert>
            )}

            {documentsQuery.isLoading ? (
              <LoadingSkeleton />
            ) : !documentsQuery.isError ? (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                  <StatCard
                    title="Jami hujjatlar"
                    value={documentsQuery.data?.totalDocuments?.toLocaleString() || 0}
                    icon={IconFileText}
                    description="Barcha hujjatlar"
                  />
                  <StatCard
                    title="Kunlik o'rtacha"
                    value={documentsQuery.data?.averageDocumentsPerDay?.toFixed(1) || 0}
                    icon={IconTrendingUp}
                    description="Kuniga yaratilgan"
                  />
                  <StatCard
                    title="Ilovalar bilan"
                    value={documentsQuery.data?.documentsWithAttachments?.toLocaleString() || 0}
                    icon={IconFileText}
                    description="Ilovalar mavjud"
                  />
                  <StatCard
                    title="Jami versiyalar"
                    value={documentsQuery.data?.totalVersions?.toLocaleString() || 0}
                    icon={IconActivity}
                    description="Barcha versiyalar"
                  />
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                  <DocumentStatusChart data={transformDocumentStatusData()} />

                  <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Text size="md" fw={600} c="#212529" mb={4}>
                      Muhimlik darajasi
                    </Text>
                    <Text size="sm" c="dimmed" mb="lg">
                      Hujjatlar muhimligi bo'yicha
                    </Text>

                    {documentsQuery.data?.documentsByPriority && (
                      <Stack gap="sm">
                        <PriorityItem
                          label="Yuqori"
                          value={documentsQuery.data.documentsByPriority.urgent}
                          color="#c92a2a"
                        />
                        <PriorityItem
                          label="O'rtacha yuqori"
                          value={documentsQuery.data.documentsByPriority.high}
                          color="#495057"
                        />
                        <PriorityItem
                          label="O'rtacha"
                          value={documentsQuery.data.documentsByPriority.medium}
                          color="#868e96"
                        />
                        <PriorityItem
                          label="Past"
                          value={documentsQuery.data.documentsByPriority.low}
                          color="#2b8a3e"
                        />
                      </Stack>
                    )}
                  </Paper>
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                  <DocumentTypeChart data={transformDocumentTypeData()} />
                  <DepartmentStatsChart data={transformDepartmentData()} />
                </SimpleGrid>

                <MonthlyTrendChart data={transformTrendData()} />
              </>
            ) : null}
          </Stack>
        </Tabs.Panel>

        {/* Workflows Tab */}
        <Tabs.Panel value="workflows">
          <Stack gap="lg">
            {workflowsQuery.isError && (
              <Alert icon={<IconAlertCircle size={18} />} color="red" radius="sm">
                Hujjat aylanmasi statistikasi ma'lumotlari hozircha mavjud emas.
              </Alert>
            )}

            {workflowsQuery.isLoading ? (
              <LoadingSkeleton />
            ) : !workflowsQuery.isError ? (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                  <StatCard
                    title="Jami jarayonlar"
                    value={workflowsQuery.data?.totalWorkflows?.toLocaleString() || 0}
                    icon={IconArrowsExchange}
                    description="Barcha hujjat aylanmasi"
                  />
                  <StatCard
                    title="O'rtacha vaqt"
                    value={`${workflowsQuery.data?.averageCompletionTime?.toFixed(1) || 0} soat`}
                    icon={IconClock}
                    description="Bajarilish vaqti"
                  />
                  <StatCard
                    title="Yakunlangan"
                    value={workflowsQuery.data?.completedInPeriod?.toLocaleString() || 0}
                    icon={IconChecklist}
                    description="Tanlangan davrda"
                  />
                  <StatCard
                    title="Rad etilgan"
                    value={workflowsQuery.data?.rejectedInPeriod?.toLocaleString() || 0}
                    icon={IconAlertCircle}
                    description="Tanlangan davrda"
                  />
                </SimpleGrid>

                <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                  <Text size="md" fw={600} c="#212529" mb="lg">
                    Status bo'yicha
                  </Text>

                  {workflowsQuery.data?.workflowsByStatus && (
                    <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="md">
                      <StatusBox
                        label="Kutilmoqda"
                        value={workflowsQuery.data.workflowsByStatus.pending}
                        color="#495057"
                      />
                      <StatusBox
                        label="Jarayonda"
                        value={workflowsQuery.data.workflowsByStatus.inProgress}
                        color="#1e3a5f"
                      />
                      <StatusBox
                        label="Yakunlangan"
                        value={workflowsQuery.data.workflowsByStatus.completed}
                        color="#2b8a3e"
                      />
                      <StatusBox
                        label="Rad etilgan"
                        value={workflowsQuery.data.workflowsByStatus.rejected}
                        color="#c92a2a"
                      />
                    </SimpleGrid>
                  )}
                </Paper>

                {workflowsQuery.data?.stepCompletionRates &&
                  workflowsQuery.data.stepCompletionRates.length > 0 && (
                    <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                      <Text size="md" fw={600} c="#212529" mb="lg">
                        Qadam bajarilish darajasi
                      </Text>

                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ color: "#495057" }}>Qadam</Table.Th>
                            <Table.Th style={{ color: "#495057" }}>Bajarilish</Table.Th>
                            <Table.Th style={{ color: "#495057" }}>O'rtacha vaqt</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {workflowsQuery.data.stepCompletionRates.map((step) => (
                            <Table.Tr key={step.stepOrder}>
                              <Table.Td>
                                <Group gap="xs">
                                  <Text size="sm" c="dimmed">
                                    #{step.stepOrder}
                                  </Text>
                                  <Text size="sm" c="#212529">
                                    {step.stepName}
                                  </Text>
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Group gap="sm">
                                  <Progress
                                    value={step.completionRate}
                                    size="md"
                                    radius="sm"
                                    w={80}
                                    color="#1e3a5f"
                                  />
                                  <Text size="sm" fw={500} c="#212529">
                                    {step.completionRate}%
                                  </Text>
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" c="#495057">
                                  {step.averageCompletionTime.toFixed(1)} soat
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Paper>
                  )}
              </>
            ) : null}
          </Stack>
        </Tabs.Panel>

        {/* Users Tab */}
        <Tabs.Panel value="users">
          <Stack gap="lg">
            {usersQuery.isError && (
              <Alert icon={<IconAlertCircle size={18} />} color="red" radius="sm">
                Foydalanuvchi statistikasi ma'lumotlari hozircha mavjud emas.
              </Alert>
            )}

            {usersQuery.isLoading ? (
              <LoadingSkeleton />
            ) : !usersQuery.isError ? (
              <>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                  <StatCard
                    title="Aktiv foydalanuvchilar"
                    value={usersQuery.data?.totalActiveUsers?.toLocaleString() || 0}
                    icon={IconUsers}
                    description="Faol foydalanuvchilar"
                  />
                  <StatCard
                    title="O'rtacha hujjatlar"
                    value={usersQuery.data?.averageDocumentsPerUser?.toFixed(1) || 0}
                    icon={IconFileText}
                    description="Har bir foydalanuvchiga"
                  />
                  <StatCard
                    title="O'rtacha qadam"
                    value={usersQuery.data?.averageWorkflowStepsPerUser?.toFixed(1) || 0}
                    icon={IconActivity}
                    description="Hujjat aylanmasi qadamlari"
                  />
                </SimpleGrid>

                {usersQuery.data?.topActiveUsers &&
                  usersQuery.data.topActiveUsers.length > 0 && (
                    <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                      <Text size="md" fw={600} c="#212529" mb="lg">
                        Eng faol foydalanuvchilar
                      </Text>

                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ color: "#495057" }}>Foydalanuvchi</Table.Th>
                            <Table.Th style={{ color: "#495057" }}>Yaratilgan</Table.Th>
                            <Table.Th style={{ color: "#495057" }}>Bajarilgan</Table.Th>
                            <Table.Th style={{ color: "#495057" }}>Kutilayotgan</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {usersQuery.data.topActiveUsers.map((user) => (
                            <Table.Tr key={user.userId}>
                              <Table.Td>
                                <Box>
                                  <Text size="sm" fw={500} c="#212529">
                                    {user.fullName}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    @{user.username}
                                  </Text>
                                </Box>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" fw={500} c="#212529">
                                  {user.documentsCreated}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" fw={500} c="#2b8a3e">
                                  {user.workflowStepsCompleted}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" fw={500} c="#495057">
                                  {user.workflowStepsPending}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Paper>
                  )}

                <DepartmentStatsChart data={transformDepartmentData()} />
              </>
            ) : null}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

function PriorityItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Group
      justify="space-between"
      py={8}
      px="sm"
      style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}
    >
      <Text size="sm" c="#495057">
        {label}
      </Text>
      <Text size="sm" fw={600} style={{ color }}>
        {value}
      </Text>
    </Group>
  );
}

function StatusBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
      <Text size="xl" fw={700} style={{ color }}>
        {value}
      </Text>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Paper>
  );
}
