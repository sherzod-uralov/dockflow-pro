"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Group,
    Button,
    TextInput,
    Select,
    SegmentedControl,
    Loader,
    Center,
    Text,
    Stack,
    Badge,
    Box,
    Breadcrumbs,
    Anchor,
} from "@mantine/core";
import {
    IconPlus,
    IconSearch,
    IconLayoutKanban,
    IconList,
    IconCalendar,
    IconArrowLeft,
    IconSettings,
} from "@tabler/icons-react";
import {
    CustomModal,
    ConfirmationModal,
    useModal,
} from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { useTaskSocket } from "@/hooks/socket";
import {
    useGetAllTasks,
    useDeleteTask,
    TaskGetResponse,
    TASK_PRIORITY_OPTIONS,
} from "@/features/task";
import { useGetProjectById } from "@/features/project/hook/project.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import TaskForm from "@/features/task/component/task.form";
import TaskKanbanBoard from "@/features/task/component/task-kanban-board";
import TaskListView from "@/features/task/component/task-list-view";
import TaskCalendarView from "@/features/task/component/task-calendar-view";
import { TaskDetailDrawer } from "@/features/task/component/task-detail-drawer";
import ProjectForm from "@/features/project/component/project.form";

export default function ProjectTasksPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params?.id as string;

    // Real-time task updates via WebSocket
    useTaskSocket(projectId);

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();
    const editProjectModal = useModal();

    const [selectedTask, setSelectedTask] = useState<TaskGetResponse | null>(null);
    const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
    const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
    const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar">("kanban");
    const [defaultDueDate, setDefaultDueDate] = useState<Date | undefined>(undefined);
    const [defaultColumnId, setDefaultColumnId] = useState<string | undefined>(undefined);

    // Filters
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

    // Fetch project details
    const { data: project, isLoading: isProjectLoading } = useGetProjectById(projectId);

    // Fetch tasks for this project
    const { data: tasksData, isLoading: isTasksLoading } = useGetAllTasks({
        search: debouncedSearch || undefined,
        pageSize: 1000,
        pageNumber: 1,
        projectId: projectId,
        priority: priorityFilter as any,
        assigneeId: assigneeFilter || undefined,
    });

    const { data: users } = useGetUserQuery({
        pageNumber: 1,
        pageSize: 1000,
    });

    const deleteTaskMutation = useDeleteTask();

    const handleCreateTask = useCallback(
        (columnIdOrStatus?: string, date?: Date) => {
            setDefaultDueDate(date);
            setDefaultColumnId(columnIdOrStatus);
            createModal.openModal();
        },
        [createModal]
    );

    const handleEdit = useCallback(
        (task: TaskGetResponse) => {
            setDetailTaskId(task.id);
        },
        []
    );

    const handleDelete = useCallback(
        (id: string) => {
            deleteTaskMutation.mutate(id);
            deleteModal.closeModal();
            setSelectedTask(null);
        },
        [deleteTaskMutation, deleteModal]
    );

    const handleDeleteClick = useCallback(
        (id: string) => {
            const task = tasksData?.data.find((t) => t.id === id);
            setSelectedTask(task || null);
            deleteModal.openModal();
        },
        [tasksData, deleteModal]
    );

    const priorityOptions = [
        { value: "", label: "Barcha muhimliklar" },
        ...TASK_PRIORITY_OPTIONS.map((p) => ({
            value: p.value,
            label: p.label,
        })),
    ];

    const assigneeOptions = [
        { value: "", label: "Barcha foydalanuvchilar" },
        ...(users?.data?.map((u) => ({
            value: u.id,
            label: u.fullname,
        })) || []),
    ];

    const isLoading = isProjectLoading || isTasksLoading;
    const projectColor = project?.color || "#3498db";

    if (isProjectLoading) {
        return (
            <Center h="50vh">
                <Loader color="#1e3a5f" />
            </Center>
        );
    }

    if (!project) {
        return (
            <Center h="50vh">
                <Stack align="center" gap="md">
                    <Text size="lg" c="dimmed">
                        Loyiha topilmadi
                    </Text>
                    <Button
                        variant="outline"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={() => router.push("/dashboard/project")}
                    >
                        Loyihalarga qaytish
                    </Button>
                </Stack>
            </Center>
        );
    }

    return (
        <>
            <Stack gap="xl">
                {/* Breadcrumbs */}
                <Breadcrumbs>
                    <Anchor
                        component="button"
                        onClick={() => router.push("/dashboard/project")}
                        c="dimmed"
                        size="sm"
                    >
                        Loyihalar
                    </Anchor>
                    <Text size="sm" c="#212529">
                        {project.name}
                    </Text>
                </Breadcrumbs>


                {/* Tasks Header */}
                <Group justify="space-between">
                    <div>
                        <Text size="lg" fw={600} c="#212529">
                            Vazifalar
                        </Text>
                        <Text size="sm" c="dimmed">
                            {tasksData?.count || 0} ta vazifa
                        </Text>
                    </div>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => handleCreateTask()}
                        style={{ backgroundColor: "#1e3a5f" }}
                    >
                        Yangi vazifa
                    </Button>
                </Group>

                {/* Filters and View Toggle */}
                <Group justify="space-between" wrap="wrap">
                    <Group gap="md" style={{ flex: 1 }}>
                        <TextInput
                            placeholder="Vazifalarni qidirish..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, maxWidth: 300 }}
                            styles={{
                                input: {
                                    backgroundColor: "#f8f9fa",
                                    border: "1px solid #e9ecef",
                                },
                            }}
                        />

                        <Select
                            placeholder="Muhimlik"
                            data={priorityOptions}
                            value={priorityFilter || ""}
                            onChange={(value) => setPriorityFilter(value || null)}
                            clearable
                            style={{ width: 180 }}
                            styles={{
                                input: {
                                    backgroundColor: "#f8f9fa",
                                    border: "1px solid #e9ecef",
                                },
                            }}
                        />

                        <Select
                            placeholder="Mas'ul shaxs"
                            data={assigneeOptions}
                            value={assigneeFilter || ""}
                            onChange={(value) => setAssigneeFilter(value || null)}
                            clearable
                            searchable
                            style={{ width: 200 }}
                            styles={{
                                input: {
                                    backgroundColor: "#f8f9fa",
                                    border: "1px solid #e9ecef",
                                },
                            }}
                        />
                    </Group>

                    <SegmentedControl
                        value={viewMode}
                        onChange={(value) => setViewMode(value as "kanban" | "list" | "calendar")}
                        data={[
                            {
                                value: "kanban",
                                label: (
                                    <Center>
                                        <IconLayoutKanban size={16} />
                                    </Center>
                                ),
                            },
                            {
                                value: "list",
                                label: (
                                    <Center>
                                        <IconList size={16} />
                                    </Center>
                                ),
                            },
                            {
                                value: "calendar",
                                label: (
                                    <Center>
                                        <IconCalendar size={16} />
                                    </Center>
                                ),
                            },
                        ]}
                    />
                </Group>

                {/* Content */}
                {isTasksLoading ? (
                    <Center py="xl">
                        <Loader color="#1e3a5f" />
                    </Center>
                ) : (
                    <>
                        {viewMode === "kanban" && (
                            <TaskKanbanBoard
                                tasks={tasksData?.data || []}
                                projectId={projectId}
                                onDeleteTask={handleDeleteClick}
                                onCreateTask={handleCreateTask}
                                onClickTask={handleEdit}
                            />
                        )}
                        {viewMode === "list" && (
                            <TaskListView
                                tasks={tasksData?.data || []}
                                onEditTask={handleEdit}
                                onDeleteTask={handleDeleteClick}
                            />
                        )}
                        {viewMode === "calendar" && (
                            <TaskCalendarView
                                tasks={tasksData?.data || []}
                                onEditTask={handleEdit}
                                onCreateTask={(date) => handleCreateTask(undefined, date)}
                            />
                        )}
                    </>
                )}
            </Stack>

            {/* Create Task Modal */}
            <CustomModal
                size="xl"
                closeOnOverlayClick={false}
                title="Yangi vazifa"
                description={`"${project.name}" loyihasi uchun yangi vazifa yaratish`}
                isOpen={createModal.isOpen}
                onClose={() => {
                    createModal.closeModal();
                    setDefaultDueDate(undefined);
                    setDefaultColumnId(undefined);
                }}
            >
                <TaskForm
                    modal={createModal}
                    mode="create"
                    defaultProjectId={projectId}
                    defaultDueDate={defaultDueDate}
                    defaultBoardColumnId={defaultColumnId}
                />
            </CustomModal>

            {/* Edit Task Modal */}
            <CustomModal
                size="xl"
                closeOnOverlayClick={false}
                title="Vazifani tahrirlash"
                description="Vazifa ma'lumotlarini yangilang"
                isOpen={editModal.isOpen}
                onClose={() => {
                    editModal.closeModal();
                    setSelectedTask(null);
                }}
            >
                <TaskForm
                    modal={editModal}
                    mode="update"
                    task={selectedTask as TaskGetResponse}
                />
            </CustomModal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                closeOnOverlayClick={false}
                title="Vazifani o'chirish"
                description="Ushbu vazifani o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
                onClose={deleteModal.closeModal}
                isOpen={deleteModal.isOpen}
                onConfirm={() => handleDelete(selectedTask?.id as string)}
            />

            {/* Edit Project Modal */}
            <CustomModal
                size="xl"
                closeOnOverlayClick={false}
                title="Loyihani tahrirlash"
                description="Loyiha sozlamalarini yangilang"
                isOpen={editProjectModal.isOpen}
                onClose={editProjectModal.closeModal}
            >
                <ProjectForm
                    modal={editProjectModal}
                    mode="update"
                    project={project}
                />
            </CustomModal>

            {/* Task Detail Drawer */}
            <TaskDetailDrawer
                taskId={detailTaskId}
                isOpen={!!detailTaskId}
                onClose={() => setDetailTaskId(null)}
            />
        </>
    );
}
