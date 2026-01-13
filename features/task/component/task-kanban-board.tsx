"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Stack, Text, Group, Button, ScrollArea, Box } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
    useDroppable,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    TaskGetResponse,
    TaskStatus,
    TASK_STATUS_OPTIONS,
} from "../type/task.type";
import TaskCard from "./task.card";
import { useUpdateTask } from "../hook/task.hook";

interface TaskKanbanBoardProps {
    tasks: TaskGetResponse[];
    onEditTask?: (task: TaskGetResponse) => void;
    onDeleteTask?: (id: string) => void;
    onCreateTask?: (status: TaskStatus) => void;
    onClickTask?: (task: TaskGetResponse) => void;
}

// Sortable Task Card Wrapper
const SortableTaskItem = ({
    task,
    onEdit,
    onDelete,
    onClick,
}: {
    task: TaskGetResponse;
    onEdit?: (task: TaskGetResponse) => void;
    onDelete?: (id: string) => void;
    onClick?: (task: TaskGetResponse) => void;
}) => {
    const [wasDragged, setWasDragged] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        transition: {
            duration: 200,
            easing: "ease",
        },
    });

    // Track when drag starts
    useEffect(() => {
        if (isDragging) {
            setWasDragged(true);
        }
    }, [isDragging]);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 200ms ease",
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : "auto",
    };

    const handleClick = (clickedTask: TaskGetResponse) => {
        // Only trigger onClick if it wasn't a drag operation
        if (!wasDragged) {
            onClick?.(clickedTask);
        }
        // Reset the drag flag after click
        setWasDragged(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onPointerUp={() => {
                // Small delay to allow drag end to process first
                setTimeout(() => {
                    if (wasDragged) {
                        setWasDragged(false);
                    }
                }, 0);
            }}
        >
            <TaskCard
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onClick={handleClick}
            />
        </div>
    );
};

// Kanban Column Component with Droppable
const KanbanColumn = ({
    status,
    tasks,
    onEditTask,
    onDeleteTask,
    onCreateTask,
    onClickTask,
}: {
    status: { value: TaskStatus; label: string; color: string };
    tasks: TaskGetResponse[];
    onEditTask?: (task: TaskGetResponse) => void;
    onDeleteTask?: (id: string) => void;
    onCreateTask?: (status: TaskStatus) => void;
    onClickTask?: (task: TaskGetResponse) => void;
}) => {
    const { setNodeRef } = useDroppable({
        id: status.value,
        data: {
            type: "Column",
            status: status.value,
        },
    });

    return (
        <Box
            style={{
                minWidth: 300,
                maxWidth: 300,
                flex: "0 0 300px",
            }}
        >
            <Stack gap={0}>
                {/* Column Header */}
                <Group
                    justify="space-between"
                    pb="sm"
                    mb="sm"
                    style={{
                        borderBottom: "1px solid #e9ecef",
                    }}
                >
                    <Group gap={8}>
                        <Box
                            w={10}
                            h={10}
                            style={{
                                borderRadius: "50%",
                                backgroundColor: status.color,
                            }}
                        />
                        <Text fw={600} size="sm" c="#495057">
                            {status.label}
                        </Text>
                        <Text size="sm" c="dimmed" fw={500}>
                            {tasks.length}
                        </Text>
                    </Group>

                    <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        p={4}
                        onClick={() => onCreateTask?.(status.value)}
                    >
                        <IconPlus size={16} />
                    </Button>
                </Group>

                {/* Droppable Area */}
                <Box
                    ref={setNodeRef}
                    style={{
                        height: "calc(100vh - 260px)",
                        backgroundColor: "#f8f9fa",
                        borderRadius: 8,
                        padding: 8,
                    }}
                >
                    <SortableContext
                        id={status.value}
                        items={tasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ScrollArea h="100%">
                            <Stack gap={8} pb="md" style={{ minHeight: 80 }}>
                                {tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <SortableTaskItem
                                            key={task.id}
                                            task={task}
                                            onEdit={onEditTask}
                                            onDelete={onDeleteTask}
                                            onClick={onClickTask}
                                        />
                                    ))
                                ) : (
                                    <Box
                                        p="lg"
                                        style={{
                                            textAlign: "center",
                                            borderRadius: 8,
                                            border: "2px dashed #dee2e6",
                                        }}
                                    >
                                        <Text size="xs" c="dimmed">
                                            Vazifalar yo'q
                                        </Text>
                                    </Box>
                                )}
                            </Stack>
                        </ScrollArea>
                    </SortableContext>
                </Box>
            </Stack>
        </Box>
    );
};

