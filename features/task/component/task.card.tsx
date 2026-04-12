"use client";

import { useState, useRef, useEffect } from "react";
import {
    Card,
    Group,
    Text,
    Badge,
    Avatar,
    ActionIcon,
    Menu,
    Popover,
    Tooltip,
    Checkbox,
    Stack,
    Paper,
    ScrollArea,
    Box,
    TextInput,
} from "@mantine/core";
import {
    IconDots,
    IconPencil,
    IconTrash,
    IconCalendar,
    IconMessage,
    IconPaperclip,
    IconSubtask,
    IconPlus,
    IconSearch,
    IconCheck,
} from "@tabler/icons-react";
import {
    TaskGetResponse,
    TASK_PRIORITY_OPTIONS,
    TaskPriority,
} from "../type/task.type";
import { useUpdateTask, useCompleteTask, useUncompleteTask } from "../hook/task.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { formatDate } from "@/lib/date-utils";

interface TaskCardProps {
    task: TaskGetResponse;
    onEdit?: (task: TaskGetResponse) => void;
    onDelete?: (id: string) => void;
    onClick?: (task: TaskGetResponse) => void;
    onAddSubtask?: (task: TaskGetResponse) => void;
    draggable?: boolean;
}

// Priority indicator colors
const PRIORITY_COLORS: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: "#95a5a6",
    [TaskPriority.MEDIUM]: "#3498db",
    [TaskPriority.HIGH]: "#f39c12",
    [TaskPriority.URGENT]: "#e74c3c",
    [TaskPriority.CRITICAL]: "#c0392b",
};

