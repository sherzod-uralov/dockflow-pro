"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Stack, Text, Group, Button, ScrollArea, Box, ActionIcon, Collapse } from "@mantine/core";
import { IconPlus, IconChevronDown, IconChevronRight, IconSubtask, IconX, IconCheck } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
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
    TaskPriority,
    TASK_STATUS_OPTIONS,
} from "../type/task.type";
import TaskCard from "./task.card";
import { useUpdateTask, useCreateTask } from "../hook/task.hook";

// Terminal statuses — subtasks in these states won't cascade when parent moves
const TERMINAL_STATUSES = new Set([TaskStatus.COMPLETED, TaskStatus.CANCELLED]);

interface TaskKanbanBoardProps {
    tasks: TaskGetResponse[];
    onEditTask?: (task: TaskGetResponse) => void;
    onDeleteTask?: (id: string) => void;
    onCreateTask?: (status: TaskStatus) => void;
    onClickTask?: (task: TaskGetResponse) => void;
}

// Inline subtask input
const InlineSubtaskInput = ({
    parentTaskId,
    projectId,
    parentStatus,
    onClose,
}: {
    parentTaskId: string;
    projectId: string;
    parentStatus: TaskStatus;
    onClose: () => void;
}) => {
    const [title, setTitle] = useState("");
    const createMutation = useCreateTask();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = () => {
        if (!title.trim() || !projectId) return;
        createMutation.mutate(
            {
                title: title.trim(),
                projectId,
                parentTaskId,
                status: parentStatus,
                priority: TaskPriority.MEDIUM,
            },
            {
                onSuccess: () => {
                    setTitle("");
                    inputRef.current?.focus();
                },
            }
        );
    };

    return (
        <Box
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 8px",
                backgroundColor: "#fff",
                borderRadius: 8,
                border: "1px solid #228be6",
                boxShadow: "0 0 0 1px rgba(34, 139, 230, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <IconSubtask size={14} color="#228be6" style={{ flexShrink: 0 }} />
            <input
                ref={inputRef}
                type="text"
                placeholder="Ichki vazifa nomi..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") handleSubmit();
                    if (e.key === "Escape") onClose();
                }}
                onKeyUp={(e) => e.stopPropagation()}
                style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 13,
                    color: "#212529",
                    fontFamily: "inherit",
                    minWidth: 0,
                }}
            />
            <ActionIcon
                variant="subtle"
                size="xs"
                color="gray"
                onClick={onClose}
            >
                <IconX size={12} />
            </ActionIcon>
            <ActionIcon
                size="xs"
                color="green"
                onClick={handleSubmit}
                loading={createMutation.isLoading}
                disabled={!title.trim()}
            >
                <IconCheck size={12} />
            </ActionIcon>
        </Box>
    );
};

