"use client";

import {
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconBook,
    IconHash,
    IconTemplate,
    IconBuilding,
    IconUser,
} from "@tabler/icons-react";
import {
    useJournalCreateMutation,
    useUpdateJournal,
} from "../hook/journal.hook";
import { useGetAllDepartments } from "@/features/department/hook/department.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { SingleJournalApiResponse } from "../type/journal.types";

interface JournalFormProps {
    mode: "create" | "edit";
    journal?: SingleJournalApiResponse | null;
    onClose: () => void;
    onSuccess?: () => void;
}

interface JournalFormValues {
    name: string;
    prefix: string;
    format: string;
    departmentId: string;
    responsibleUserId: string;
}

const JournalForm = ({ mode, journal, onClose, onSuccess }: JournalFormProps) => {
    const isUpdate = mode === "edit";

    // Hooks
    const createMutation = useJournalCreateMutation();
    const updateMutation = useUpdateJournal();

    const { data: departmentsData, isLoading: isLoadingDepartments } = useGetAllDepartments({
        pageNumber: 1,
        pageSize: 100,
        search: "",
    });

    const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery({
        pageNumber: 1,
        pageSize: 100,
        search: "",
    });

    // Form
    const form = useForm<JournalFormValues>({
        initialValues: {
            name: journal?.name || "",
            prefix: journal?.prefix || "",
            format: journal?.format || "",
            departmentId: journal?.department?.id || "",
            responsibleUserId: journal?.responsibleUser?.id || "",
        },
        validate: {
            name: (value) => (!value ? "Jurnal nomi kiritilishi shart" : null),
            prefix: (value) => (!value ? "Prefiks kiritilishi shart" : null),
            format: (value) => (!value ? "Format kiritilishi shart" : null),
            departmentId: (value) => (!value ? "Bo'lim tanlanishi shart" : null),
            responsibleUserId: (value) => (!value ? "Mas'ul shaxs tanlanishi shart" : null),
        },
    });

    const handleSubmit = (values: JournalFormValues) => {
        if (isUpdate && journal?.id) {
            updateMutation.mutate(
                { id: journal.id, data: values },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        }
    };

    const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
                {/* Name */}
                <TextInput
                    label="Jurnal nomi"
                    placeholder="Masalan: Kiruvchi hujjatlar jurnali"
                    size="md"
                    radius="sm"
                    required
                    leftSection={<IconBook size={18} color="#868e96" />}
                    {...form.getInputProps("name")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                />

                {/* Prefix and Format */}
                <SimpleGrid cols={2}>
                    <TextInput
                        label="Prefiks"
                        placeholder="Masalan: KHM"
                        size="md"
                        radius="sm"
                        required
                        leftSection={<IconHash size={18} color="#868e96" />}
                        {...form.getInputProps("prefix")}
                        styles={{
                            label: { fontWeight: 500, marginBottom: 6 },
                        }}
                    />
                    <TextInput
                        label="Format"
                        placeholder="Masalan: {PREFIX}-{YEAR}-{NUMBER}"
                        size="md"
                        radius="sm"
                        required
                        leftSection={<IconTemplate size={18} color="#868e96" />}
                        {...form.getInputProps("format")}
                        styles={{
                            label: { fontWeight: 500, marginBottom: 6 },
                        }}
                    />
                </SimpleGrid>

                {/* Department */}
                <Select
                    label="Bo'lim"
                    placeholder="Bo'limni tanlang"
                    size="md"
                    radius="sm"
                    required
                    searchable
                    leftSection={<IconBuilding size={18} color="#868e96" />}
                    data={
                        departmentsData?.data?.map((dept) => ({
                            value: dept.id,
                            label: dept.name,
                        })) || []
                    }
                    {...form.getInputProps("departmentId")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                    disabled={isLoadingDepartments}
                />

                {/* Responsible User */}
                <Select
                    label="Mas'ul shaxs"
                    placeholder="Foydalanuvchini tanlang"
                    size="md"
                    radius="sm"
                    required
                    searchable
                    leftSection={<IconUser size={18} color="#868e96" />}
                    data={
                        usersData?.data?.map((user) => ({
                            value: user.id,
                            label: user.username,
                        })) || []
                    }
                    {...form.getInputProps("responsibleUserId")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                    disabled={isLoadingUsers}
                />

                {/* Actions */}
                <Group justify="flex-end" gap="sm" pt="md">
                    <Button
                        variant="default"
                        onClick={onClose}
                        radius="sm"
                        size="md"
                        disabled={isSubmitting}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        type="submit"
                        radius="sm"
                        size="md"
                        loading={isSubmitting}
                        styles={{
                            root: {
                                backgroundColor: "#1e3a5f",
                                "&:hover": { backgroundColor: "#162d4a" },
                            },
                        }}
                    >
                        {isUpdate ? "Yangilash" : "Qo'shish"}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

export default JournalForm;
