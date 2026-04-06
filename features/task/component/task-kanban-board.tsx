"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Stack, Text, Group, Button, ScrollArea, Box, ActionIcon, Collapse, TextInput, ColorInput, Menu, Tooltip } from "@mantine/core";
import { IconPlus, IconChevronDown, IconChevronRight, IconSubtask, IconX, IconCheck, IconDotsVertical, IconEdit, IconTrash, IconColumnInsertRight } from "@tabler/icons-react";
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
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    TaskGetResponse,
    TaskPriority,
} from "../type/task.type";
import {
    useGetAllBoardColumns,
    useCreateBoardColumn,
    useUpdateBoardColumn,
    useDeleteBoardColumn,
} from "@/features/board-column/hook/board-column.hook";
import TaskCard from "./task.card";
import { useUpdateTask, useCreateTask } from "../hook/task.hook";


interface TaskKanbanBoardProps {
    tasks: TaskGetResponse[];
    projectId?: string;
    onEditTask?: (task: TaskGetResponse) => void;
    onDeleteTask?: (id: string) => void;
    onCreateTask?: () => void;
    onClickTask?: (task: TaskGetResponse) => void;
}

interface KanbanColumnData {
    id: string;
    name: string;
    color: string;
    isDynamic: boolean;
}

// ─── Inline subtask input ────────────────────────────────────────────
const InlineSubtaskInput = ({
    parentTaskId,
    projectId,
    onClose,
}: {
    parentTaskId: string;
    projectId: string;
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
            <ActionIcon variant="subtle" size="xs" color="gray" onClick={onClose}>
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

// ─── Sortable Task Card Wrapper ──────────────────────────────────────
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
        data: { type: "Task", task },
        transition: { duration: 200, easing: "ease" },
    });

    useEffect(() => {
        if (isDragging) setWasDragged(true);
    }, [isDragging]);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 200ms ease",
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : "auto",
    };

    const handleClick = (clickedTask: TaskGetResponse) => {
        if (!wasDragged) onClick?.(clickedTask);
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
                    if (wasDragged) setWasDragged(false);
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

// ─── Subtask connector line ──────────────────────────────────────────
const SubtaskConnector = ({ isLast, children }: { isLast: boolean; children: React.ReactNode }) => (
    <Box style={{ position: "relative", paddingLeft: 22 }}>
        <Box
            style={{
                position: "absolute",
                left: 8, top: 0, height: "50%", width: 14,
                borderLeft: "2px solid #dee2e6",
                borderBottom: "2px solid #dee2e6",
                borderBottomLeftRadius: 10,
            }}
        />
        {!isLast && (
            <Box
                style={{
                    position: "absolute",
                    left: 8, top: "50%", bottom: 0, width: 2,
                    backgroundColor: "#dee2e6",
                }}
            />
        )}
        {children}
    </Box>
);

// ─── Helper: descendant check ────────────────────────────────────────
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

// ─── Recursive subtask tree item ─────────────────────────────────────
const RecursiveSubtaskItem = ({
    task, subtaskMap, isLast, subtaskDropTargetId, addingSubtaskForId,
    onEdit, onDelete, onClick, onAddSubtask, onCloseSubtaskInput,
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
                {(children.length > 0 || isAddingToThis) && (
                    <Box mt={4}>
                        {children.map((child, index) => (
                            <RecursiveSubtaskItem
                                key={child.id}
                                task={child}
                                subtaskMap={subtaskMap}
                                isLast={index === children.length - 1 && !isAddingToThis}
                                subtaskDropTargetId={subtaskDropTargetId}
                                addingSubtaskForId={addingSubtaskForId}
                                onEdit={onEdit} onDelete={onDelete} onClick={onClick}
                                onAddSubtask={onAddSubtask} onCloseSubtaskInput={onCloseSubtaskInput}
                            />
                        ))}
                        {isAddingToThis && (task.project?.id || task.projectId) && (
                            <SubtaskConnector isLast>
                                <Box py={2}>
                                    <InlineSubtaskInput
                                        parentTaskId={task.id}
                                        projectId={task.project?.id || task.projectId}

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

// ─── Parent task with expandable subtask tree ────────────────────────
const ParentTaskWithSubtasks = ({
    task, subtaskMap, subtaskDropTargetId, addingSubtaskForId,
    onEdit, onDelete, onClick, onAddSubtask, onCloseSubtaskInput,
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
        ? hasDescendant(subtaskMap, task.id, addingSubtaskForId) : false;

    useEffect(() => {
        if (isAddingToParent || isAddingToDescendant) open();
    }, [isAddingToParent, isAddingToDescendant, open]);

    return (
        <Box>
            <Box style={{ position: "relative" }}>
                <SortableTaskItem
                    task={task} onEdit={onEdit} onDelete={onDelete}
                    onClick={onClick} onAddSubtask={onAddSubtask}
                    isSubtaskTarget={subtaskDropTargetId === task.id}
                />
                <ActionIcon
                    variant="filled" size={18} radius="xl" color="gray"
                    onClick={(e) => { e.stopPropagation(); toggle(); }}
                    style={{
                        position: "absolute", bottom: -9, left: "50%",
                        transform: "translateX(-50%)", zIndex: 10,
                        backgroundColor: "#e9ecef", border: "2px solid #f8f9fa",
                    }}
                >
                    {opened ? <IconChevronDown size={10} color="#495057" /> : <IconChevronRight size={10} color="#495057" />}
                </ActionIcon>
            </Box>
            <Collapse in={opened}>
                <Box mt={4}>
                    {directChildren.map((subtask, index) => (
                        <RecursiveSubtaskItem
                            key={subtask.id}
                            task={subtask}
                            subtaskMap={subtaskMap}
                            isLast={index === directChildren.length - 1 && !isAddingToParent}
                            subtaskDropTargetId={subtaskDropTargetId}
                            addingSubtaskForId={addingSubtaskForId}
                            onEdit={onEdit} onDelete={onDelete} onClick={onClick}
                            onAddSubtask={onAddSubtask} onCloseSubtaskInput={onCloseSubtaskInput}
                        />
                    ))}
                    {isAddingToParent && (task.project?.id || task.projectId) && (
                        <SubtaskConnector isLast>
                            <Box py={2}>
                                <InlineSubtaskInput
                                    parentTaskId={task.id}
                                    projectId={task.project?.id || task.projectId}
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

// ─── Inline Add Column ───────────────────────────────────────────────
const AddColumnCard = ({
    projectId,
    nextPosition,
    onCreate,
}: {
    projectId: string;
    nextPosition: number;
    onCreate: (payload: { projectId: string; name: string; color: string; position: number }) => void;
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#3B82F6");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAdding) inputRef.current?.focus();
    }, [isAdding]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onCreate({ projectId, name: name.trim(), color, position: nextPosition });
        setName("");
        setColor("#3B82F6");
        setIsAdding(false);
    };

    if (!isAdding) {
        return (
            <Box style={{ minWidth: 300, maxWidth: 300, flex: "0 0 300px" }}>
                <Button
                    variant="subtle"
                    color="gray"
                    fullWidth
                    leftSection={<IconPlus size={16} />}
                    onClick={() => setIsAdding(true)}
                    style={{
                        height: 48,
                        border: "2px dashed #dee2e6",
                        borderRadius: 8,
                        color: "#868e96",
                        fontWeight: 500,
                    }}
                >
                    Ustun qo'shish
                </Button>
            </Box>
        );
    }

    return (
        <Box style={{ minWidth: 300, maxWidth: 300, flex: "0 0 300px" }}>
            <Stack gap="xs" p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                <TextInput
                    ref={inputRef}
                    placeholder="Ustun nomi"
                    size="sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                        if (e.key === "Escape") setIsAdding(false);
                    }}
                    styles={{ input: { backgroundColor: "#fff", border: "1px solid #e9ecef" } }}
                />
                <ColorInput
                    placeholder="Rang"
                    size="sm"
                    value={color}
                    onChange={setColor}
                    swatches={["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#95a5a6"]}
                    styles={{ input: { backgroundColor: "#fff", border: "1px solid #e9ecef" } }}
                />
                <Group gap="xs">
                    <Button size="xs" style={{ backgroundColor: "#1e3a5f" }} onClick={handleSubmit} disabled={!name.trim()}>
                        Qo'shish
                    </Button>
                    <Button size="xs" variant="subtle" color="gray" onClick={() => setIsAdding(false)}>
                        Bekor
                    </Button>
                </Group>
            </Stack>
        </Box>
    );
};

// ─── Column Header with Edit/Delete actions ──────────────────────────
const ColumnHeaderActions = ({
    column,
    taskCount,
    onUpdate,
    onDelete,
    onCreateTask,
}: {
    column: KanbanColumnData;
    taskCount: number;
    onUpdate: (id: string, data: { name?: string; color?: string }) => void;
    onDelete: (id: string) => void;
    onCreateTask?: () => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(column.name);
    const [editColor, setEditColor] = useState(column.color);
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) editInputRef.current?.focus();
    }, [isEditing]);

    const handleSave = () => {
        if (!editName.trim()) return;
        onUpdate(column.id, { name: editName.trim(), color: editColor });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Stack gap={4} pb="sm" mb="sm" style={{ borderBottom: "1px solid #e9ecef" }}>
                <TextInput
                    ref={editInputRef}
                    size="xs"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") setIsEditing(false);
                    }}
                    styles={{ input: { backgroundColor: "#fff", border: "1px solid #e9ecef" } }}
                />
                <ColorInput
                    size="xs"
                    value={editColor}
                    onChange={setEditColor}
                    swatches={["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#95a5a6"]}
                    styles={{ input: { backgroundColor: "#fff", border: "1px solid #e9ecef" } }}
                />
                <Group gap={4}>
                    <ActionIcon size="xs" color="green" onClick={handleSave}><IconCheck size={12} /></ActionIcon>
                    <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setIsEditing(false)}><IconX size={12} /></ActionIcon>
                </Group>
            </Stack>
        );
    }

    return (
        <Group justify="space-between" pb="sm" mb="sm" style={{ borderBottom: "1px solid #e9ecef" }}>
            <Group gap={8}>
                <Box w={10} h={10} style={{ borderRadius: "50%", backgroundColor: column.color || "#95a5a6" }} />
                <Text fw={600} size="sm" c="#495057">{column.name}</Text>
                <Text size="sm" c="dimmed" fw={500}>{taskCount}</Text>
            </Group>
            <Group gap={4}>
                <Button
                    size="xs" variant="subtle" color="gray" p={4}
                    onClick={() => onCreateTask?.()}
                >
                    <IconPlus size={16} />
                </Button>
                {column.isDynamic && (
                    <Menu position="bottom-end" shadow="md" width={160}>
                        <Menu.Target>
                            <ActionIcon size="sm" variant="subtle" color="gray">
                                <IconDotsVertical size={14} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => setIsEditing(true)}
                            >
                                Tahrirlash
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => onDelete(column.id)}
                            >
                                O'chirish
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}
            </Group>
        </Group>
    );
};

// ─── Single Kanban Column with Droppable ─────────────────────────────
const KanbanColumnView = ({
    column, tasks, subtaskDropTargetId, addingSubtaskForId,
    onEditTask, onDeleteTask, onCreateTask, onClickTask, onAddSubtask, onCloseSubtaskInput,
    onUpdateColumn, onDeleteColumn,
}: {
    column: KanbanColumnData;
    tasks: TaskGetResponse[];
    subtaskDropTargetId: string | null;
    addingSubtaskForId: string | null;
    onEditTask?: (task: TaskGetResponse) => void;
    onDeleteTask?: (id: string) => void;
    onCreateTask?: () => void;
    onClickTask?: (task: TaskGetResponse) => void;
    onAddSubtask?: (task: TaskGetResponse) => void;
    onCloseSubtaskInput: () => void;
    onUpdateColumn: (id: string, data: { name?: string; color?: string }) => void;
    onDeleteColumn: (id: string) => void;
}) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: { type: "Column", columnId: column.id, isDynamic: column.isDynamic },
    });

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
            for (const child of children) groupedSubtaskIds.add(child.id);
        }

        return {
            rootItems: tasks.filter((t) => !groupedSubtaskIds.has(t.id)),
            subtaskMap: parentMap,
        };
    }, [tasks]);

    return (
        <Box style={{ minWidth: 300, maxWidth: 300, flex: "0 0 300px" }}>
            <Stack gap={0}>
                <ColumnHeaderActions
                    column={column}
                    taskCount={tasks.length}
                    onUpdate={onUpdateColumn}
                    onDelete={onDeleteColumn}
                    onCreateTask={onCreateTask}
                />

                <Box ref={setNodeRef} style={{ height: "calc(100vh - 260px)", backgroundColor: "#f8f9fa", borderRadius: 8, padding: 8 }}>
                    <SortableContext id={column.id} items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                        <ScrollArea h="100%">
                            <Stack gap={8} pb="md" style={{ minHeight: 80 }}>
                                {rootItems.length > 0 ? rootItems.map((task) => {
                                    const childSubtasks = subtaskMap.get(task.id) || [];
                                    const isAddingHere = addingSubtaskForId === task.id;
                                    const isAddingToDesc = addingSubtaskForId ? hasDescendant(subtaskMap, task.id, addingSubtaskForId) : false;

                                    if (childSubtasks.length > 0 || isAddingHere || isAddingToDesc) {
                                        return (
                                            <ParentTaskWithSubtasks
                                                key={task.id} task={task} subtaskMap={subtaskMap}
                                                subtaskDropTargetId={subtaskDropTargetId} addingSubtaskForId={addingSubtaskForId}
                                                onEdit={onEditTask} onDelete={onDeleteTask} onClick={onClickTask}
                                                onAddSubtask={onAddSubtask} onCloseSubtaskInput={onCloseSubtaskInput}
                                            />
                                        );
                                    }
                                    return (
                                        <SortableTaskItem
                                            key={task.id} task={task}
                                            onEdit={onEditTask} onDelete={onDeleteTask}
                                            onClick={onClickTask} onAddSubtask={onAddSubtask}
                                            isSubtaskTarget={subtaskDropTargetId === task.id}
                                        />
                                    );
                                }) : tasks.length === 0 ? (
                                    <Box p="lg" style={{ textAlign: "center", borderRadius: 8, border: "2px dashed #dee2e6" }}>
                                        <Text size="xs" c="dimmed">Vazifalar yo'q</Text>
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

// ─── Main Kanban Board ───────────────────────────────────────────────
const TaskKanbanBoard = ({
    tasks, projectId, onEditTask, onDeleteTask, onCreateTask, onClickTask,
}: TaskKanbanBoardProps) => {
    const updateTaskMutation = useUpdateTask();
    const createColumnMutation = useCreateBoardColumn();
    const updateColumnMutation = useUpdateBoardColumn();
    const deleteColumnMutation = useDeleteBoardColumn();

    const [activeTask, setActiveTask] = useState<TaskGetResponse | null>(null);
    const [optimisticTasks, setOptimisticTasks] = useState<TaskGetResponse[]>(tasks);

    // Fetch dynamic board columns when projectId is provided
    const { data: boardColumnsData } = useGetAllBoardColumns(
        projectId ? { projectId } : undefined
    );

    // Columns from board-column API
    const columns: KanbanColumnData[] = useMemo(() => {
        const cols = boardColumnsData?.data;
        if (!cols || cols.length === 0) return [];
        return [...cols]
            .sort((a, b) => a.position - b.position)
            .map((col) => ({ id: col.id, name: col.name, color: col.color || "#95a5a6", isDynamic: true }));
    }, [boardColumnsData]);

    // Board column CRUD handlers
    const handleCreateColumn = useCallback(
        (payload: { projectId: string; name: string; color: string; position: number }) => {
            createColumnMutation.mutate(payload);
        },
        [createColumnMutation]
    );

    const handleUpdateColumn = useCallback(
        (id: string, data: { name?: string; color?: string }) => {
            updateColumnMutation.mutate({ id, data });
        },
        [updateColumnMutation]
    );

    const handleDeleteColumn = useCallback(
        (id: string) => {
            deleteColumnMutation.mutate(id);
        },
        [deleteColumnMutation]
    );

    const nextPosition = columns.length;

    // Subtask drop state
    const [subtaskDropTargetId, setSubtaskDropTargetId] = useState<string | null>(null);
    const isShiftHeldRef = useRef(false);
    const isDraggingRef = useRef(false);
    const currentOverTaskIdRef = useRef<string | null>(null);
    const [addingSubtaskForId, setAddingSubtaskForId] = useState<string | null>(null);

    // Descendant map for cascade logic
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
            if (visited.has(id)) return [];
            visited.add(id);
            const all: string[] = [];
            for (const childId of childrenMap.get(id) || []) {
                all.push(childId);
                all.push(...getAll(childId, visited));
            }
            cache.set(id, all);
            return all;
        };
        for (const task of tasks) getAll(task.id);
        return cache;
    }, [tasks]);

    const dragDescendantsRef = useRef<string[]>([]);
    const movableDescendantCountRef = useRef(0);

    // Track Shift key
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "Shift" && !isShiftHeldRef.current) {
                isShiftHeldRef.current = true;
                if (isDraggingRef.current && currentOverTaskIdRef.current) {
                    setSubtaskDropTargetId(currentOverTaskIdRef.current);
                }
            }
        };
        const up = (e: KeyboardEvent) => {
            if (e.key === "Shift") { isShiftHeldRef.current = false; setSubtaskDropTargetId(null); }
        };
        document.addEventListener("keydown", down);
        document.addEventListener("keyup", up);
        return () => { document.removeEventListener("keydown", down); document.removeEventListener("keyup", up); };
    }, []);

    useEffect(() => { setOptimisticTasks(tasks); }, [tasks]);

    // Group tasks by boardColumnId
    const tasksByColumn = useMemo(() => {
        const map: Record<string, TaskGetResponse[]> = {};
        for (const col of columns) map[col.id] = [];

        for (const task of optimisticTasks) {
            const colId = task.boardColumnId;
            if (colId && map[colId]) {
                map[colId].push(task);
            } else if (columns[0]) {
                map[columns[0].id].push(task);
            }
        }
        return map;
    }, [optimisticTasks, columns]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleAddSubtask = useCallback((task: TaskGetResponse) => setAddingSubtaskForId(task.id), []);
    const handleCloseSubtaskInput = useCallback(() => setAddingSubtaskForId(null), []);

    // ── Drag handlers ────────────────────────────────────────────────
    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") setActiveTask(event.active.data.current.task);
        isDraggingRef.current = true;
        setSubtaskDropTargetId(null);
        setAddingSubtaskForId(null);
        currentOverTaskIdRef.current = null;

        const allDesc = descendantMap.get(event.active.id as string) || [];
        dragDescendantsRef.current = allDesc;
        movableDescendantCountRef.current = allDesc.length;
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) { currentOverTaskIdRef.current = null; setSubtaskDropTargetId(null); return; }

        const activeId = active.id as string;
        const overId = over.id as string;
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";
        if (active.data.current?.type !== "Task") return;

        const activeTaskData = optimisticTasks.find((t) => t.id === activeId);
        if (!activeTaskData) return;

        // Shift + hover = subtask mode
        if (isOverTask && overId !== activeId) {
            const overTask = optimisticTasks.find((t) => t.id === overId);
            if (overTask && overTask.parentTaskId !== activeId) {
                currentOverTaskIdRef.current = overId;
                setSubtaskDropTargetId(isShiftHeldRef.current ? overId : null);
            } else {
                currentOverTaskIdRef.current = null;
                setSubtaskDropTargetId(null);
            }
        } else {
            currentOverTaskIdRef.current = null;
            if (subtaskDropTargetId) setSubtaskDropTargetId(null);
        }

        // Column change (not in subtask mode)
        if (!subtaskDropTargetId || !isShiftHeldRef.current) {
            let overColumnId: string | undefined;
            if (isOverColumn) {
                overColumnId = overId;
            } else if (isOverTask) {
                const overTask = optimisticTasks.find((t) => t.id === overId);
                if (overTask) overColumnId = overTask.boardColumnId || columns[0]?.id;
            }
            if (!overColumnId) return;

            const currentColId = activeTaskData.boardColumnId || columns[0]?.id;
            if (overColumnId !== currentColId) {
                const descSet = new Set(dragDescendantsRef.current);
                setOptimisticTasks((prev) => prev.map((t) => {
                    if (t.id === activeId || descSet.has(t.id)) {
                        return { ...t, boardColumnId: overColumnId };
                    }
                    return t;
                }));
            }
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        isDraggingRef.current = false;
        currentOverTaskIdRef.current = null;
        if (!over) { setSubtaskDropTargetId(null); return; }

        const activeId = active.id as string;
        const overId = over.id as string;

        // Subtask drop (Shift held)
        if (subtaskDropTargetId && isShiftHeldRef.current) {
            const targetId = subtaskDropTargetId;
            setSubtaskDropTargetId(null);
            if (targetId === activeId) return;

            const targetTask = optimisticTasks.find((t) => t.id === targetId);
            setOptimisticTasks((prev) => prev.map((t) => {
                if (t.id === activeId) {
                    return {
                        ...t,
                        parentTaskId: targetId,
                        parentTask: targetTask ? { id: targetTask.id, title: targetTask.title } : undefined,
                        ...(targetTask?.boardColumnId ? { boardColumnId: targetTask.boardColumnId } : {}),
                    };
                }
                return t;
            }));

            const updateData: Record<string, unknown> = { parentTaskId: targetId };
            if (targetTask?.boardColumnId) updateData.boardColumnId = targetTask.boardColumnId;
            updateTaskMutation.mutate({ id: activeId, data: updateData as any });
            return;
        }
        setSubtaskDropTargetId(null);

        // Normal column change
        let finalColId: string | undefined;
        if (over.data.current?.type === "Column") finalColId = overId;
        else if (over.data.current?.type === "Task") {
            const overTask = optimisticTasks.find((t) => t.id === overId);
            if (overTask) finalColId = overTask.boardColumnId || columns[0]?.id;
        }
        if (!finalColId) return;

        const origTask = tasks.find((t) => t.id === activeId);
        if (!origTask) return;
        const origColId = origTask.boardColumnId || columns[0]?.id;

        if (finalColId !== origColId) {
            const shouldDetach = !!origTask.parentTaskId;

            // Update parent task
            updateTaskMutation.mutate({
                id: activeId,
                data: { boardColumnId: finalColId, ...(shouldDetach ? { parentTaskId: null } : {}) },
            });

            // Cascade: update all descendant subtasks to same column
            const descendantIds = dragDescendantsRef.current;
            for (const descId of descendantIds) {
                const descTask = tasks.find((t) => t.id === descId);
                if (descTask && descTask.boardColumnId !== finalColId) {
                    updateTaskMutation.mutate({
                        id: descId,
                        data: { boardColumnId: finalColId },
                    });
                }
            }

            if (shouldDetach) {
                setOptimisticTasks((prev) =>
                    prev.map((t) => t.id === activeId ? { ...t, parentTaskId: undefined, parentTask: undefined } : t)
                );
            }
        }
    };

    const dropAnimation: DropAnimation = {
        duration: 200, easing: "ease",
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
            <Group align="flex-start" gap="md" wrap="nowrap" style={{ overflowX: "auto" }}>
                {columns.map((column) => (
                    <KanbanColumnView
                        key={column.id} column={column}
                        tasks={tasksByColumn[column.id] || []}
                        subtaskDropTargetId={subtaskDropTargetId} addingSubtaskForId={addingSubtaskForId}
                        onEditTask={onEditTask} onDeleteTask={onDeleteTask}
                        onCreateTask={onCreateTask} onClickTask={onClickTask}
                        onAddSubtask={handleAddSubtask} onCloseSubtaskInput={handleCloseSubtaskInput}
                        onUpdateColumn={handleUpdateColumn} onDeleteColumn={handleDeleteColumn}
                    />
                ))}
                {projectId && (
                    <AddColumnCard
                        projectId={projectId}
                        nextPosition={nextPosition}
                        onCreate={handleCreateColumn}
                    />
                )}
            </Group>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <div style={{
                        transform: subtaskDropTargetId ? "rotate(1deg) scale(0.95)" : "rotate(2deg)",
                        boxShadow: subtaskDropTargetId ? "0 8px 24px rgba(34, 139, 230, 0.25)" : "0 8px 24px rgba(0, 0, 0, 0.12)",
                        cursor: "grabbing", transition: "transform 0.2s ease, box-shadow 0.2s ease", position: "relative",
                    }}>
                        {subtaskDropTargetId ? (
                            <Box style={{
                                position: "absolute", top: -14, right: 8, zIndex: 20,
                                backgroundColor: "#228be6", color: "white", borderRadius: 4,
                                padding: "2px 8px", fontSize: 10, fontWeight: 600,
                                display: "flex", alignItems: "center", gap: 4,
                            }}>
                                <IconSubtask size={10} /> Subtask qilish
                            </Box>
                        ) : (
                            <Box style={{
                                position: "absolute", bottom: -16, left: "50%",
                                transform: "translateX(-50%)", zIndex: 20,
                                display: "flex", alignItems: "center", gap: 6,
                            }}>
                                {movableDescendantCountRef.current > 0 && (
                                    <Box style={{
                                        backgroundColor: "#228be6", color: "white", borderRadius: 4,
                                        padding: "2px 8px", fontSize: 9, fontWeight: 600,
                                        whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3,
                                    }}>
                                        <IconSubtask size={9} /> +{movableDescendantCountRef.current} subtask
                                    </Box>
                                )}
                                <Box style={{
                                    backgroundColor: "#495057", color: "#e9ecef", borderRadius: 4,
                                    padding: "2px 8px", fontSize: 9, fontWeight: 500, whiteSpace: "nowrap", opacity: 0.8,
                                }}>
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