// Sortable Task Card Wrapper
const SortableTaskItem = ({
    task,
    onEdit,
    onDelete,
    onClick,
    onAddSubtask,
    isSubtaskTarget,
}: {
    task: TaskGetResponse;
    onEdit?: (task: TaskGetResponse) => void;
    onDelete?: (id: string) => void;
    onClick?: (task: TaskGetResponse) => void;
    onAddSubtask?: (task: TaskGetResponse) => void;
    isSubtaskTarget?: boolean;
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
        if (!wasDragged) {
            onClick?.(clickedTask);
        }
        setWasDragged(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onPointerUp={() => {
                setTimeout(() => {
                    if (wasDragged) {
                        setWasDragged(false);
                    }
                }, 0);
            }}
        >
            <Box
                style={{
                    borderRadius: 8,
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                    boxShadow: isSubtaskTarget
                        ? "0 0 0 2px #228be6, 0 4px 12px rgba(34, 139, 230, 0.3)"
                        : "none",
                    transform: isSubtaskTarget ? "scale(1.02)" : "none",
                    position: "relative",
                }}
            >
                {isSubtaskTarget && (
                    <Box
                        style={{
                            position: "absolute",
                            top: -10,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 20,
                            backgroundColor: "#228be6",
                            color: "white",
                            borderRadius: 4,
                            padding: "2px 8px",
                            fontSize: 10,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <IconSubtask size={10} />
                        Ichki vazifa qilish
                    </Box>
                )}
                <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={handleClick}
                    onAddSubtask={onAddSubtask}
                />
            </Box>
        </div>
    );
};

// Subtask connector line component with smooth rounded corners
const SubtaskConnector = ({
    isLast,
    children,
}: {
    isLast: boolean;
    children: React.ReactNode;
}) => {
    return (
        <Box style={{ position: "relative", paddingLeft: 22 }}>
            {/* Curved L-branch: vertical down then smooth curve to horizontal */}
            <Box
                style={{
                    position: "absolute",
                    left: 8,
                    top: 0,
                    height: "50%",
                    width: 14,
                    borderLeft: "2px solid #dee2e6",
                    borderBottom: "2px solid #dee2e6",
                    borderBottomLeftRadius: 10,
                }}
            />
            {/* Continuing vertical line for non-last items */}
            {!isLast && (
                <Box
                    style={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        bottom: 0,
                        width: 2,
                        backgroundColor: "#dee2e6",
                    }}
                />
            )}
            {children}
        </Box>
    );
};

// Helper: recursively check if targetId is a descendant of parentId
const hasDescendant = (
    subtaskMap: Map<string, TaskGetResponse[]>,
    parentId: string,
    targetId: string,
): boolean => {
    const children = subtaskMap.get(parentId) || [];
    for (const child of children) {
        if (child.id === targetId) return true;
        if (hasDescendant(subtaskMap, child.id, targetId)) return true;
    }
    return false;
};

// Recursive subtask item — renders a subtask card + its children tree
const RecursiveSubtaskItem = ({
    task,
    subtaskMap,
    isLast,
    subtaskDropTargetId,
    addingSubtaskForId,
    onEdit,
    onDelete,
    onClick,
    onAddSubtask,
    onCloseSubtaskInput,
}: {
    task: TaskGetResponse;
    subtaskMap: Map<string, TaskGetResponse[]>;
    isLast: boolean;
    subtaskDropTargetId: string | null;
    addingSubtaskForId: string | null;
    onEdit?: (task: TaskGetResponse) => void;
    onDelete?: (id: string) => void;
    onClick?: (task: TaskGetResponse) => void;
    onAddSubtask?: (task: TaskGetResponse) => void;
    onCloseSubtaskInput: () => void;
}) => {
    const children = subtaskMap.get(task.id) || [];
    const isAddingToThis = addingSubtaskForId === task.id;
    const hasChildren = children.length > 0;

    return (
        <SubtaskConnector isLast={isLast}>
            <Box py={2}>
                <SortableTaskItem
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onClick}
                    onAddSubtask={onAddSubtask}
                    isSubtaskTarget={subtaskDropTargetId === task.id}
                />
                {/* Render nested children */}
                {(hasChildren || isAddingToThis) && (
                    <Box mt={4}>
                        {children.map((child, index) => {
                            const childIsLast = index === children.length - 1 && !isAddingToThis;
                            return (
                                <RecursiveSubtaskItem
                                    key={child.id}
                                    task={child}
                                    subtaskMap={subtaskMap}
                                    isLast={childIsLast}
                                    subtaskDropTargetId={subtaskDropTargetId}
                                    addingSubtaskForId={addingSubtaskForId}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onClick={onClick}
                                    onAddSubtask={onAddSubtask}
                                    onCloseSubtaskInput={onCloseSubtaskInput}
                                />
                            );
                        })}
                        {isAddingToThis && (task.project?.id || task.projectId) && (
                            <SubtaskConnector isLast>
                                <Box py={2}>
                                    <InlineSubtaskInput
                                        parentTaskId={task.id}
                                        projectId={task.project?.id || task.projectId}
                                        parentStatus={task.status}
                                        onClose={onCloseSubtaskInput}
                                    />
                                </Box>
                            </SubtaskConnector>
                        )}
                    </Box>
                )}
            </Box>
        </SubtaskConnector>
    );
};

// Parent task with expandable subtasks (recursive tree)
const ParentTaskWithSubtasks = ({
    task,
    subtaskMap,
    subtaskDropTargetId,
    addingSubtaskForId,
    onEdit,
    onDelete,
    onClick,
    onAddSubtask,
    onCloseSubtaskInput,
}: {
    task: TaskGetResponse;
    subtaskMap: Map<string, TaskGetResponse[]>;
    subtaskDropTargetId: string | null;
    addingSubtaskForId: string | null;
    onEdit?: (task: TaskGetResponse) => void;
    onDelete?: (id: string) => void;
    onClick?: (task: TaskGetResponse) => void;
    onAddSubtask?: (task: TaskGetResponse) => void;
    onCloseSubtaskInput: () => void;
}) => {
    const [opened, { toggle, open }] = useDisclosure(true);
    const directChildren = subtaskMap.get(task.id) || [];
    const isAddingToParent = addingSubtaskForId === task.id;
    const isAddingToDescendant = addingSubtaskForId
        ? hasDescendant(subtaskMap, task.id, addingSubtaskForId)
        : false;
    const isAddingAnywhere = isAddingToParent || isAddingToDescendant;

    // Auto-open when adding subtask anywhere in the tree
    useEffect(() => {
        if (isAddingAnywhere) open();
    }, [isAddingAnywhere, open]);

    return (
        <Box>
            <Box style={{ position: "relative" }}>
                <SortableTaskItem
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onClick}
                    onAddSubtask={onAddSubtask}
                    isSubtaskTarget={subtaskDropTargetId === task.id}
                />
                <ActionIcon
                    variant="filled"
                    size={18}
                    radius="xl"
                    color="gray"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggle();
                    }}
                    style={{
                        position: "absolute",
                        bottom: -9,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 10,
                        backgroundColor: "#e9ecef",
                        border: "2px solid #f8f9fa",
                    }}
                >
                    {opened ? (
                        <IconChevronDown size={10} color="#495057" />
                    ) : (
                        <IconChevronRight size={10} color="#495057" />
                    )}
                </ActionIcon>
            </Box>
            <Collapse in={opened}>
                <Box mt={4}>
                    {directChildren.map((subtask, index) => {
                        const isLast = index === directChildren.length - 1 && !isAddingToParent;
                        return (
                            <RecursiveSubtaskItem
                                key={subtask.id}
                                task={subtask}
                                subtaskMap={subtaskMap}
                                isLast={isLast}
                                subtaskDropTargetId={subtaskDropTargetId}
                                addingSubtaskForId={addingSubtaskForId}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onClick={onClick}
                                onAddSubtask={onAddSubtask}
                                onCloseSubtaskInput={onCloseSubtaskInput}
                            />
                        );
                    })}
                    {isAddingToParent && (task.project?.id || task.projectId) && (
                        <SubtaskConnector isLast>
                            <Box py={2}>
                                <InlineSubtaskInput
                                    parentTaskId={task.id}
                                    projectId={task.project?.id || task.projectId}
                                    parentStatus={task.status}
                                    onClose={onCloseSubtaskInput}
                                />
                            </Box>
                        </SubtaskConnector>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

// Kanban Column Component with Droppable
const KanbanColumn = ({
    status,
    tasks,
    allTasks,
    subtaskDropTargetId,
    addingSubtaskForId,
    onEditTask,
    onDeleteTask,
    onCreateTask,
    onClickTask,
    onAddSubtask,
    onCloseSubtaskInput,
}: {
    status: { value: TaskStatus; label: string; color: string };
    tasks: TaskGetResponse[];
    allTasks: TaskGetResponse[];
    subtaskDropTargetId: string | null;
    addingSubtaskForId: string | null;
    onEditTask?: (task: TaskGetResponse) => void;
    onDeleteTask?: (id: string) => void;
    onCreateTask?: (status: TaskStatus) => void;
    onClickTask?: (task: TaskGetResponse) => void;
    onAddSubtask?: (task: TaskGetResponse) => void;
    onCloseSubtaskInput: () => void;
}) => {
    const { setNodeRef } = useDroppable({
        id: status.value,
        data: {
            type: "Column",
            status: status.value,
        },
    });

    // Build parent-subtask tree for this column
    const { rootItems, subtaskMap } = useMemo(() => {
        const taskIdsInColumn = new Set(tasks.map((t) => t.id));
        const parentMap = new Map<string, TaskGetResponse[]>();

        for (const task of tasks) {
            if (task.parentTaskId && taskIdsInColumn.has(task.parentTaskId)) {
                const existing = parentMap.get(task.parentTaskId) || [];
                existing.push(task);
                parentMap.set(task.parentTaskId, existing);
            }
        }

        const groupedSubtaskIds = new Set<string>();
        for (const children of parentMap.values()) {
            for (const child of children) {
                groupedSubtaskIds.add(child.id);
            }
        }

        const roots = tasks.filter((t) => !groupedSubtaskIds.has(t.id));

        return { rootItems: roots, subtaskMap: parentMap };
    }, [tasks]);

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
                                {rootItems.length > 0 ? (
                                    rootItems.map((task) => {
                                        const childSubtasks = subtaskMap.get(task.id) || [];
                                        const isAddingHere = addingSubtaskForId === task.id;
                                        const isAddingToDescendant = addingSubtaskForId
                                            ? hasDescendant(subtaskMap, task.id, addingSubtaskForId)
                                            : false;

                                        if (childSubtasks.length > 0 || isAddingHere || isAddingToDescendant) {
                                            return (
                                                <ParentTaskWithSubtasks
                                                    key={task.id}
                                                    task={task}
                                                    subtaskMap={subtaskMap}
                                                    subtaskDropTargetId={subtaskDropTargetId}
                                                    addingSubtaskForId={addingSubtaskForId}
                                                    onEdit={onEditTask}
                                                    onDelete={onDeleteTask}
                                                    onClick={onClickTask}
                                                    onAddSubtask={onAddSubtask}
                                                    onCloseSubtaskInput={onCloseSubtaskInput}
                                                />
                                            );
                                        }
                                        return (
                                            <SortableTaskItem
                                                key={task.id}
                                                task={task}
                                                onEdit={onEditTask}
                                                onDelete={onDeleteTask}
                                                onClick={onClickTask}
                                                onAddSubtask={onAddSubtask}
                                                isSubtaskTarget={subtaskDropTargetId === task.id}
                                            />
                                        );
                                    })
                                ) : tasks.length === 0 ? (
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
                                ) : null}
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

    // Subtask drop state — only activates when Shift is held
    const [subtaskDropTargetId, setSubtaskDropTargetId] = useState<string | null>(null);
    const isShiftHeldRef = useRef(false);
    const isDraggingRef = useRef(false);
    const currentOverTaskIdRef = useRef<string | null>(null);

    // Inline subtask add state
    const [addingSubtaskForId, setAddingSubtaskForId] = useState<string | null>(null);

    // Pre-compute descendant map from stable tasks prop for cascade logic
    const descendantMap = useMemo(() => {
        const childrenMap = new Map<string, string[]>();
        for (const task of tasks) {
            if (task.parentTaskId) {
                const children = childrenMap.get(task.parentTaskId) || [];
                children.push(task.id);
                childrenMap.set(task.parentTaskId, children);
            }
        }

        const cache = new Map<string, string[]>();
        const getAll = (id: string, visited: Set<string> = new Set()): string[] => {
            if (cache.has(id)) return cache.get(id)!;
            if (visited.has(id)) return []; // cycle detected
            visited.add(id);
            const children = childrenMap.get(id) || [];
            const all: string[] = [];
            for (const childId of children) {
                all.push(childId);
                all.push(...getAll(childId, visited));
            }
            cache.set(id, all);
            return all;
        };

        for (const task of tasks) {
            getAll(task.id);
        }

        return cache;
    }, [tasks]);

    // Store descendant IDs of dragged task (computed once at drag start)
    const dragDescendantsRef = useRef<string[]>([]);
    const movableDescendantCountRef = useRef(0);

    // Track Shift key globally
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift" && !isShiftHeldRef.current) {
                isShiftHeldRef.current = true;
                // If currently dragging over a task, activate subtask mode
                if (isDraggingRef.current && currentOverTaskIdRef.current) {
                    setSubtaskDropTargetId(currentOverTaskIdRef.current);
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                isShiftHeldRef.current = false;
                // Deactivate subtask mode when Shift is released
                setSubtaskDropTargetId(null);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

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
                distance: 10,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddSubtask = useCallback((task: TaskGetResponse) => {
        setAddingSubtaskForId(task.id);
    }, []);

    const handleCloseSubtaskInput = useCallback(() => {
        setAddingSubtaskForId(null);
    }, []);

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
        isDraggingRef.current = true;
        setSubtaskDropTargetId(null);
        setAddingSubtaskForId(null);
        currentOverTaskIdRef.current = null;

        // Pre-compute descendants for cascade
        const taskId = event.active.id as string;
        const allDescendants = descendantMap.get(taskId) || [];
        dragDescendantsRef.current = allDescendants;
        movableDescendantCountRef.current = allDescendants.filter((id) => {
            const t = tasks.find((task) => task.id === id);
            return t && !TERMINAL_STATUSES.has(t.status);
        }).length;
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) {
            currentOverTaskIdRef.current = null;
            setSubtaskDropTargetId(null);
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveTask) return;

        const activeTaskData = optimisticTasks.find((t) => t.id === activeId);
        if (!activeTaskData) return;

        // --- Shift + hover over task = subtask mode ---
        if (isOverTask && overId !== activeId) {
            const overTask = optimisticTasks.find((t) => t.id === overId);
            const isCircular = overTask?.parentTaskId === activeId;

            if (overTask && !isCircular) {
                currentOverTaskIdRef.current = overId;
                if (isShiftHeldRef.current) {
                    setSubtaskDropTargetId(overId);
                } else {
                    setSubtaskDropTargetId(null);
                }
            } else {
                currentOverTaskIdRef.current = null;
                setSubtaskDropTargetId(null);
            }
        } else {
            currentOverTaskIdRef.current = null;
            if (subtaskDropTargetId !== null) {
                setSubtaskDropTargetId(null);
            }
        }

        // --- Normal status change logic (only if not in subtask mode) ---
        if (!subtaskDropTargetId || !isShiftHeldRef.current) {
            let overStatus: TaskStatus | undefined;

            if (isOverColumn) {
                overStatus = over.id as TaskStatus;
            } else if (isOverTask) {
                const overTask = optimisticTasks.find((t) => t.id === overId);
                if (overTask) overStatus = overTask.status;
            }

            if (overStatus && activeTaskData.status !== overStatus) {
                const descendantIds = dragDescendantsRef.current;
                const descendantSet = new Set(descendantIds);
                setOptimisticTasks((prev) => {
                    return prev.map((t) => {
                        if (t.id === activeId) {
                            return { ...t, status: overStatus! };
                        }
                        // Cascade to non-terminal descendants
                        if (descendantSet.has(t.id)) {
                            const origTask = tasks.find((orig) => orig.id === t.id);
                            if (origTask && !TERMINAL_STATUSES.has(origTask.status)) {
                                return { ...t, status: overStatus! };
                            }
                        }
                        return t;
                    });
                });
            }
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        isDraggingRef.current = false;
        currentOverTaskIdRef.current = null;

        if (!over) {
            setSubtaskDropTargetId(null);
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        // --- Subtask drop (only if Shift was held) ---
        if (subtaskDropTargetId && isShiftHeldRef.current) {
            const targetId = subtaskDropTargetId;
            setSubtaskDropTargetId(null);

            if (targetId === activeId) return;

            const targetTask = optimisticTasks.find((t) => t.id === targetId);
            const targetStatus = targetTask?.status;
            const descendantIds = dragDescendantsRef.current;
            const descendantSet = new Set(descendantIds);

            setOptimisticTasks((prev) =>
                prev.map((t) => {
                    if (t.id === activeId) {
                        return {
                            ...t,
                            parentTaskId: targetId,
                            parentTask: (() => {
                                const parent = prev.find((p) => p.id === targetId);
                                return parent
                                    ? { id: parent.id, title: parent.title }
                                    : undefined;
                            })(),
                            ...(targetStatus ? { status: targetStatus } : {}),
                        };
                    }
                    // Cascade: move descendants to same status
                    if (targetStatus && descendantSet.has(t.id)) {
                        const origTask = tasks.find((orig) => orig.id === t.id);
                        if (origTask && !TERMINAL_STATUSES.has(origTask.status)) {
                            return { ...t, status: targetStatus };
                        }
                    }
                    return t;
                })
            );

            // API: update dragged task (parentTaskId + status)
            updateTaskMutation.mutate({
                id: activeId,
                data: {
                    parentTaskId: targetId,
                    ...(targetStatus ? { status: targetStatus } : {}),
                },
            });

            // API: cascade status to non-terminal descendants
            if (targetStatus) {
                for (const descId of descendantIds) {
                    const origDesc = tasks.find((t) => t.id === descId);
                    if (
                        origDesc &&
                        !TERMINAL_STATUSES.has(origDesc.status) &&
                        origDesc.status !== targetStatus
                    ) {
                        updateTaskMutation.mutate({
                            id: descId,
                            data: { status: targetStatus },
                        });
                    }
                }
            }
            return;
        }

        setSubtaskDropTargetId(null);

        // --- Normal status change drop ---
        const isOverColumn = over.data.current?.type === "Column";
        const isOverTask = over.data.current?.type === "Task";

        let finalStatus: TaskStatus | undefined;

        if (isOverColumn) {
            finalStatus = over.id as TaskStatus;
        } else if (isOverTask) {
            const overTask = optimisticTasks.find((t) => t.id === overId);
            if (overTask) finalStatus = overTask.status;
        }

        if (finalStatus) {
            const originalTask = tasks.find((t) => t.id === activeId);
            if (originalTask && originalTask.status !== finalStatus) {
                // If dragged task is a subtask, detach it from parent
                const shouldDetach = !!originalTask.parentTaskId;

                // Update task: status + detach from parent if needed
                updateTaskMutation.mutate({
                    id: activeId,
                    data: {
                        status: finalStatus,
                        ...(shouldDetach ? { parentTaskId: null } : {}),
                    },
                });

                // Optimistic: clear parentTaskId
                if (shouldDetach) {
                    setOptimisticTasks((prev) =>
                        prev.map((t) =>
                            t.id === activeId
                                ? { ...t, parentTaskId: undefined, parentTask: undefined }
                                : t
                        )
                    );
                }

                // Cascade status to non-terminal descendants
                const descendantIds = dragDescendantsRef.current;
                for (const descId of descendantIds) {
                    const origDesc = tasks.find((t) => t.id === descId);
                    if (
                        origDesc &&
                        !TERMINAL_STATUSES.has(origDesc.status) &&
                        origDesc.status !== finalStatus
                    ) {
                        updateTaskMutation.mutate({
                            id: descId,
                            data: { status: finalStatus },
                        });
                    }
                }
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
                        allTasks={optimisticTasks}
                        subtaskDropTargetId={subtaskDropTargetId}
                        addingSubtaskForId={addingSubtaskForId}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                        onCreateTask={onCreateTask}
                        onClickTask={onClickTask}
                        onAddSubtask={handleAddSubtask}
                        onCloseSubtaskInput={handleCloseSubtaskInput}
                    />
                ))}
            </Group>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <div
                        style={{
                            transform: subtaskDropTargetId ? "rotate(1deg) scale(0.95)" : "rotate(2deg)",
                            boxShadow: subtaskDropTargetId
                                ? "0 8px 24px rgba(34, 139, 230, 0.25)"
                                : "0 8px 24px rgba(0, 0, 0, 0.12)",
                            cursor: "grabbing",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            position: "relative",
                        }}
                    >
                        {subtaskDropTargetId ? (
                            <Box
                                style={{
                                    position: "absolute",
                                    top: -14,
                                    right: 8,
                                    zIndex: 20,
                                    backgroundColor: "#228be6",
                                    color: "white",
                                    borderRadius: 4,
                                    padding: "2px 8px",
                                    fontSize: 10,
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <IconSubtask size={10} />
                                Subtask qilish
                            </Box>
                        ) : (
                            <Box
                                style={{
                                    position: "absolute",
                                    bottom: -16,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 20,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                {movableDescendantCountRef.current > 0 && (
                                    <Box
                                        style={{
                                            backgroundColor: "#228be6",
                                            color: "white",
                                            borderRadius: 4,
                                            padding: "2px 8px",
                                            fontSize: 9,
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 3,
                                        }}
                                    >
                                        <IconSubtask size={9} />
                                        +{movableDescendantCountRef.current} subtask
                                    </Box>
                                )}
                                <Box
                                    style={{
                                        backgroundColor: "#495057",
                                        color: "#e9ecef",
                                        borderRadius: 4,
                                        padding: "2px 8px",
                                        fontSize: 9,
                                        fontWeight: 500,
                                        whiteSpace: "nowrap",
                                        opacity: 0.8,
                                    }}
                                >
                                    Shift = subtask
                                </Box>
                            </Box>
                        )}
                        <TaskCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default TaskKanbanBoard;
