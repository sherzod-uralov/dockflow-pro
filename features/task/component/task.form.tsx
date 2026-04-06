"use client";

import { useState } from "react";
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
    TASK_PRIORITY_OPTIONS,
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
import { useGetAllBoardColumns } from "@/features/board-column/hook/board-column.hook";
import { useGetAllTaskCategories } from "@/features/task-category/hook/task-category.hook";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import { FileUpload } from "@/components/shared/ui/custom-file-upload";

interface TaskFormProps {
    modal: ModalState;
    mode: "create" | "update";
    task?: TaskGetResponse;
    onSuccess?: () => void;
    defaultProjectId?: string;
    defaultDueDate?: Date;
}
//test
const TaskForm = ({
    modal,
    mode,
    task,
    onSuccess,
    defaultProjectId,
    defaultDueDate,
}: TaskFormProps) => {
    const createMutation = useCreateTask();
    const updateMutation = useUpdateTask();
    const uploadMutation = useCreateAttachment();
    const [coverFile, setCoverFile] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState(false);

    const { data: projects } = useGetAllProjects({
        pageNumber: 1,
        pageSize: 1000,
    });

    const { data: users } = useGetUserQuery({
        pageNumber: 1,
        pageSize: 1000,
    });

    const { data: categories } = useGetAllTaskCategories({
        pageNumber: 1,
        pageSize: 1000,
        isActive: true,
    });

    const isUpdate = mode === "update";

    const [activeProjectId, setActiveProjectId] = useState(
        isUpdate && task ? task.projectId : defaultProjectId || ""
    );

    const { data: boardColumns } = useGetAllBoardColumns(
        activeProjectId
            ? { projectId: activeProjectId }
            : undefined
    );

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
                priority: task.priority,
                assigneeIds: task.assignees?.map(a => a.user.id) || [],
                parentTaskId: task.parentTaskId,
                startDate: task.startDate || undefined,
                dueDate: task.dueDate || undefined,
                estimatedHours: task.estimatedHours || undefined,
                position: task.position || 0,
                boardColumnId: task.boardColumnId || undefined,
                score: task.score || undefined,
                coverImageUrl: task.coverImageUrl || undefined,
            }
            : {
                title: "",
                description: "",
                projectId: defaultProjectId || "",
                categoryId: undefined,
                priority: TaskPriority.MEDIUM,
                assigneeIds: [],
                parentTaskId: undefined,
                startDate: formatDateForForm(defaultDueDate),
                dueDate: formatDateForForm(defaultDueDate),
                estimatedHours: undefined,
                position: 0,
                boardColumnId: undefined,
                score: undefined,
                coverImageUrl: undefined,
            },
        mode: "onChange",
    });

    const handleSubmit = async (values: TaskCreateInput) => {
        setIsUploading(true);

        let coverImageUrl = values.coverImageUrl || undefined;

        if (coverFile) {
            try {
                const uploaded = await uploadMutation.mutateAsync(coverFile);
                coverImageUrl = uploaded.fileUrl;
            } catch {
                setIsUploading(false);
                return;
            }
        }

        setIsUploading(false);

        if (isUpdate && task) {
            const updateData = {
                title: values.title,
                description: values.description || undefined,
                categoryId: values.categoryId || undefined,
                priority: values.priority,
                assigneeIds: values.assigneeIds?.length ? values.assigneeIds : undefined,
                parentTaskId: values.parentTaskId || undefined,
                boardColumnId: values.boardColumnId || undefined,
                score: values.score ?? undefined,
                coverImageUrl,
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
                boardColumnId: values.boardColumnId || undefined,
                score: values.score ?? undefined,
                coverImageUrl,
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

    const categoryOptions = categories?.data?.map((c) => ({
        value: c.id,
        label: c.name,
    })) || [];

    const boardColumnOptions = boardColumns?.data?.map((col) => ({
        value: col.id,
        label: col.name,
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

                {/* Project and Priority */}
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
                        onChange={(value) => {
                            form.setValue("projectId", value || "", { shouldValidate: true });
                            setActiveProjectId(value || "");
                            form.setValue("boardColumnId", undefined);
                        }}
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
                </SimpleGrid>

                {/* Assigned To */}
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

                {/* Category and Board Column */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Kategoriya"
                        placeholder="Tanlang"
                        size="sm"
                        radius="sm"
                        clearable
                        searchable
                        data={categoryOptions}
                        value={form.watch("categoryId") || null}
                        onChange={(value) =>
                            form.setValue("categoryId", value || undefined, { shouldValidate: true })
                        }
                        error={form.formState.errors.categoryId?.message}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": { borderColor: "#1e3a5f" },
                            },
                            label: { color: "#495057", fontWeight: 500, marginBottom: 4 },
                        }}
                    />

                    <Select
                        label="Board ustuni"
                        placeholder="Tanlang"
                        size="sm"
                        radius="sm"
                        clearable
                        searchable
                        disabled={!activeProjectId}
                        data={boardColumnOptions}
                        value={form.watch("boardColumnId") || null}
                        onChange={(value) =>
                            form.setValue("boardColumnId", value || undefined, { shouldValidate: true })
                        }
                        error={form.formState.errors.boardColumnId?.message}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": { borderColor: "#1e3a5f" },
                            },
                            label: { color: "#495057", fontWeight: 500, marginBottom: 4 },
                        }}
                    />
                </SimpleGrid>

                {/* Score */}
                <NumberInput
                    label="Ball"
                    placeholder="0"
                    size="sm"
                    radius="sm"
                    min={0}
                    step={1}
                    value={form.watch("score")}
                    onChange={(value) =>
                        form.setValue("score", value as number, { shouldValidate: true })
                    }
                    error={form.formState.errors.score?.message}
                    styles={{
                        input: {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            "&:focus": { borderColor: "#1e3a5f" },
                        },
                        label: { color: "#495057", fontWeight: 500, marginBottom: 4 },
                    }}
                />

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
                            "&:focus": { borderColor: "#1e3a5f" },
                        },
                        label: { color: "#495057", fontWeight: 500, marginBottom: 4 },
                    }}
                />

                {/* Cover Image Upload */}
                <FileUpload
                    label="Muqova rasmi"
                    name="coverImage"
                    accept={{ "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] }}
                    helperText="JPG, PNG, GIF, WEBP (max 10MB)"
                    maxSize={10 * 1024 * 1024}
                    existingFiles={
                        isUpdate && task?.coverImageUrl
                            ? [{ id: "cover", fileName: "Muqova rasmi", fileUrl: task.coverImageUrl }]
                            : []
                    }
                    onDeleteExisting={() => {
                        form.setValue("coverImageUrl", undefined);
                        setCoverFile(undefined);
                    }}
                    onChange={(file) => {
                        if (file && !Array.isArray(file)) {
                            setCoverFile(file);
                        } else {
                            setCoverFile(undefined);
                        }
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
                            isUploading ||
                            createMutation.isLoading ||
                            updateMutation.isLoading
                        }
                        style={{ backgroundColor: "#1e3a5f" }}
                    >
                        {form.formState.isSubmitting ||
                            isUploading ||
                            createMutation.isLoading ||
                            updateMutation.isLoading
                            ? isUploading
                                ? "Rasm yuklanmoqda..."
                                : isUpdate
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
