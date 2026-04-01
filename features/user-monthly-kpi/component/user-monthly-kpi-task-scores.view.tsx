"use client";

import {
  Box,
  Text,
  Group,
  Badge,
  Paper,
  Stack,
  Loader,
  Center,
  Table,
} from "@mantine/core";
import {
  IconClipboardCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useGetUserMonthlyKpiTaskScores } from "../hook/user-monthly-kpi.hook";

interface UserMonthlyKpiTaskScoresViewProps {
  userId: string;
  year: number;
  month: number;
}

const UserMonthlyKpiTaskScoresView = ({ userId, year, month }: UserMonthlyKpiTaskScoresViewProps) => {
  const { data: taskScores, isLoading } = useGetUserMonthlyKpiTaskScores({ userId, year, month });

  if (isLoading) {
    return (
      <Center py={40}>
        <Loader size="md" />
      </Center>
    );
  }

  if (!taskScores || taskScores.length === 0) {
    return (
      <Center py={40}>
        <Stack align="center" gap="md">
          <Box p={16} style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}>
            <IconClipboardCheck size={40} color="#868e96" stroke={1.5} />
          </Box>
          <Text size="lg" fw={500} c="#495057">
            Vazifa ballari topilmadi
          </Text>
        </Stack>
      </Center>
    );
  }

  const totalScore = taskScores.reduce((sum, ts) => sum + ts.score, 0);

  return (
    <Stack gap="md">
      <Paper radius="sm" withBorder style={{ borderColor: "#e9ecef", overflow: "auto" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Vazifa</Table.Th>
              <Table.Th>Asosiy ball</Table.Th>
              <Table.Th>Jarima</Table.Th>
              <Table.Th>Kechikish (kun)</Table.Th>
              <Table.Th>Yakuniy ball</Table.Th>
              <Table.Th>Bajarilgan sana</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {taskScores.map((ts) => (
              <Table.Tr key={ts.id}>
                <Table.Td>
                  <Text size="sm" fw={500} c="#212529">
                    {ts.task?.title || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="#495057">{ts.baseScore}</Text>
                </Table.Td>
                <Table.Td>
                  {ts.penalty > 0 ? (
                    <Group gap={4}>
                      <IconAlertTriangle size={14} color="#e74c3c" />
                      <Text size="sm" c="red" fw={500}>-{ts.penalty}</Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">0</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={ts.daysLate ? "#e74c3c" : "#495057"}>
                    {ts.daysLate ?? 0}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="blue" radius="sm">
                    {ts.score}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="#495057">
                    {ts.completedAt
                      ? new Date(ts.completedAt).toLocaleDateString("uz-UZ")
                      : "—"}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text size="sm" fw={600} c="#212529">
                  Jami
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="filled" color="blue" radius="sm" size="lg">
                  {totalScore}
                </Badge>
              </Table.Td>
              <Table.Td />
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Paper>
    </Stack>
  );
};

export default UserMonthlyKpiTaskScoresView;
