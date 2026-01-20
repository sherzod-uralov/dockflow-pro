"use client";

import { useState, useCallback } from "react";
import {
    Container,
    Group,
    Button,
    TextInput,
    Select,
    SegmentedControl,
    SimpleGrid,
    Loader,
    Center,
    Text,
    Stack,
    Pagination,
} from "@mantine/core";
import {
    IconPlus,
    IconSearch,
    IconLayoutGrid,
    IconList,
} from "@tabler/icons-react";
import {
    CustomModal,
    ConfirmationModal,
    useModal,
} from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { usePagination } from "@/hooks/use-pagination";
import {
    useGetAllProjects,
    useDeleteProject,
    ProjectGetResponse,
    PROJECT_STATUS_OPTIONS,
} from "@/features/project";
import { useGetAllDepartments } from "@/features/department/hook/department.hook";
import ProjectForm from "../component/project.form";
import ProjectCard from "../component/project.card";
import ProjectTable from "../component/project.table";

const ProjectPage = () => {
    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const { handlePageChange, pageNumber, pageSize } = usePagination();
    const [selectedProject, setSelectedProject] =
        useState<ProjectGetResponse | null>(null);
    const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Filters
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

    const { data, isLoading } = useGetAllProjects({
        search: debouncedSearch || undefined,
        pageSize: pageSize,
        pageNumber: pageNumber,
        status: statusFilter as any,
        departmentId: departmentFilter || undefined,
    });

    const { data: departments } = useGetAllDepartments({
        pageNumber: 1,
        pageSize: 1000,
    });

    const deleteProjectMutation = useDeleteProject();

    const handleEdit = useCallback(
        (project: ProjectGetResponse) => {
            setSelectedProject(project);
            editModal.openModal();
        },
        [editModal]
    );

    const handleDelete = useCallback(
        (id: string) => {
            deleteProjectMutation.mutate(id);
            deleteModal.closeModal();
            setSelectedProject(null);
        },
        [deleteProjectMutation, deleteModal]
    );

    const handleDeleteClick = useCallback(
        (id: string) => {
            const project = data?.data.find((p) => p.id === id);
            setSelectedProject(project || null);
            deleteModal.openModal();
        },
        [data, deleteModal]
    );

    const departmentOptions = [
        { value: "", label: "Barcha bo'limlar" },
        ...(departments?.data?.map((d) => ({
            value: d.id,
            label: d.name,
        })) || []),
    ];

    const statusOptions = [
        { value: "", label: "Barcha holatlar" },
        ...PROJECT_STATUS_OPTIONS.map((s) => ({
            value: s.value,
            label: s.label,
        })),
    ];

    return (
        <>
            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between">
                    <div>
                        <Text size="xl" fw={700} c="#212529">
                            Loyihalar
                        </Text>
                        <Text size="sm" c="dimmed">
                            Barcha loyihalarni boshqarish
                        </Text>
                    </div>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={createModal.openModal}
                        style={{ backgroundColor: "#1e3a5f" }}
                    >
                        Yangi loyiha
                    </Button>
                </Group>

                {/* Filters and Search */}
                <Group justify="space-between">
                    <Group gap="md" style={{ flex: 1 }}>
                        <TextInput
                            placeholder="Loyihalarni qidirish..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, maxWidth: 400 }}
                            styles={{
                                input: {
                                    backgroundColor: "#f8f9fa",
                                    border: "1px solid #e9ecef",
                                },
                            }}
                        />

                        <Select
                            placeholder="Holat"
                            data={statusOptions}
                            value={statusFilter || ""}
                            onChange={(value) => {
                                setStatusFilter(value || null);
                                handlePageChange(1);
                            }}
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
                            placeholder="Bo'lim"
                            data={departmentOptions}
                            value={departmentFilter || ""}
                            onChange={(value) => {
                                setDepartmentFilter(value || null);
                                handlePageChange(1);
                            }}
                            clearable
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
                        onChange={(value) => setViewMode(value as "grid" | "table")}
                        data={[
                            {
                                value: "grid",
                                label: (
                                    <Center>
                                        <IconLayoutGrid size={16} />
                                    </Center>
                                ),
                            },
                            {
                                value: "table",
                                label: (
                                    <Center>
                                        <IconList size={16} />
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
                ) : data?.data && data.data.length > 0 ? (
                    <>
                        {viewMode === "grid" ? (
                            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                                {data.data.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <ProjectTable
                                projects={data.data}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                            />
                        )}

                        {/* Pagination */}
                        {data.count > pageSize && (
                            <Group justify="center" mt="xl">
                                <Pagination
                                    total={Math.ceil(data.count / pageSize)}
                                    value={pageNumber}
                                    onChange={handlePageChange}
                                    color="#1e3a5f"
                                />
                            </Group>
                        )}
                    </>
                ) : (
                    <Center py="xl">
                        <Stack align="center" gap="md">
                            <Text size="lg" c="dimmed">
                                Hech qanday loyiha topilmadi
                            </Text>
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={createModal.openModal}
                                style={{ backgroundColor: "#1e3a5f" }}
                            >
                                Birinchi loyihani yaratish
                            </Button>
                        </Stack>
                    </Center>
                )}
            </Stack>

            {/* Create Modal */}
            <CustomModal
                size="xl"
                closeOnOverlayClick={false}
                title="Yangi loyiha"
                description="Yangi loyiha yaratish uchun maydonlarni to'ldiring"
                isOpen={createModal.isOpen}
                onClose={createModal.closeModal}
            >
                <ProjectForm modal={createModal} mode="create" />
            </CustomModal>

            {/* Edit Modal */}
            <CustomModal
                size="xl"
                closeOnOverlayClick={false}
                title="Loyihani tahrirlash"
                description="Loyiha ma'lumotlarini yangilang"
                isOpen={editModal.isOpen}
                onClose={() => {
                    editModal.closeModal();
                    setSelectedProject(null);
                }}
            >
                <ProjectForm
                    modal={editModal}
                    mode="update"
                    project={selectedProject as ProjectGetResponse}
                />
            </CustomModal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                closeOnOverlayClick={false}
                title="Loyihani o'chirish"
                description="Ushbu loyihani o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
                onClose={deleteModal.closeModal}
                isOpen={deleteModal.isOpen}
                onConfirm={() => handleDelete(selectedProject?.id as string)}
            />
        </>
    );
};

export default ProjectPage;
