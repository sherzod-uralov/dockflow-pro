"use client";

import { Table, Badge, ActionIcon, Group, Text } from "@mantine/core";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import { ProjectGetResponse, PROJECT_STATUS_OPTIONS } from "../type/project.type";
import { useRouter } from "next/navigation";
import { GuardedActionIcon } from "@/components/shared/permission";
import { formatDate } from "@/lib/date-utils";
import { colors } from "@/lib/colors";

interface ProjectTableProps {
    projects: ProjectGetResponse[];
    onEdit?: (project: ProjectGetResponse) => void;
    onDelete?: (id: string) => void;
}

const ProjectTable = ({ projects, onEdit, onDelete }: ProjectTableProps) => {
    const router = useRouter();

    const rows = projects.map((project) => {
        const statusOption = PROJECT_STATUS_OPTIONS.find((s) => s.value === project.status);
        const projectColor = project.color || colors.info;

        return (
            <Table.Tr key={project.id} style={{ cursor: "pointer" }}>
                <Table.Td onClick={() => router.push(`/dashboard/project/${project.id}`)}>
                    <Group gap="sm">
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: projectColor,
                            }}
                        />
                        <div>
                            <Text fw={500} size="sm">
                                {project.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {project.key}
                            </Text>
                        </div>
                    </Group>
                </Table.Td>
                <Table.Td onClick={() => router.push(`/dashboard/project/${project.id}`)}>
                    <Badge
                        variant="light"
                        size="sm"
                        styles={{
                            root: {
                                backgroundColor: `${projectColor}15`,
                                color: projectColor,
                            },
                        }}
                    >
                        {statusOption?.label || project.status}
                    </Badge>
                </Table.Td>
                <Table.Td onClick={() => router.push(`/dashboard/project/${project.id}`)}>
                    <Text size="sm">{project.department?.name || "-"}</Text>
                </Table.Td>
                <Table.Td onClick={() => router.push(`/dashboard/project/${project.id}`)}>
                    <Text size="sm">
                        {project.startDate
                            ? formatDate(project.startDate)
                            : "-"}
                    </Text>
                </Table.Td>
                <Table.Td onClick={() => router.push(`/dashboard/project/${project.id}`)}>
                    <Text size="sm">
                        {project.endDate
                            ? formatDate(project.endDate)
                            : "-"}
                    </Text>
                </Table.Td>
                <Table.Td onClick={() => router.push(`/dashboard/project/${project.id}`)}>
                    <Text size="sm">
                        {project.budget
                            ? new Intl.NumberFormat("uz-UZ").format(project.budget)
                            : "-"}
                    </Text>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs">
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => router.push(`/dashboard/project/${project.id}`)}
                        >
                            <IconEye size={18} />
                        </ActionIcon>
                        <GuardedActionIcon
                            permission="project:update"
                            label="Tahrirlash"
                            variant="subtle"
                            color="gray"
                            onClick={() => onEdit?.(project)}
                        >
                            <IconEdit size={18} />
                        </GuardedActionIcon>
                        <GuardedActionIcon
                            permission="project:delete"
                            label="O'chirish"
                            variant="subtle"
                            color="red"
                            onClick={() => onDelete?.(project.id)}
                        >
                            <IconTrash size={18} />
                        </GuardedActionIcon>
                    </Group>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            styles={{
                table: {
                    backgroundColor: "white",
                },
                th: {
                    backgroundColor: colors.bg,
                    color: colors.textSecondary,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                },
            }}
        >
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Loyiha</Table.Th>
                    <Table.Th>Holat</Table.Th>
                    <Table.Th>Bo'lim</Table.Th>
                    <Table.Th>Boshlanish</Table.Th>
                    <Table.Th>Tugash</Table.Th>
                    <Table.Th>Byudjet</Table.Th>
                    <Table.Th>Amallar</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    );
};

export default ProjectTable;
