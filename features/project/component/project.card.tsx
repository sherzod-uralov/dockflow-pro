"use client";

import { Card, Group, Text, Badge, ActionIcon, Menu, Progress } from "@mantine/core";
import { IconDots, IconEdit, IconTrash, IconFolder } from "@tabler/icons-react";
import { ProjectGetResponse, PROJECT_STATUS_OPTIONS, PROJECT_VISIBILITY_OPTIONS } from "../type/project.type";
import { useRouter } from "next/navigation";
import { GuardedMenuItem } from "@/components/shared/permission";
import { formatDate } from "@/lib/date-utils";
import { colors } from "@/lib/colors";

interface ProjectCardProps {
    project: ProjectGetResponse;
    onEdit?: (project: ProjectGetResponse) => void;
    onDelete?: (id: string) => void;
}

const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
    const router = useRouter();

    const statusOption = PROJECT_STATUS_OPTIONS.find((s) => s.value === project.status);
    const projectColor = project.color || colors.info;

    // Calculate progress (mock - you can implement real logic based on tasks)
    const progress = project.status === "COMPLETED" ? 100 : project.status === "ACTIVE" ? 60 : 20;

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderLeft: `4px solid ${projectColor}`,
            }}
            styles={{
                root: {
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    },
                },
            }}
            onClick={() => router.push(`/dashboard/project/${project.id}`)}
        >
            <Group justify="space-between" mb="xs">
                <Group gap="sm">
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            backgroundColor: `${projectColor}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <IconFolder size={20} color={projectColor} />
                    </div>
                    <div>
                        <Text fw={600} size="md" c={colors.textPrimary}>
                            {project.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {project.key}
                        </Text>
                    </div>
                </Group>

                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <IconDots size={18} />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <GuardedMenuItem
                            permission="project:update"
                            leftSection={<IconEdit size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(project);
                            }}
                        >
                            Tahrirlash
                        </GuardedMenuItem>
                        <GuardedMenuItem
                            permission="project:delete"
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(project.id);
                            }}
                        >
                            O'chirish
                        </GuardedMenuItem>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            {project.description && (
                <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                    {project.description}
                </Text>
            )}

            <Group justify="space-between" mb="xs">
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

                {project.visibility && (() => {
                    const v = PROJECT_VISIBILITY_OPTIONS.find((o) => o.value === project.visibility);
                    return v ? (
                        <Badge size="xs" variant="light" color={v.color}>
                            {v.icon} {v.label}
                        </Badge>
                    ) : null;
                })()}

                {project.department && (
                    <Text size="xs" c="dimmed">
                        {project.department.name}
                    </Text>
                )}
            </Group>

            <Progress
                value={progress}
                size="sm"
                radius="xl"
                color={projectColor}
                styles={{
                    root: {
                        backgroundColor: colors.bgSubtle,
                    },
                }}
            />

            {(project.startDate || project.endDate) && (
                <Group justify="space-between" mt="sm">
                    {project.startDate && (
                        <Text size="xs" c="dimmed">
                            Boshlanish: {formatDate(project.startDate)}
                        </Text>
                    )}
                    {project.endDate && (
                        <Text size="xs" c="dimmed">
                            Tugash: {formatDate(project.endDate)}
                        </Text>
                    )}
                </Group>
            )}
        </Card>
    );
};

export default ProjectCard;
