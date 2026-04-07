"use client";

import { useState, useCallback } from "react";
import {
    Container,
    Group,
    TextInput,
    Select,
    SegmentedControl,
    Loader,
    Center,
    Text,
    Stack,
} from "@mantine/core";
import { GuardedButton } from "@/components/shared/permission";
import {
    IconPlus,
    IconSearch,
    IconLayoutKanban,
    IconList,
    IconCalendar,
} from "@tabler/icons-react";
import {
    CustomModal,
    ConfirmationModal,
    useModal,
} from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import {
    useGetAllTasks,
    useDeleteTask,
    TaskGetResponse,
    TASK_PRIORITY_OPTIONS,
} from "@/features/task";
import { useGetAllProjects } from "@/features/project/hook/project.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import TaskForm from "../component/task.form";
import TaskKanbanBoard from "../component/task-kanban-board";
import TaskListView from "../component/task-list-view";
import TaskCalendarView from "../component/task-calendar-view";
import { TaskDetailDrawer } from "../component/task-detail-drawer";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const TaskPage = () => {
    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedTask, setSelectedTask] = useState<TaskGetResponse | null>(null);
    const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
    const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);

    const initialView = (searchParams.get("view") as "kanban" | "list" | "calendar") || "kanban";
    const [viewMode, setViewModeState] = useState<"kanban" | "list" | "calendar">(initialView);

    const setViewMode = (mode: "kanban" | "list" | "calendar") => {
        setViewModeState(mode);
        const params = new URLSearchParams(searchParams);
        params.set("view", mode);
        router.replace(`${pathname}?${params.toString()}`);
    };
    const [defaultDueDate, setDefaultDueDate] = useState<Date | undefined>(undefined);

    // Filters
    const [projectFilter, setProjectFilter] = useState<string | null>(null);

    const handleCreateTask = useCallback(
        (_status?: string, date?: Date) => {
            setDefaultDueDate(date);
            createModal.openModal();
        },
        [createModal]
    );
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

    const { data, isLoading } = useGetAllTasks({
        search: debouncedSearch || undefined,
        pageSize: 1000,
        pageNumber: 1,
        projectId: projectFilter || undefined,
        priority: priorityFilter as any,
        assigneeId: assigneeFilter || undefined,
    });

    const { data: projects } = useGetAllProjects({
        pageNumber: 1,
        pageSize: 1000,
    });

    const { data: users } = useGetUserQuery({
        pageNumber: 1,
        pageSize: 1000,
    });

    const deleteTaskMutation = useDeleteTask();

    const handleEdit = useCallback(
        (task: TaskGetResponse) => {
            setDetailTaskId(task.id);
        },
        []
    );

    const handleOpenEditModal = useCallback(
        (task: TaskGetResponse) => {
            setSelectedTask(task);
            editModal.openModal();
        },
        [editModal]
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
            const task = data?.data.find((t) => t.id === id);
            setSelectedTask(task || null);
            deleteModal.openModal();
        },
        [data, deleteModal]
    );



    const projectOptions = [
        { value: "", label: "Barcha loyihalar" },
        ...(projects?.data?.map((p) => ({
            value: p.id,
            label: `${p.key} - ${p.name}`,
        })) || []),
    ];

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

    return (
        <>
            <Stack gap="xl">
                <Group justify="space-between">
                    <div>
                        <Text size="xl" fw={700} c="#212529">
                            Vazifalar
                        </Text>
                        <Text size="sm" c="dimmed">
                            Barcha vazifalarni boshqarish
                        </Text>
                    </div>
                    <GuardedButton
                        permission="task:create"
                        leftSection={<IconPlus size={16} />}
                        onClick={() => handleCreateTask()}
                        style={{ backgroundColor: "#1e3a5f" }}
                    >
                        Yangi vazifa
                    </GuardedButton>
                </Group>
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
                            placeholder="Loyiha"
                            data={projectOptions}
                            value={projectFilter || ""}
                            onChange={(value) => setProjectFilter(value || null)}
                            clearable
                            style={{ width: 200 }}
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
                {isLoading ? (
                    <Center py="xl">
                        <Loader color="#1e3a5f" />
                    </Center>
                ) : (
                    <>
                        {viewMode === "kanban" && (
                            <TaskKanbanBoard
                                tasks={data?.data || []}
                                onEditTask={handleOpenEditModal}
                                onDeleteTask={handleDeleteClick}
                                onCreateTask={handleCreateTask}
                                onClickTask={handleEdit}
                            />
                        )}
                        {viewMode === "list" && (
                            <TaskListView
                                tasks={data?.data || []}
                                onEditTask={handleEdit}
                                onDeleteTask={handleDeleteClick}
                            />
                        )}
                        {viewMode === "calendar" && (
                            <TaskCalendarView
                                tasks={data?.data || []}
                                onEditTask={handleEdit}
                                onCreateTask={(date) => handleCreateTask(undefined, date)}
                            />
                        )}
                    </>
                )}
            </Stack>

            {/* Create Modal */}
            <CustomModal
                size="xl"
                closeOnOverlayClick={false}
                title="Yangi vazifa"
                description="Yangi vazifa yaratish uchun maydonlarni to'ldiring"
                isOpen={createModal.isOpen}
                onClose={() => {
                    createModal.closeModal();
                    setDefaultDueDate(undefined);
                }}
            >
                <TaskForm
                    modal={createModal}
                    mode="create"
                    defaultDueDate={defaultDueDate}
                />
            </CustomModal>
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
            <ConfirmationModal
                closeOnOverlayClick={false}
                title="Vazifani o'chirish"
                description="Ushbu vazifani o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
                onClose={deleteModal.closeModal}
                isOpen={deleteModal.isOpen}
                onConfirm={() => handleDelete(selectedTask?.id as string)}
            />

            {/* Task Detail Drawer */}
            <TaskDetailDrawer
                taskId={detailTaskId}
                isOpen={!!detailTaskId}
                onClose={() => setDetailTaskId(null)}
            />
        </>
    );
};

export default TaskPage;
