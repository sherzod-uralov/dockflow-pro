"use client";

import { Box, Table, Text, Badge, Group, Avatar, ActionIcon, Menu, rem } from "@mantine/core";
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";
import { TaskGetResponse, TASK_PRIORITY_OPTIONS } from "../type/task.type";
import { formatDate } from "@/lib/date-utils";

interface TaskListViewProps {
    tasks: TaskGetResponse[];
    onEditTask?: (task: TaskGetResponse) => void;
    onDeleteTask?: (id: string) => void;
}

const TaskListView = ({ tasks, onEditTask, onDeleteTask }: TaskListViewProps) => {
    const getPriorityConfig = (priorityValue: string) => {
        return TASK_PRIORITY_OPTIONS.find((p) => p.value === priorityValue);
    };

    const rows = tasks.map((task) => {
        const priorityConfig = getPriorityConfig(task.priority);
        const boardColumn = task.boardColumn;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !boardColumn?.isClosed;

        return (
            <Table.Tr
                key={task.id}
                className="task-row"
                style={{ cursor: "pointer", transition: "background-color 0.2s" }}
            >
                <Table.Td style={{ paddingTop: 12, paddingBottom: 12 }}>
                    <Text fw={600} size="sm" c="dark.4">
                        {task.title}
                    </Text>
                    {task.project && (
                        <Text size="xs" c="dimmed" mt={2} fw={500}>
                            {task.project.name}
                        </Text>
                    )}
                </Table.Td>

                <Table.Td>
                    <Badge
                        variant="light"
                        size="md"
                        radius="md"
                        style={{
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            backgroundColor: `${boardColumn?.color || "#95a5a6"}20`,
                            color: boardColumn?.color || "#95a5a6",
                        }}
                    >
                        {boardColumn?.name || "Noma'lum"}
                    </Badge>
                </Table.Td>

                <Table.Td>
                    <Badge
                        color={priorityConfig?.color || "gray"}
                        variant="outline"
                        size="sm"
                        radius="xl"
                        pl={0}
                        leftSection={
                            <Box
                                w={6}
                                h={6}
                                bg={priorityConfig?.color || "gray"}
                                style={{ borderRadius: "50%", marginLeft: 6 }}
                            />
                        }
                        style={{ textTransform: "none", color: "inherit", borderColor: "transparent", backgroundColor: 'transparent', paddingLeft: 4 }}
                    >
                        {priorityConfig?.label || task.priority}
                    </Badge>
                </Table.Td>

                <Table.Td>
                    {task.assignees && task.assignees.length > 0 ? (
                        <Group gap={-4}>
                            {task.assignees.slice(0, 3).map((assignee) => (
                                <Avatar
                                    key={assignee.id}
                                    src={assignee.user.avatarUrl}
                                    alt={assignee.user.fullname}
                                    radius="xl"
                                    size="sm"
                                    color="blue"
                                    style={{ border: "2px solid white" }}
                                >
                                    {assignee.user.fullname.charAt(0)}
                                </Avatar>
                            ))}
                            {task.assignees.length > 3 && (
                                <Avatar size="sm" radius="xl" color="gray" style={{ border: "2px solid white" }}>
                                    +{task.assignees.length - 3}
                                </Avatar>
                            )}
                        </Group>
                    ) : (
                        <Text size="sm" c="dimmed">
                            -
                        </Text>
                    )}
                </Table.Td>

                <Table.Td>
                    {task.dueDate ? (
                        <Group gap={6}>
                            <Box
                                w={6}
                                h={6}
                                bg={isOverdue ? "red" : "transparent"}
                                style={{ borderRadius: "50%" }}
                            />
                            <Text
                                size="sm"
                                c={isOverdue ? "red" : "dimmed"}
                                fw={isOverdue ? 600 : 400}
                            >
                                {formatDate(task.dueDate)}
                            </Text>
                        </Group>
                    ) : (
                        <Text size="sm" c="dimmed">
                            -
                        </Text>
                    )}
                </Table.Td>

                <Table.Td>
                    <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDots style={{ width: rem(16), height: rem(16) }} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
                                onClick={() => onEditTask?.(task)}
                            >
                                Tahrirlash
                            </Menu.Item>
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                onClick={() => onDeleteTask?.(task.id)}
                            >
                                O'chirish
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Box
            style={{
                backgroundColor: "white",
                borderRadius: 8,
                border: "1px solid #e9ecef",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
        >
            <Table verticalSpacing="md" highlightOnHover withRowBorders>
                <Table.Thead style={{ backgroundColor: "#f8f9fa", borderBottom: '1px solid #e9ecef' }}>
                    <Table.Tr>
                        <Table.Th style={{ fontWeight: 600, color: '#495057' }}>Vazifa nomi</Table.Th>
                        <Table.Th style={{ fontWeight: 600, color: '#495057' }}>Holati</Table.Th>
                        <Table.Th style={{ fontWeight: 600, color: '#495057' }}>Muhimlik</Table.Th>
                        <Table.Th style={{ fontWeight: 600, color: '#495057' }}>Mas'ul</Table.Th>
                        <Table.Th style={{ fontWeight: 600, color: '#495057' }}>Muddat</Table.Th>
                        <Table.Th style={{ width: 50 }}></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>

            {tasks.length === 0 && (
                <Box p="xl" style={{ textAlign: "center" }}>
                    <Text c="dimmed">Vazifalar topilmadi</Text>
                </Box>
            )}
        </Box>
    );
};

export default TaskListView;
