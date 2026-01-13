"use client";

import { Card, Group, Text, Badge, ActionIcon, Menu, Progress } from "@mantine/core";
import { IconDots, IconEdit, IconTrash, IconFolder } from "@tabler/icons-react";
import { ProjectGetResponse, PROJECT_STATUS_OPTIONS } from "../type/project.type";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
    project: ProjectGetResponse;
    onEdit?: (project: ProjectGetResponse) => void;
    onDelete?: (id: string) => void;
}

const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
    const router = useRouter();

    const statusOption = PROJECT_STATUS_OPTIONS.find((s) => s.value === project.status);
    const projectColor = project.color || "#3498db";

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
                        <Text fw={600} size="md" c="#212529">
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
                        <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(project);
                            }}
                        >
                            Tahrirlash
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(project.id);
                            }}
                        >
                            O'chirish
                        </Menu.Item>
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
                        backgroundColor: "#f1f3f5",
                    },
                }}
            />

            {(project.startDate || project.endDate) && (
                <Group justify="space-between" mt="sm">
                    {project.startDate && (
                        <Text size="xs" c="dimmed">
                            Boshlanish: {new Date(project.startDate).toLocaleDateString("uz-UZ")}
                        </Text>
                    )}
                    {project.endDate && (
                        <Text size="xs" c="dimmed">
                            Tugash: {new Date(project.endDate).toLocaleDateString("uz-UZ")}
                        </Text>
                    )}
                </Group>
            )}
        </Card>
    );
};

export default ProjectCard;
