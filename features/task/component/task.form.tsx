"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalState } from "@/types/modal";
import {
    Button,
    TextInput,
    Textarea,
    Select,
    MultiSelect,
    Group,
    Stack,
    SimpleGrid,
    NumberInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
    TaskFormData,
    TaskGetResponse,
    TASK_STATUS_OPTIONS,
    TASK_PRIORITY_OPTIONS,
    TaskStatus,
    TaskPriority,
} from "../type/task.type";
import {
    taskCreateSchema,
    TaskCreateInput,
} from "../schema/task.schema";
import {
    useCreateTask,
    useUpdateTask,
} from "../hook/task.hook";
import { useGetAllProjects } from "@/features/project/hook/project.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";

interface TaskFormProps {
    modal: ModalState;
    mode: "create" | "update";
    task?: TaskGetResponse;
    onSuccess?: () => void;
    defaultProjectId?: string;
    defaultStatus?: string;
    defaultDueDate?: Date;
}

const TaskForm = ({
    modal,
    mode,
    task,
    onSuccess,
    defaultProjectId,
    defaultStatus,
    defaultDueDate,
}: TaskFormProps) => {
    const createMutation = useCreateTask();
    const updateMutation = useUpdateTask();

    const { data: projects } = useGetAllProjects({
        pageNumber: 1,
        pageSize: 1000,
    });

    const { data: users } = useGetUserQuery({
        pageNumber: 1,
        pageSize: 1000,
    });

    const isUpdate = mode === "update";

    const formatDateForForm = (date?: Date) => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const form = useForm<TaskCreateInput>({
        resolver: zodResolver(taskCreateSchema),
        defaultValues: isUpdate && task
            ? {
                title: task.title,
                description: task.description || "",
                projectId: task.projectId,
                categoryId: task.categoryId,
                status: task.status,
                priority: task.priority,
                assigneeIds: task.assignees?.map(a => a.user.id) || [],
                parentTaskId: task.parentTaskId,
                startDate: task.startDate || undefined,
                dueDate: task.dueDate || undefined,
                estimatedHours: task.estimatedHours || undefined,
                position: task.position || 0,
            }
            : {
                title: "",
                description: "",
                projectId: defaultProjectId || "",
                categoryId: undefined,
                status: (defaultStatus as any) || TaskStatus.NOT_STARTED,
                priority: TaskPriority.MEDIUM,
                assigneeIds: [],
                parentTaskId: undefined,
                startDate: formatDateForForm(defaultDueDate),
                dueDate: formatDateForForm(defaultDueDate),
                estimatedHours: undefined,
                position: 0,
            },
        mode: "onChange",
    });

    const handleSubmit = (values: TaskCreateInput) => {
        if (isUpdate && task) {
            const updateData = {
                title: values.title,
                description: values.description || undefined,
                categoryId: values.categoryId || undefined,
                status: values.status,
                priority: values.priority,
                assigneeIds: values.assigneeIds?.length ? values.assigneeIds : undefined,
                parentTaskId: values.parentTaskId || undefined,
            };
            updateMutation.mutate(
                { id: task.id, data: updateData },
                {
                    onSuccess: () => {
                        modal.closeModal();
                        onSuccess?.();
                    },
                }
            );
        } else {
            const createData = {
                ...values,
                categoryId: values.categoryId || undefined,
                assigneeIds: values.assigneeIds?.length ? values.assigneeIds : undefined,
                parentTaskId: values.parentTaskId || undefined,
                startDate: values.startDate || undefined,
                dueDate: values.dueDate || undefined,
                estimatedHours: values.estimatedHours || undefined,
            };
            createMutation.mutate(createData as any, {
                onSuccess: () => {
                    modal.closeModal();
                    onSuccess?.();
                },
            });
        }
    };

    const projectOptions = projects?.data?.map((p) => ({
        value: p.id,
        label: `${p.key} - ${p.name}`,
    })) || [];

    const userOptions = users?.data?.map((u) => ({
        value: u.id,
        label: u.fullname,
    })) || [];

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Stack gap="md">
                {/* Title */}
                <TextInput
                    label="Vazifa nomi"
                    placeholder="Vazifa nomini kiriting"
                    size="sm"
                    radius="sm"
                    withAsterisk
                    error={form.formState.errors.title?.message}
                    {...form.register("title")}
                    styles={{
                        input: {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            "&:focus": {
                                borderColor: "#1e3a5f",
                            },
                        },
                        label: {
                            color: "#495057",
                            fontWeight: 500,
                            marginBottom: 4,
                        },
                    }}
                />

                {/* Description */}
                <Textarea
                    label="Tavsif"
                    placeholder="Vazifa tavsifini kiriting"
                    size="sm"
                    radius="sm"
                    minRows={3}
                    error={form.formState.errors.description?.message}
                    {...form.register("description")}
                    styles={{
                        input: {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            "&:focus": {
                                borderColor: "#1e3a5f",
                            },
                        },
                        label: {
                            color: "#495057",
                            fontWeight: 500,
                            marginBottom: 4,
                        },
                    }}
                />

                {/* Project and Status */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Loyiha"
                        placeholder="Tanlang"
                        size="sm"
                        radius="sm"
                        withAsterisk
                        searchable
                        data={projectOptions}
                        value={form.watch("projectId")}
                        onChange={(value) =>
                            form.setValue("projectId", value || "", { shouldValidate: true })
                        }
                        error={form.formState.errors.projectId?.message}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": {
                                    borderColor: "#1e3a5f",
                                },
                            },
                            label: {
                                color: "#495057",
                                fontWeight: 500,
                                marginBottom: 4,
                            },
                        }}
                    />

                    <Select
                        label="Holat"
                        placeholder="Tanlang"
                        size="sm"
                        radius="sm"
                        data={TASK_STATUS_OPTIONS.map((s) => ({
                            value: s.value,
                            label: s.label,
                        }))}
                        value={form.watch("status")}
                        onChange={(value) =>
                            form.setValue("status", value as any, { shouldValidate: true })
                        }
                        error={form.formState.errors.status?.message}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": {
                                    borderColor: "#1e3a5f",
                                },
                            },
                            label: {
                                color: "#495057",
                                fontWeight: 500,
                                marginBottom: 4,
                            },
                        }}
                    />
                </SimpleGrid>

                {/* Priority and Assigned To */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Muhimlik"
                        placeholder="Tanlang"
                        size="sm"
                        radius="sm"
                        data={TASK_PRIORITY_OPTIONS.map((p) => ({
                            value: p.value,
                            label: p.label,
                        }))}
                        value={form.watch("priority")}
                        onChange={(value) =>
                            form.setValue("priority", value as any, { shouldValidate: true })
                        }
                        error={form.formState.errors.priority?.message}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": {
                                    borderColor: "#1e3a5f",
                                },
                            },
                            label: {
                                color: "#495057",
                                fontWeight: 500,
                                marginBottom: 4,
                            },
                        }}
                    />

                    <MultiSelect
                        label="Mas'ul shaxslar"
                        placeholder="Tanlang"
                        size="sm"
                        radius="sm"
                        clearable
                        searchable
                        data={userOptions}
                        value={form.watch("assigneeIds") || []}
                        onChange={(value) =>
                            form.setValue("assigneeIds", value, {
                                shouldValidate: true,
                            })
                        }
                        error={form.formState.errors.assigneeIds?.message}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": {
                                    borderColor: "#1e3a5f",
                                },
                            },
                            label: {
                                color: "#495057",
                                fontWeight: 500,
                                marginBottom: 4,
                            },
                        }}
                    />
                </SimpleGrid>

                {/* Dates */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <DateInput
                        label="Boshlanish sanasi"
                        placeholder="Sanani tanlang"
                        size="sm"
                        radius="sm"
                        clearable
                        value={form.watch("startDate") ? new Date(form.watch("startDate") as string) : null}
                        onChange={(value: any) => {
                            const date = typeof value === 'string' ? new Date(value) : value;
                            if (date && !isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                form.setValue("startDate", `${year}-${month}-${day}`, { shouldValidate: true });
                            } else {
                                form.setValue("startDate", undefined, { shouldValidate: true });
                            }
                        }}
                        error={form.formState.errors.startDate?.message}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": {
                                    borderColor: "#1e3a5f",
                                },
                            },
                            label: {
                                color: "#495057",
                                fontWeight: 500,
                                marginBottom: 4,
                            },
                        }}
                    />

                    <DateInput
                        label="Tugash sanasi"
                        placeholder="Sanani tanlang"
                        size="sm"
                        radius="sm"
                        clearable
                        value={form.watch("dueDate") ? new Date(form.watch("dueDate") as string) : null}
                        onChange={(value: any) => {
                            const date = typeof value === 'string' ? new Date(value) : value;
                            if (date && !isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                form.setValue("dueDate", `${year}-${month}-${day}`, { shouldValidate: true });
                            } else {
                                form.setValue("dueDate", undefined, { shouldValidate: true });
                            }
                        }}
                        error={form.formState.errors.dueDate?.message}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": {
                                    borderColor: "#1e3a5f",
                                },
                            },
                            label: {
                                color: "#495057",
                                fontWeight: 500,
                                marginBottom: 4,
                            },
                        }}
                    />
                </SimpleGrid>

                {/* Estimated Hours */}
                <NumberInput
                    label="Taxminiy soatlar"
                    placeholder="0"
                    size="sm"
                    radius="sm"
                    min={0}
                    step={0.5}
                    value={form.watch("estimatedHours")}
                    onChange={(value) =>
                        form.setValue("estimatedHours", value as number, {
                            shouldValidate: true,
                        })
                    }
                    error={form.formState.errors.estimatedHours?.message}
                    styles={{
                        input: {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            "&:focus": {
                                borderColor: "#1e3a5f",
                            },
                        },
                        label: {
                            color: "#495057",
                            fontWeight: 500,
                            marginBottom: 4,
                        },
                    }}
                />

                {/* Actions */}
                <Group
                    justify="flex-end"
                    gap="xs"
                    pt="md"
                    style={{ borderTop: "1px solid #e9ecef" }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        radius="sm"
                        onClick={modal.closeModal}
                        styles={{
                            root: {
                                borderColor: "#e9ecef",
                                color: "#495057",
                                "&:hover": {
                                    backgroundColor: "#f8f9fa",
                                },
                            },
                        }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        radius="sm"
                        disabled={!form.formState.isValid}
                        loading={
                            form.formState.isSubmitting ||
                            createMutation.isLoading ||
                            updateMutation.isLoading
                        }
                        style={{ backgroundColor: "#1e3a5f" }}
                    >
                        {form.formState.isSubmitting ||
                            createMutation.isLoading ||
                            updateMutation.isLoading
                            ? isUpdate
                                ? "Yangilanmoqda..."
                                : "Qo'shilmoqda..."
                            : isUpdate
                                ? "Yangilash"
                                : "Qo'shish"}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

export default TaskForm;
