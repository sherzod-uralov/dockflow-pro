"use client";

import {
    TextInput,
    Textarea,
    Select,
    Button,
    Group,
    Stack,
    SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconBuilding,
    IconFileDescription,
    IconHash,
    IconMapPin,
    IconUser,
} from "@tabler/icons-react";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import {
    DepartmentResponse,
    useCreateDepartment,
    useUpdateDepartment,
} from "@/features/department";

interface DepartmentFormModalProps {
    mode: "create" | "update";
    department?: DepartmentResponse | null;
    onClose: () => void;
    onSuccess?: () => void;
}

interface DepartmentFormValues {
    name: string;
    description: string;
    code: string;
    location: string;
    directorId: string;
}

const DepartmentFormModal = ({
    mode,
    department,
    onClose,
    onSuccess,
}: DepartmentFormModalProps) => {
    const isUpdate = mode === "update";

    // Hooks
    const createMutation = useCreateDepartment();
    const updateMutation = useUpdateDepartment();

    const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery({
        pageNumber: 1,
        pageSize: 100,
        search: "",
    });

    // Form
    const form = useForm<DepartmentFormValues>({
        initialValues: {
            name: department?.name || "",
            description: department?.description || "",
            code: department?.code || "",
            location: department?.location || "",
            directorId: department?.director?.id || "",
        },
        validate: {
            name: (value) => (!value ? "Bo'lim nomi kiritilishi shart" : null),
        },
    });

    const handleSubmit = (values: DepartmentFormValues) => {
        if (isUpdate && department?.id) {
            updateMutation.mutate(
                { id: department.id, data: values },
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
                    label="Bo'lim nomi"
                    placeholder="Masalan: IT bo'limi"
                    size="md"
                    radius="sm"
                    required
                    leftSection={<IconBuilding size={18} color="#868e96" />}
                    {...form.getInputProps("name")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                />

                {/* Description */}
                <Textarea
                    label="Tavsif"
                    placeholder="Bo'lim haqida qisqacha ma'lumot"
                    size="md"
                    radius="sm"
                    rows={3}
                    {...form.getInputProps("description")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                />

                {/* Code and Location */}
                <SimpleGrid cols={2}>
                    <TextInput
                        label="Kod"
                        placeholder="Masalan: ITD"
                        size="md"
                        radius="sm"
                        leftSection={<IconHash size={18} color="#868e96" />}
                        {...form.getInputProps("code")}
                        styles={{
                            label: { fontWeight: 500, marginBottom: 6 },
                        }}
                    />
                    <TextInput
                        label="Joylashuv"
                        placeholder="Masalan: 3-qavat, 301-xona"
                        size="md"
                        radius="sm"
                        leftSection={<IconMapPin size={18} color="#868e96" />}
                        {...form.getInputProps("location")}
                        styles={{
                            label: { fontWeight: 500, marginBottom: 6 },
                        }}
                    />
                </SimpleGrid>

                {/* Director */}
                <Select
                    label="Bo'lim boshlig'i"
                    placeholder="Foydalanuvchini tanlang"
                    size="md"
                    radius="sm"
                    searchable
                    clearable
                    leftSection={<IconUser size={18} color="#868e96" />}
                    data={
                        usersData?.data?.map((user) => ({
                            value: user.id,
                            label: user.fullname,
                        })) || []
                    }
                    {...form.getInputProps("directorId")}
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

export default DepartmentFormModal;