const TaskKanbanBoard = ({
    tasks,
    onEditTask,
    onDeleteTask,
    onCreateTask,
    onClickTask,
}: TaskKanbanBoardProps) => {
    const updateTaskMutation = useUpdateTask();
    const [activeTask, setActiveTask] = useState<TaskGetResponse | null>(null);
    const [optimisticTasks, setOptimisticTasks] = useState<TaskGetResponse[]>(tasks);

    // Sync optimistic tasks with props when props change (unless dragging? no, just sync)
    // Actually, simply relying on props is smoother unless we want complex optimistic UI logic manually.
    // For now, let's keep local state initialized from props, but updating it during drag.
    useEffect(() => {
        setOptimisticTasks(tasks);
    }, [tasks]);

    const tasksByStatus = useMemo(() => {
        return TASK_STATUS_OPTIONS.reduce((acc, status) => {
            acc[status.value] = optimisticTasks.filter(
                (task) => task.status === status.value
            );
            return acc;
        }, {} as Record<TaskStatus, TaskGetResponse[]>);
    }, [optimisticTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10, // Wait 10px movement before drag starts to allow clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveTask) return;

        // Find the active task in our state
        const activeTask = optimisticTasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        // Determine target status
        let overStatus: TaskStatus | undefined;

        if (isOverColumn) {
            overStatus = over.id as TaskStatus;
        } else if (isOverTask) {
            const overTask = optimisticTasks.find((t) => t.id === overId);
            if (overTask) overStatus = overTask.status;
        }

        // Only update if status is changing
        if (overStatus && activeTask.status !== overStatus) {
            setOptimisticTasks((prev) => {
                return prev.map((t) => {
                    if (t.id === activeId) {
                        return { ...t, status: overStatus! };
                    }
                    return t;
                });
            });
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = optimisticTasks.find((t) => t.id === activeId);
        // Note: activeTask here might have the OLD status if we look at 'tasks' prop, 
        // or NEW status if we look at optimisticTasks.

        // Let's determine the final status based on where we dropped
        const isOverColumn = over.data.current?.type === "Column";
        const isOverTask = over.data.current?.type === "Task";

        let finalStatus: TaskStatus | undefined;

        if (isOverColumn) {
            finalStatus = over.id as TaskStatus;
        } else if (isOverTask) {
            const overTask = optimisticTasks.find((t) => t.id === overId);
            if (overTask) finalStatus = overTask.status;
        }

        // If we found a valid status and it's different from the original server state
        if (finalStatus) {
            const originalTask = tasks.find(t => t.id === activeId);
            if (originalTask && originalTask.status !== finalStatus) {
                updateTaskMutation.mutate({
                    id: activeId,
                    data: { status: finalStatus },
                });
            }
        }
    };

    const dropAnimation: DropAnimation = {
        duration: 200,
        easing: "ease",
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: "0.5",
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <Group align="flex-start" gap="md" wrap="nowrap" style={{ overflowX: "auto" }}>
                {TASK_STATUS_OPTIONS.map((status) => (
                    <KanbanColumn
                        key={status.value}
                        status={status}
                        tasks={tasksByStatus[status.value] || []}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                        onCreateTask={onCreateTask}
                        onClickTask={onClickTask}
                    />
                ))}
            </Group>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <div
                        style={{
                            transform: "rotate(2deg)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                            cursor: "grabbing",
                        }}
                    >
                        <TaskCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default TaskKanbanBoard;
