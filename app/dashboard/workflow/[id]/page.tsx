"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Text,
  Paper,
  Group,
  Button,
  Skeleton,
  SimpleGrid,
  ActionIcon,
  Alert,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useGetWorkflowById } from "@/features/workflow/hook/workflow.hook";
import WorkflowDetailView from "@/features/workflow/component/workflow-detail.view";

const WorkflowDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const { data: workflow, isLoading, isError } = useGetWorkflowById(workflowId);

  console.log(workflow, "workflow");
  if (isLoading) {
    return (
      <Box>
        <Group justify="space-between" mb="lg">
          <Group gap="sm">
            <Skeleton height={36} width={36} radius="sm" />
            <Box>
              <Skeleton height={24} width={300} mb={4} />
              <Skeleton height={16} width={200} />
            </Box>
          </Group>
        </Group>

        {/* Content skeleton */}
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
          <Box style={{ gridColumn: "span 2" }}>
            <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
              <Skeleton height={200} />
            </Paper>
          </Box>
          <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Skeleton height={200} />
          </Paper>
        </SimpleGrid>
      </Box>
    );
  }

  // Error state
  if (isError || !workflow) {
    return (
      <Box>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push("/dashboard/workflow")}
          mb="lg"
          c="#495057"
        >
          Orqaga
        </Button>

        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Xatolik"
          color="red"
          radius="sm"
        >
          Hujjat aylanmasi topilmadi yoki yuklanishda xatolik yuz berdi.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <ActionIcon
            variant="light"
            size="lg"
            radius="sm"
            onClick={() => router.push("/dashboard/workflow")}
            style={{ backgroundColor: "#f1f3f5" }}
          >
            <IconArrowLeft size={18} color="#495057" />
          </ActionIcon>
          <Box>
            <Text size="xl" fw={700} c="#212529">
              {workflow.document?.title || "Hujjat aylanmasi"}
            </Text>
            <Text size="sm" c="dimmed">
              {workflow.document?.documentNumber || "—"}
            </Text>
          </Box>
        </Group>
      </Group>

      {/* Content */}
      <WorkflowDetailView workflow={workflow} />
    </Box>
  );
};

export default WorkflowDetailPage;
