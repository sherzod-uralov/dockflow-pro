"use client";

import { useEffect } from "react";
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
    ColorInput,
    Radio,
    Box,
    Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
    ProjectGetResponse,
    PROJECT_STATUS_OPTIONS,
    PROJECT_COLOR_PALETTE,
    PROJECT_VISIBILITY_OPTIONS,
    ProjectStatus,
    ProjectVisibility,
}
    from "../type/project.type";
import {
    projectCreateSchema,
    ProjectCreateInput,
} from "../schema/project.schema";
import {
    useCreateProject,
    useUpdateProject,
} from "../hook/project.hook";
import { useGetAllDepartments } from "@/features/department/hook/department.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";

interface ProjectFormProps {
    modal: ModalState;
    mode: "create" | "update";
    project?: ProjectGetResponse;
    onSuccess?: () => void;
}

const ProjectForm = ({
    modal,
    mode,
    project,
    onSuccess,
}: ProjectFormProps) => {
    const createMutation = useCreateProject();
    const updateMutation = useUpdateProject();
    const { data: departments } = useGetAllDepartments({
        pageNumber: 1,
        pageSize: 1000,
    });
    const { data: usersData } = useGetUserQuery({ pageNumber: 1, pageSize: 1000 });
    const { data: profile } = useGetProfileQuery();
    const isAdmin =
        profile?.role?.name === "Super Administrator" ||
        profile?.role?.name === "Admin";

    const isUpdate = mode === "update";

    const form = useForm<ProjectCreateInput>({
        resolver: zodResolver(projectCreateSchema),
        defaultValues: isUpdate && project
            ? {
                name: project.name,
                description: project.description || "",
                key: project.key,
                status: project.status,
                visibility: project.visibility || ProjectVisibility.PRIVATE,
                departmentId: project.departmentId,
                initialMemberIds: [],
                startDate: project.startDate,
                endDate: project.endDate,
                budget: project.budget,
                color: project.color || PROJECT_COLOR_PALETTE[0],
                icon: project.icon || "folder",
            }
            : {
                name: "",
                description: "",
                key: "",
                status: ProjectStatus.PLANNING,
                visibility: ProjectVisibility.PRIVATE,
                departmentId: undefined,
                initialMemberIds: [],
                startDate: undefined,
                endDate: undefined,
                budget: undefined,
                color: PROJECT_COLOR_PALETTE[0],
                icon: "folder",
            },
        mode: "onChange",
    });

    const handleSubmit = (values: ProjectCreateInput) => {
        if (isUpdate && project) {
            const updateData = {
                name: values.name,
                description: values.description || undefined,
                status: values.status,
                visibility: values.visibility,
                departmentId: values.departmentId || undefined,
            };
            updateMutation.mutate(
                { id: project.id, data: updateData },
                {
                    onSuccess: () => {
                        modal.closeModal();
                        onSuccess?.();
                    },
                }
            );
        } else {
            // Auto-default visibility: department tanlanmasa PRIVATE, tanlansa DEPARTMENT
            const finalVisibility = values.visibility
                || (values.departmentId ? ProjectVisibility.DEPARTMENT : ProjectVisibility.PRIVATE);

            const createData = {
                ...values,
                visibility: finalVisibility,
                departmentId: values.departmentId || undefined,
                initialMemberIds: values.initialMemberIds?.length ? values.initialMemberIds : undefined,
                startDate: values.startDate || undefined,
                endDate: values.endDate || undefined,
                budget: values.budget || undefined,
            };
            createMutation.mutate(createData as any, {
                onSuccess: () => {
                    modal.closeModal();
                    onSuccess?.();
                },
            });
        }
    };

    const departmentOptions = departments?.data?.map((d) => ({
        value: d.id,
        label: d.name,
    })) || [];

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Stack gap="md">
                {/* Name and Key */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Loyiha nomi"
                        placeholder="Loyiha nomini kiriting"
                        size="sm"
                        radius="sm"
                        withAsterisk
                        error={form.formState.errors.name?.message}
                        {...form.register("name")}
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

                    <TextInput
                        label="Loyiha kaliti"
                        placeholder="WEB, API, MOBILE"
                        size="sm"
                        radius="sm"
                        withAsterisk
                        error={form.formState.errors.key?.message}
                        {...form.register("key")}
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                textTransform: "uppercase",
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

                {/* Description */}
                <Textarea
                    label="Tavsif"
                    placeholder="Loyiha tavsifini kiriting"
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

                {/* Status and Department */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Holat"
                        placeholder="Tanlang"
                        size="sm"
                        radius="sm"
                        data={PROJECT_STATUS_OPTIONS.map((s) => ({
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

                    <Select
                        label="Bo'lim"
                        placeholder="Tanlang"
                        size="sm"
                        radius="sm"
                        clearable
                        data={departmentOptions}
                        value={form.watch("departmentId") || null}
                        onChange={(value) =>
                            form.setValue("departmentId", value || undefined, {
                                shouldValidate: true,
                            })
                        }
                        error={form.formState.errors.departmentId?.message}
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

                {/* Visibility */}
                <Box>
                    <Text size="sm" fw={500} c="#495057" mb={6}>
                        Ko'rinish darajasi
                    </Text>
                    <Radio.Group
                        value={form.watch("visibility") || ProjectVisibility.PRIVATE}
                        onChange={(value) => form.setValue("visibility", value as ProjectVisibility, { shouldValidate: true })}
                    >
                        <Stack gap="xs">
                            {PROJECT_VISIBILITY_OPTIONS.map((opt) => (
                                <Radio
                                    key={opt.value}
                                    value={opt.value}
                                    disabled={opt.value === ProjectVisibility.PUBLIC && !isAdmin}
                                    label={
                                        <Box>
                                            <Text size="sm" fw={500} c="#212529">
                                                {opt.icon} {opt.label}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {opt.description}
                                            </Text>
                                        </Box>
                                    }
                                />
                            ))}
                        </Stack>
                    </Radio.Group>
                </Box>

                {/* Initial members — faqat create rejimda */}
                {!isUpdate && (
                    <MultiSelect
                        label="Boshlang'ich a'zolar"
                        placeholder="Foydalanuvchilarni tanlang (ixtiyoriy)"
                        size="sm"
                        radius="sm"
                        searchable
                        clearable
                        data={
                            usersData?.data?.map((u: any) => ({
                                value: u.id,
                                label: `${u.fullname} (@${u.username})`,
                            })) || []
                        }
                        value={form.watch("initialMemberIds") || []}
                        onChange={(value) =>
                            form.setValue("initialMemberIds", value, { shouldValidate: true })
                        }
                        styles={{
                            input: {
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                "&:focus": { borderColor: "#1e3a5f" },
                            },
                            label: { color: "#495057", fontWeight: 500, marginBottom: 4 },
                        }}
                    />
                )}

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
                        value={form.watch("endDate") ? new Date(form.watch("endDate") as string) : null}
                        onChange={(value: any) => {
                            const date = typeof value === 'string' ? new Date(value) : value;
                            if (date && !isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                form.setValue("endDate", `${year}-${month}-${day}`, { shouldValidate: true });
                            } else {
                                form.setValue("endDate", undefined, { shouldValidate: true });
                            }
                        }}
                        error={form.formState.errors.endDate?.message}
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

                {/* Budget and Color */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NumberInput
                        label="Byudjet"
                        placeholder="0"
                        size="sm"
                        radius="sm"
                        min={0}
                        value={form.watch("budget")}
                        onChange={(value) =>
                            form.setValue("budget", value as number, {
                                shouldValidate: true,
                            })
                        }
                        error={form.formState.errors.budget?.message}
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

                    <ColorInput
                        label="Rang"
                        placeholder="Rangni tanlang"
                        size="sm"
                        radius="sm"
                        swatches={[...PROJECT_COLOR_PALETTE]}
                        value={form.watch("color")}
                        onChange={(value) =>
                            form.setValue("color", value, { shouldValidate: true })
                        }
                        error={form.formState.errors.color?.message}
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

export default ProjectForm;