const TaskCard = ({ task, onEdit, onDelete, onClick, onAddSubtask, draggable = false }: TaskCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const priorityColor = PRIORITY_COLORS[task.priority] || "#95a5a6";
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.boardColumn?.isClosed;

    // Users and update mutation
    const { data: usersData } = useGetUserQuery({
        pageNumber: 1,
        pageSize: 1000,
    });
    const updateTask = useUpdateTask();
    const completeTask = useCompleteTask();
    const uncompleteTask = useUncompleteTask();
    const allUsers = usersData?.data || [];
    const isCompleted = !!task.completedAt;

    // Get current assignee user IDs from the assignees array
    const currentAssigneeIds = task.assignees?.map(a => a.user.id) || [];
    const firstAssignee = task.assignees?.[0];

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingTitle]);

    const handleAssigneeChange = (userId: string) => {
        const isAssigned = currentAssigneeIds.includes(userId);
        const newIds = isAssigned
            ? currentAssigneeIds.filter((id) => id !== userId)
            : [...currentAssigneeIds, userId];

        updateTask.mutate({
            id: task.id,
            data: { assigneeIds: newIds },
        });
    };

    const handleSaveTitle = () => {
        if (editTitle.trim() && editTitle !== task.title) {
            updateTask.mutate({
                id: task.id,
                data: { title: editTitle.trim() },
            });
        } else {
            setEditTitle(task.title);
        }
        setIsEditingTitle(false);
    };

    const handleStartEdit = (e: React.MouseEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setEditTitle(task.title);
        setIsEditingTitle(true);
    };

    // Format date

    return (
        <Card
            padding="sm"
            radius="md"
            withBorder
            style={{
                cursor: draggable ? "grab" : onClick ? "pointer" : "default",
                transition: "all 0.15s ease",
                borderColor: isHovered ? "#dee2e6" : "#e9ecef",
                backgroundColor: isHovered ? "#fafafa" : "#fff",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                if (!assigneePopoverOpen && !isEditingTitle) {
                    setIsHovered(false);
                }
            }}
            onClick={() => !isEditingTitle && onClick?.(task)}
        >
            {/* Parent task indicator */}
            {task.parentTaskId && task.parentTask && (
                <Group gap={4} mb={4} style={{ opacity: 0.7 }}>
                    <IconSubtask size={12} color="#868e96" />
                    <Text size="xs" c="dimmed" lineClamp={1}>
                        {task.parentTask.title}
                    </Text>
                </Group>
            )}

            {/* Top row: Task number + Priority + Score + Edit + Menu */}
            <Group justify="space-between" mb={8}>
                <Group gap={8}>
                    {task.project && (
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                            {task.project.key}-{task.taskNumber}
                        </Text>
                    )}
                    <Tooltip label={TASK_PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label}>
                        <Box
                            w={8}
                            h={8}
                            style={{
                                borderRadius: "50%",
                                backgroundColor: priorityColor,
                            }}
                        />
                    </Tooltip>
                    {task.score != null && task.score > 0 && (
                        <Badge
                            size="xs"
                            variant="light"
                            color="blue"
                            style={{ fontWeight: 600 }}
                        >
                            {task.score} ball
                        </Badge>
                    )}
                </Group>

                <Group
                    gap={4}
                    style={{
                        opacity: isHovered && !isEditingTitle ? 1 : 0,
                        transition: "opacity 0.15s ease",
                    }}
                >
                    <Tooltip label="Tahrirlash">
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="xs"
                            onClick={handleStartEdit}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <IconPencil size={12} />
                        </ActionIcon>
                    </Tooltip>
                    <Menu shadow="md" width={160} position="bottom-end">
                        <Menu.Target>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="xs"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <IconDots size={14} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconSubtask size={14} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddSubtask?.(task);
                                }}
                            >
                                Ichki vazifa qo'shish
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(task.id);
                                }}
                            >
                                O'chirish
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>

            {/* Title row with complete checkbox */}
            <Group gap={8} mb={10} wrap="nowrap" align="flex-start">
                <ActionIcon
                    variant={isCompleted ? "filled" : "outline"}
                    size={20}
                    radius="xl"
                    color={isCompleted ? "green" : "gray"}
                    style={{ flexShrink: 0, marginTop: 2 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isCompleted) {
                            uncompleteTask.mutate(task.id);
                        } else {
                            completeTask.mutate(task.id);
                        }
                    }}
                    loading={completeTask.isLoading || uncompleteTask.isLoading}
                >
                    {isCompleted && <IconCheck size={12} />}
                </ActionIcon>

            {isEditingTitle ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveTitle();
                        }
                        if (e.key === "Escape") {
                            e.preventDefault();
                            setEditTitle(task.title);
                            setIsEditingTitle(false);
                        }
                    }}
                    onKeyUp={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        flex: 1,
                        fontSize: 14,
                        fontWeight: 500,
                        color: isCompleted ? "#868e96" : "#212529",
                        textDecoration: isCompleted ? "line-through" : "none",
                        padding: 0,
                        lineHeight: 1.4,
                        fontFamily: "inherit",
                    }}
                />
            ) : (
                <Text
                    fw={500}
                    size="sm"
                    c={isCompleted ? "dimmed" : "#212529"}
                    lineClamp={2}
                    lh={1.4}
                    style={{
                        textDecoration: isCompleted ? "line-through" : "none",
                        flex: 1,
                    }}
                >
                    {task.title}
                </Text>
            )}
            </Group>

            {/* Bottom row: Assignee + Due date + Counts */}
            <Group justify="space-between" gap={8}>
                {/* Assignee */}
                <Popover
                    opened={assigneePopoverOpen}
                    onChange={setAssigneePopoverOpen}
                    position="bottom-start"
                    width={260}
                    shadow="md"
                    onClose={() => {
                        setIsHovered(false);
                        setAssigneeSearch("");
                    }}
                >
                    <Popover.Target>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer"
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setAssigneePopoverOpen((o) => !o);
                            }}
                        >
                            {task.assignees && task.assignees.length > 0 ? (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    {task.assignees.slice(0, 5).map((assignee, index) => (
                                        <Avatar
                                            key={assignee.id}
                                            size={24}
                                            radius="xl"
                                            src={assignee.user.avatarUrl}
                                            color="blue"
                                            style={{
                                                marginLeft: index > 0 ? -8 : 0,
                                                border: "2px solid white",
                                                position: "relative",
                                                zIndex: 5 - index,
                                            }}
                                        >
                                            {assignee.user.fullname.charAt(0)}
                                        </Avatar>
                                    ))}
                                    {task.assignees.length > 5 && (
                                        <Avatar
                                            size={24}
                                            radius="xl"
                                            color="gray"
                                            style={{
                                                marginLeft: -8,
                                                border: "2px solid white",
                                                fontSize: 10,
                                                fontWeight: 600,
                                            }}
                                        >
                                            +{task.assignees.length - 5}
                                        </Avatar>
                                    )}
                                </div>
                            ) : (
                                <Avatar
                                    size={24}
                                    radius="xl"
                                    color="gray"
                                    style={{
                                        border: "2px dashed #dee2e6",
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    <IconPlus size={12} color="#adb5bd" />
                                </Avatar>
                            )}
                        </div>
                    </Popover.Target>
                    <Popover.Dropdown p={0} onClick={(e) => e.stopPropagation()}>
                        <Box p="xs" style={{ borderBottom: "1px solid #e9ecef" }}>
                            <TextInput
                                placeholder="Qidirish..."
                                size="xs"
                                leftSection={<IconSearch size={14} />}
                                value={assigneeSearch}
                                onChange={(e) => setAssigneeSearch(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                styles={{
                                    input: {
                                        backgroundColor: "#f8f9fa",
                                        border: "1px solid #e9ecef",
                                    },
                                }}
                            />
                        </Box>
                        <ScrollArea.Autosize mah={220} p="xs">
                            <Stack gap={4}>
                                {allUsers
                                    .filter((user) =>
                                        user.fullname?.toLowerCase().includes(assigneeSearch.toLowerCase())
                                    )
                                    .map((user) => {
                                        const isAssigned = currentAssigneeIds.includes(user.id);
                                        return (
                                            <Box
                                                key={user.id}
                                                p="xs"
                                                style={{
                                                    borderRadius: 6,
                                                    backgroundColor: isAssigned ? "#e7f5ff" : "transparent",
                                                    cursor: "pointer",
                                                    transition: "background-color 0.15s ease",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAssigneeChange(user.id);
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isAssigned) {
                                                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isAssigned) {
                                                        e.currentTarget.style.backgroundColor = "transparent";
                                                    }
                                                }}
                                            >
                                                <Group gap="sm" wrap="nowrap">
                                                    <Checkbox
                                                        checked={isAssigned}
                                                        onChange={() => {}}
                                                        size="sm"
                                                        color="blue"
                                                        styles={{
                                                            input: { cursor: "pointer" },
                                                        }}
                                                    />
                                                    <Avatar
                                                        size={32}
                                                        radius="xl"
                                                        src={user.avatarUrl}
                                                        color="blue"
                                                    >
                                                        {user.fullname?.charAt(0)}
                                                    </Avatar>
                                                    <Text size="sm" fw={500} lineClamp={1}>
                                                        {user.fullname}
                                                    </Text>
                                                </Group>
                                            </Box>
                                        );
                                    })}
                                {allUsers.filter((user) =>
                                    user.fullname?.toLowerCase().includes(assigneeSearch.toLowerCase())
                                ).length === 0 && (
                                    <Text size="xs" c="dimmed" ta="center" py="sm">
                                        Foydalanuvchi topilmadi
                                    </Text>
                                )}
                            </Stack>
                        </ScrollArea.Autosize>
                    </Popover.Dropdown>
                </Popover>

                {/* Meta info: Date + Counts */}
                <Group gap={10}>
                    {/* Due date */}
                    {task.dueDate && (
                        <Group gap={4}>
                            <IconCalendar size={12} color={isOverdue ? "#e74c3c" : "#adb5bd"} />
                            <Text size="xs" c={isOverdue ? "red" : "dimmed"} fw={isOverdue ? 500 : 400}>
                                {formatDate(task.dueDate)}
                            </Text>
                        </Group>
                    )}

                    {/* Subtasks count */}
                    {task._count?.subtasks ? (
                        <Group gap={3}>
                            <IconSubtask size={12} color="#adb5bd" />
                            <Text size="xs" c="dimmed">
                                {task._count.subtasks}
                            </Text>
                        </Group>
                    ) : null}

                    {/* Comments count */}
                    {task._count?.comments ? (
                        <Group gap={3}>
                            <IconMessage size={12} color="#adb5bd" />
                            <Text size="xs" c="dimmed">
                                {task._count.comments}
                            </Text>
                        </Group>
                    ) : null}

                    {/* Attachments count */}
                    {task._count?.attachments ? (
                        <Group gap={3}>
                            <IconPaperclip size={12} color="#adb5bd" />
                            <Text size="xs" c="dimmed">
                                {task._count.attachments}
                            </Text>
                        </Group>
                    ) : null}
                </Group>
            </Group>
        </Card>
    );
};

export default TaskCard;
