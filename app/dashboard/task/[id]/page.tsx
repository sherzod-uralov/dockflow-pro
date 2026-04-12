"use client";

import { useParams } from "next/navigation";
import { Container, Text, Loader, Center, Stack, Group, Button, Badge } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useGetTaskById } from "@/features/task/hook/task.hook";
import { TASK_PRIORITY_OPTIONS } from "@/features/task/type/task.type";
import { formatDate } from "@/lib/date-utils";

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params?.id as string;

    const { data: task, isLoading } = useGetTaskById(taskId);

    if (isLoading) {
        return (
            <Center h="100vh">
                <Loader color="#1e3a5f" />
            </Center>
        );
    }

    if (!task) {
        return (
            <Center h="100vh">
                <Text>Vazifa topilmadi</Text>
            </Center>
        );
    }

    const priorityOption = TASK_PRIORITY_OPTIONS.find((p) => p.value === task.priority);

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                <Group>
                    <Button
                        variant="subtle"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={() => router.push("/dashboard/task")}
                    >
                        Ortga
                    </Button>
                </Group>

                <Stack gap="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xl" fw={700} c="#212529">
                                {task.title}
                            </Text>
                            {task.description && (
                                <Text size="sm" c="dimmed" mt="xs">
                                    {task.description}
                                </Text>
                            )}
                        </div>

                        <Group>
                            {task.boardColumn && (
                                <Badge
                                    variant="light"
                                    size="lg"
                                    styles={{
                                        root: {
                                            backgroundColor: `${task.boardColumn.color || "#95a5a6"}15`,
                                            color: task.boardColumn.color || "#95a5a6",
                                        },
                                    }}
                                >
                                    {task.boardColumn.name}
                                </Badge>
                            )}
                            <Badge
                                variant="light"
                                size="lg"
                                styles={{
                                    root: {
                                        backgroundColor: `${priorityOption?.color || "#95a5a6"}15`,
                                        color: priorityOption?.color || "#95a5a6",
                                    },
                                }}
                            >
                                {priorityOption?.label}
                            </Badge>
                        </Group>
                    </Group>

                    {/* Task Details */}
                    <Stack gap="sm" mt="md">
                        {task.project && (
                            <Group>
                                <Text fw={500} c="#495057">Loyiha:</Text>
                                <Badge
                                    variant="light"
                                    styles={{
                                        root: {
                                            backgroundColor: `${task.project.color || "#3498db"}15`,
                                            color: task.project.color || "#3498db",
                                        },
                                    }}
                                >
                                    {task.project.key} - {task.project.name}
                                </Badge>
                            </Group>
                        )}

                        {task.assignees && task.assignees.length > 0 && (
                            <Group>
                                <Text fw={500} c="#495057">Mas'ul shaxslar:</Text>
                                <Text c="dimmed">{task.assignees.map((a) => a.user.fullname).join(", ")}</Text>
                            </Group>
                        )}

                        {task.startDate && (
                            <Group>
                                <Text fw={500} c="#495057">Boshlanish:</Text>
                                <Text c="dimmed">{formatDate(task.startDate)}</Text>
                            </Group>
                        )}

                        {task.dueDate && (
                            <Group>
                                <Text fw={500} c="#495057">Tugash:</Text>
                                <Text c="dimmed">{formatDate(task.dueDate)}</Text>
                            </Group>
                        )}

                        {task.estimatedHours && (
                            <Group>
                                <Text fw={500} c="#495057">Taxminiy soatlar:</Text>
                                <Text c="dimmed">{task.estimatedHours}h</Text>
                            </Group>
                        )}

                        {task.createdBy && (
                            <Group>
                                <Text fw={500} c="#495057">Yaratuvchi:</Text>
                                <Text c="dimmed">{task.createdBy.fullname}</Text>
                            </Group>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </Container>
    );
}
