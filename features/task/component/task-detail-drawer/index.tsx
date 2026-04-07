"use client";

import { useState } from "react";
import {
  Stack,
  Group,
  Text,
  Box,
  Tabs,
  Badge,
  ActionIcon,
  Select,
  Textarea,
  TextInput,
  Avatar,
  Tooltip,
  Menu,
  Loader,
  Paper,
  ScrollArea,
  Divider,
  Button,
  Popover,
  Checkbox,
  Drawer,
  Progress,
} from "@mantine/core";
import {
  IconX,
  IconCalendar,
  IconUser,
  IconMessage,
  IconPaperclip,
  IconChecklist,
  IconClock,
  IconActivity,
  IconLink,
  IconEye,
  IconEyeOff,
  IconDots,
  IconTrash,
  IconEdit,
  IconCheck,
  IconSubtask,
  IconPlus,
  IconChevronRight,
  IconMaximize,
  IconMinimize,
  IconSearch,
  IconArrowBack,
} from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import {
  useGetTaskById,
  useGetAllTasks,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useUncompleteTask,
} from "../../hook/task.hook";
import {
  TASK_PRIORITY_OPTIONS,
} from "../../type/task.type";
import { TaskCommentsInline } from "@/features/task-comment/component/task-comments-inline";
import { TaskAttachments } from "@/features/task-attachment/component/task-attachments";
import {
  GuardedButton,
  GuardedActionIcon,
  GuardedMenuItem,
  usePermissionCheck,
} from "@/components/shared/permission";

import { TaskChecklist } from "@/features/task-checklist/component/task-checklist";
import {
  useGetAllTaskTimeEntries,
  useDeleteTaskTimeEntry,
} from "@/features/task-time-entry/hook/task-time-entry.hook";
import { useGetAllTaskActivities } from "@/features/task-activity/hook/task-activity.hook";
import {
  useGetAllTaskWatchers,
  useWatchTask,
  useUnwatchTask,
} from "@/features/task-watcher/hook/task-watcher.hook";
import {
  useGetAllTaskDependencies,
  useDeleteTaskDependency,
} from "@/features/task-dependency/hook/task-dependency.hook";
import { useGetAllTaskComments } from "@/features/task-comment/hook/task-comment.hook";
import { useGetAllTaskAttachments } from "@/features/task-attachment/hook/task-attachment.hook";
import { useGetAllTaskChecklists } from "@/features/task-checklist/hook/task-checklist.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";

import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { TimeEntryItem } from "./time-entry-item";
import { TimeEntryForm } from "./time-entry-form";
import { ActivityItem } from "./activity-item";
import { SubtaskForm } from "./subtask-form";

interface TaskDetailDrawerProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export const TaskDetailDrawer = ({
  taskId,
  isOpen,
  onClose,
  onDelete,
}: TaskDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState<string | null>("details");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string | null>(null);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: usersData } = useGetUserQuery({ pageNumber: 1, pageSize: 1000 });
  const allUsers = usersData?.data || [];

  const { data: task, isLoading: taskLoading } = useGetTaskById(taskId || "", {
    enabled: !!taskId && isOpen,
  });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const { allowed: canUpdateTask } = usePermissionCheck("task:update");
  const { allowed: canCompleteTask } = usePermissionCheck("task:complete");

  const shouldFetchRelated = !!taskId && isOpen;
  const safeTaskId = taskId || "";

  // Hooks supporting `enabled` (CRUD factory)
  const { data: commentsData } = useGetAllTaskComments({ taskId: safeTaskId, pageSize: 1 }, { enabled: shouldFetchRelated });
  const { data: attachmentsData } = useGetAllTaskAttachments({ taskId: safeTaskId, pageSize: 1 }, { enabled: shouldFetchRelated });
  const { data: timeEntriesData } = useGetAllTaskTimeEntries({ taskId: safeTaskId, pageSize: 100 }, { enabled: shouldFetchRelated });
  const { data: dependenciesData } = useGetAllTaskDependencies({ taskId: safeTaskId }, { enabled: shouldFetchRelated });

  // Custom hooks (no enabled support) — pass undefined when not needed
  const { data: checklistsData } = useGetAllTaskChecklists(shouldFetchRelated ? { taskId: safeTaskId, pageSize: 1 } : undefined);
  const { data: activitiesData } = useGetAllTaskActivities(shouldFetchRelated ? { taskId: safeTaskId, pageSize: 50 } : undefined);
  const { data: watchersData } = useGetAllTaskWatchers(shouldFetchRelated ? { taskId: safeTaskId } : undefined);

  const { data: subtasksData } = useGetAllTasks({
    parentTaskId: taskId || undefined,
    pageSize: 100,
  });

  const { data: parentTask } = useGetTaskById(task?.parentTaskId || "", {
    enabled: !!task?.parentTaskId,
  });

  const watchTask = useWatchTask();
  const unwatchTask = useUnwatchTask();
  const deleteTimeEntry = useDeleteTaskTimeEntry();
  const deleteDependency = useDeleteTaskDependency();

  const commentsCount = commentsData?.count || 0;
  const attachmentsCount = attachmentsData?.count || 0;
  const checklistsCount = checklistsData?.count || 0;
  const timeEntries = timeEntriesData?.data || [];
  const activities = activitiesData?.data || [];
  const watchers = watchersData?.data || [];
  const dependencies = dependenciesData?.data || [];
  const subtasks = subtasksData?.data || [];
  const isWatching = watchers.length > 0;
  const completedSubtasks = subtasks.filter((s) => !!s.completedAt);

  const handleUpdateField = (field: string, value: unknown) => {
    if (!taskId) return;
    updateTask.mutate({ id: taskId, data: { [field]: value } });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const subtask = subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    if (subtask.completedAt) {
      uncompleteTask.mutate(subtaskId);
    } else {
      completeTask.mutate(subtaskId);
    }
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== task?.title) {
      handleUpdateField("title", editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    if (editDesc !== task?.description) {
      handleUpdateField("description", editDesc.trim() || null);
    }
    setIsEditingDesc(false);
  };

  const handleDelete = () => {
    if (!taskId) return;
    deleteTask.mutate(taskId, {
      onSuccess: () => { onClose(); onDelete?.(); },
    });
  };

  const toggleWatch = () => {
    if (!taskId) return;
    isWatching ? unwatchTask.mutate(taskId) : watchTask.mutate(taskId);
  };

  if (!taskId) return null;

  const totalTimeLogged = timeEntries.reduce((sum, e) => sum + (e.hours || 0), 0);

  return (
    <>
      <Drawer
        opened={isOpen}
        onClose={onClose}
        position="right"
        size={isFullscreen ? "100%" : "xl"}
        padding={0}
        withCloseButton={false}
        styles={{ body: { height: "100%", display: "flex", flexDirection: "column" } }}
      >
        {taskLoading ? (
          <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Loader size="md" color="#1e3a5f" />
          </Box>
        ) : task ? (
          <Box style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            {/* ─── Header ─── */}
            <Box p="md" style={{ borderBottom: "1px solid #e9ecef", flexShrink: 0 }}>
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  {task.project && (
                    <Badge size="sm" variant="light" style={{ backgroundColor: `${task.project.color || "#1e3a5f"}20`, color: task.project.color || "#1e3a5f" }}>
                      {task.project.key}-{task.taskNumber}
                    </Badge>
                  )}
                  <StatusBadge boardColumn={task.boardColumn} />
                  <PriorityBadge priority={task.priority} />
                  {task.score != null && task.score > 0 && (
                    <Badge size="sm" variant="light" color="blue">{task.score} ball</Badge>
                  )}
                </Group>
                <Group gap="xs">
                  {!task.completedAt && (
                    <GuardedButton
                      permission="task:complete"
                      size="compact-xs"
                      variant="light"
                      color="green"
                      leftSection={<IconCheck size={14} />}
                      onClick={() => completeTask.mutate(taskId)}
                      loading={completeTask.isLoading}
                    >
                      Yakunlash
                    </GuardedButton>
                  )}
                  <GuardedActionIcon
                    permission="task:watch"
                    label={isWatching ? "Kuzatishni to'xtatish" : "Kuzatish"}
                    variant="subtle"
                    color={isWatching ? "blue" : "gray"}
                    onClick={toggleWatch}
                    loading={watchTask.isLoading || unwatchTask.isLoading}
                  >
                    {isWatching ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                  </GuardedActionIcon>
                  <Tooltip label={isFullscreen ? "Kichraytirish" : "Kattalashtirish"}>
                    <ActionIcon variant="subtle" color="gray" onClick={() => setIsFullscreen(!isFullscreen)}>
                      {isFullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
                    </ActionIcon>
                  </Tooltip>
                  <Menu shadow="md" width={160}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray"><IconDots size={18} /></ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <GuardedMenuItem permission="task:delete" leftSection={<IconTrash size={14} />} color="red" onClick={handleDelete}>
                        O'chirish
                      </GuardedMenuItem>
                    </Menu.Dropdown>
                  </Menu>
                  <ActionIcon variant="subtle" color="gray" onClick={onClose}>
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
              </Group>

              {/* Sarlavha */}
              {isEditingTitle ? (
                <TextInput
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") { setIsEditingTitle(false); setEditTitle(task.title); }
                  }}
                  autoFocus
                  size="md"
                  styles={{ input: { fontSize: 18, fontWeight: 600, border: "none", backgroundColor: "transparent", padding: 0 } }}
                />
              ) : (
                <Tooltip
                  label="Bu amalni bajarish uchun ruxsat yo'q"
                  disabled={canUpdateTask}
                  withArrow
                  position="top"
                >
                  <Group
                    gap={6}
                    style={{ cursor: canUpdateTask ? "pointer" : "default" }}
                    onClick={() => {
                      if (!canUpdateTask) return;
                      setEditTitle(task.title);
                      setIsEditingTitle(true);
                    }}
                  >
                    <Text size="lg" fw={600} c="#212529">{task.title}</Text>
                    {canUpdateTask && <IconEdit size={14} color="#adb5bd" />}
                  </Group>
                </Tooltip>
              )}
            </Box>

            {/* ─── Tab'lar ─── */}
            <Tabs value={activeTab} onChange={setActiveTab} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
              <Tabs.List px="md" style={{ flexShrink: 0 }}>
                <Tabs.Tab value="details">Tafsilot</Tabs.Tab>
                <Tabs.Tab value="comments" rightSection={commentsCount > 0 ? <Badge size="xs" variant="light" color="blue" radius="xl">{commentsCount}</Badge> : null}>
                  Izohlar
                </Tabs.Tab>
                <Tabs.Tab value="files" rightSection={attachmentsCount > 0 ? <Badge size="xs" variant="light" color="blue" radius="xl">{attachmentsCount}</Badge> : null}>
                  Fayllar
                </Tabs.Tab>
                <Tabs.Tab value="subtasks" rightSection={
                  subtasks.length > 0 ? (
                    <Badge size="xs" variant="light" color={completedSubtasks.length === subtasks.length ? "green" : "blue"} radius="xl">
                      {completedSubtasks.length}/{subtasks.length}
                    </Badge>
                  ) : null
                }>
                  Ichki vazifalar
                </Tabs.Tab>
              </Tabs.List>

              {/* Izohlar — alohida full-height layout */}
              {activeTab === "comments" && (
                <Box p="md" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <TaskCommentsInline taskId={taskId} />
                </Box>
              )}

              {/* Qolgan tab'lar — scrollable */}
              <ScrollArea style={{ flex: 1, minHeight: 0, display: activeTab === "comments" ? "none" : undefined }} p="md">
                {/* ═══ TAFSILOT ═══ */}
                <Tabs.Panel value="details">
                  <Stack gap="lg">
                    {/* Tavsif */}
                    <Box>
                      <Text size="sm" fw={600} c="#495057" mb={6}>Tavsif</Text>
                      {isEditingDesc ? (
                        <Textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          onBlur={handleSaveDesc}
                          autosize minRows={3} autoFocus
                          placeholder="Vazifa haqida yozing..."
                        />
                      ) : (
                        <Paper
                          p="sm" radius="sm"
                          style={{ backgroundColor: "#f8f9fa", cursor: canUpdateTask ? "pointer" : "default", minHeight: 60 }}
                          onClick={() => {
                            if (!canUpdateTask) return;
                            setEditDesc(task.description || "");
                            setIsEditingDesc(true);
                          }}
                          title={canUpdateTask ? "" : "Bu amalni bajarish uchun ruxsat yo'q"}
                        >
                          {task.description ? (
                            <Text size="sm" c="#495057" style={{ whiteSpace: "pre-wrap" }}>{task.description}</Text>
                          ) : (
                            <Group gap={6}>
                              <IconEdit size={14} color="#adb5bd" />
                              <Text size="sm" c="dimmed">Tavsif yozish uchun bosing</Text>
                            </Group>
                          )}
                        </Paper>
                      )}
                    </Box>

                    <Divider />

                    {/* Muhimlik */}
                    <Box>
                      <Text size="sm" fw={600} c="#495057" mb={6}>Muhimlik</Text>
                      <Select
                        data={TASK_PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        value={task.priority}
                        onChange={(value) => value && handleUpdateField("priority", value)}
                        size="sm"
                        radius="sm"
                        styles={{ input: { backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" } }}
                      />
                    </Box>

                    {/* Sanalar */}
                    <Group grow>
                      <Box>
                        <Text size="sm" fw={600} c="#495057" mb={6}>Boshlanish</Text>
                        <DatePickerInput
                          value={task.startDate ? new Date(task.startDate) : null}
                          onChange={(date) => handleUpdateField("startDate", date ? new Date(date).toISOString() : null)}
                          placeholder="Tanlang"
                          size="sm" radius="sm" clearable locale="uz"
                          styles={{ input: { backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" } }}
                        />
                      </Box>
                      <Box>
                        <Text size="sm" fw={600} c="#495057" mb={6}>Muddat</Text>
                        <DatePickerInput
                          value={task.dueDate ? new Date(task.dueDate) : null}
                          onChange={(date) => handleUpdateField("dueDate", date ? new Date(date).toISOString() : null)}
                          placeholder="Tanlang"
                          size="sm" radius="sm" clearable locale="uz"
                          styles={{ input: { backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" } }}
                        />
                      </Box>
                    </Group>

                    <Divider />

                    {/* Mas'ullar */}
                    <Box>
                      <Text size="sm" fw={600} c="#495057" mb={6}>Mas'ullar</Text>
                      <Group gap="xs">
                        {task.assignees?.map((assignee) => (
                          <Tooltip key={assignee.id} label={`${assignee.user.fullname} — olib tashlash uchun bosing`}>
                            <Avatar
                              size="sm" radius="xl" color="blue" src={assignee.user.avatarUrl}
                              style={{ cursor: "pointer", border: "2px solid #e7f5ff" }}
                              onClick={() => {
                                const newIds = task.assignees?.map((a) => a.user.id).filter((id) => id !== assignee.user.id) || [];
                                handleUpdateField("assigneeIds", newIds);
                              }}
                            >
                              {assignee.user.fullname?.charAt(0)}
                            </Avatar>
                          </Tooltip>
                        ))}

                        <Popover opened={assigneePopoverOpen} onChange={setAssigneePopoverOpen} position="bottom-start" width={260} shadow="md"
                          onClose={() => setAssigneeSearch("")}
                        >
                          <Popover.Target>
                            <GuardedActionIcon
                              permission="task:assign"
                              label="Mas'ul qo'shish"
                              variant="light"
                              size="sm"
                              radius="xl"
                              onClick={() => setAssigneePopoverOpen((o) => !o)}
                              style={{ backgroundColor: "#f8f9fa", border: "1px dashed #dee2e6" }}
                            >
                              <IconPlus size={14} />
                            </GuardedActionIcon>
                          </Popover.Target>
                          <Popover.Dropdown p={0}>
                            <Box p="xs" style={{ borderBottom: "1px solid #e9ecef" }}>
                              <TextInput
                                placeholder="Qidirish..."
                                size="xs"
                                leftSection={<IconSearch size={14} />}
                                value={assigneeSearch}
                                onChange={(e) => setAssigneeSearch(e.target.value)}
                                styles={{ input: { backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" } }}
                              />
                            </Box>
                            <ScrollArea.Autosize mah={200} p="xs">
                              <Stack gap={4}>
                                {allUsers
                                  .filter((u) => u.fullname?.toLowerCase().includes(assigneeSearch.toLowerCase()))
                                  .map((user) => {
                                    const currentIds = task.assignees?.map((a) => a.user.id) || [];
                                    const isAssigned = currentIds.includes(user.id);
                                    return (
                                      <Paper
                                        key={user.id} p="xs" radius="sm"
                                        style={{ backgroundColor: isAssigned ? "#e7f5ff" : "transparent", cursor: "pointer" }}
                                        onClick={() => {
                                          const newIds = isAssigned ? currentIds.filter((id) => id !== user.id) : [...currentIds, user.id];
                                          handleUpdateField("assigneeIds", newIds);
                                        }}
                                      >
                                        <Group gap="sm" wrap="nowrap">
                                          <Checkbox checked={isAssigned} onChange={() => {}} size="xs" styles={{ input: { cursor: "pointer" } }} />
                                          <Avatar size="xs" radius="xl" color="blue" src={user.avatarUrl}>{user.fullname?.charAt(0)}</Avatar>
                                          <Text size="sm" lineClamp={1}>{user.fullname}</Text>
                                        </Group>
                                      </Paper>
                                    );
                                  })}
                              </Stack>
                            </ScrollArea.Autosize>
                          </Popover.Dropdown>
                        </Popover>

                        {(!task.assignees || task.assignees.length === 0) && (
                          <Text size="sm" c="dimmed">Hali tayinlanmagan</Text>
                        )}
                      </Group>
                    </Box>

                    {/* Asosiy vazifa */}
                    {task.parentTaskId && parentTask && (
                      <>
                        <Divider />
                        <Box>
                          <Text size="sm" fw={600} c="#495057" mb={6}>Asosiy vazifa</Text>
                          <Paper p="xs" radius="sm" style={{ backgroundColor: "#e7f5ff", cursor: "pointer" }}>
                            <Group gap="sm">
                              <IconChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
                              <Text size="sm" c="#1e3a5f" fw={500}>{parentTask.title}</Text>
                            </Group>
                          </Paper>
                        </Box>
                      </>
                    )}

                    <Divider />

                    {/* Vaqt */}
                    <Box>
                      <Group justify="space-between" mb={6}>
                        <Text size="sm" fw={600} c="#495057">
                          Sarflangan vaqt {totalTimeLogged > 0 && <Text span c="dimmed" fw={400}>({totalTimeLogged} soat)</Text>}
                        </Text>
                        <GuardedButton
                          permission="task-time-entry:create"
                          variant="subtle" size="xs" color="gray"
                          leftSection={showTimeForm ? <IconX size={14} /> : <IconPlus size={14} />}
                          onClick={() => setShowTimeForm(!showTimeForm)}
                        >
                          {showTimeForm ? "Yopish" : "Qo'shish"}
                        </GuardedButton>
                      </Group>
                      {showTimeForm && (
                        <Box mb="sm">
                          <TimeEntryForm taskId={taskId} onClose={() => setShowTimeForm(false)} />
                        </Box>
                      )}
                      {timeEntries.length > 0 ? (
                        <Stack gap="xs">
                          {timeEntries.slice(0, 5).map((entry) => (
                            <TimeEntryItem key={entry.id} entry={entry} onDelete={(id) => deleteTimeEntry.mutate(id)} />
                          ))}
                          {timeEntries.length > 5 && (
                            <Text size="xs" c="dimmed" ta="center">Yana {timeEntries.length - 5} ta yozuv</Text>
                          )}
                        </Stack>
                      ) : !showTimeForm ? (
                        <Text size="sm" c="dimmed">Hali vaqt yozilmagan</Text>
                      ) : null}
                    </Box>

                    {/* Bog'liqliklar */}
                    {dependencies.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Text size="sm" fw={600} c="#495057" mb={6}>Bog'liq vazifalar</Text>
                          <Stack gap="xs">
                            {dependencies.map((dep) => (
                              <Paper key={dep.id} p="xs" radius="sm" style={{ backgroundColor: "#f8f9fa" }}>
                                <Group justify="space-between">
                                  <Text size="sm">{dep.dependsOnTask?.title || "Noma'lum"}</Text>
                                  <GuardedActionIcon
                                    permission="task-dependency:delete"
                                    label="O'chirish"
                                    variant="subtle"
                                    size="xs"
                                    color="red"
                                    onClick={() => deleteDependency.mutate(dep.id)}
                                  >
                                    <IconTrash size={14} />
                                  </GuardedActionIcon>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      </>
                    )}

                    {/* Kuzatuvchilar */}
                    {watchers.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Text size="sm" fw={600} c="#495057" mb={6}>Kuzatuvchilar ({watchers.length})</Text>
                          <Group gap="xs">
                            {watchers.map((w) => (
                              <Tooltip key={w.id} label={w.user?.fullname}>
                                <Avatar size="sm" radius="xl" color="blue" src={(w.user as any)?.avatarUrl}>{w.user?.fullname?.charAt(0)}</Avatar>
                              </Tooltip>
                            ))}
                          </Group>
                        </Box>
                      </>
                    )}

                    <Divider />

                    {/* Ro'yxat / Tekshiruv */}
                    <Box>
                      <Text size="sm" fw={600} c="#495057" mb={6}>Tekshiruv ro'yxati</Text>
                      <TaskChecklist taskId={taskId} />
                    </Box>

                    <Divider />

                    {/* Faoliyat */}
                    <Box>
                      <Text size="sm" fw={600} c="#495057" mb={6}>Faoliyat tarixi</Text>
                      {activities.length > 0 ? (
                        <Stack gap="sm">
                          {activities.slice(0, 10).map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                          ))}
                          {activities.length > 10 && (
                            <Text size="xs" c="dimmed" ta="center">Yana {activities.length - 10} ta faoliyat</Text>
                          )}
                        </Stack>
                      ) : (
                        <Text size="sm" c="dimmed">Hali faoliyat yo'q</Text>
                      )}
                    </Box>

                    {/* Meta */}
                    <Paper p="xs" radius="sm" style={{ backgroundColor: "#f8f9fa" }}>
                      <Text size="xs" c="dimmed">
                        Yaratildi: {format(new Date(task.createdAt), "d-MMM yyyy, HH:mm", { locale: uz })}
                        {task.createdBy && ` — ${task.createdBy.fullname}`}
                      </Text>
                    </Paper>
                  </Stack>
                </Tabs.Panel>

                {/* ═══ FAYLLAR ═══ */}
                <Tabs.Panel value="files">
                  <TaskAttachments taskId={taskId} />
                </Tabs.Panel>

                {/* ═══ ICHKI VAZIFALAR ═══ */}
                <Tabs.Panel value="subtasks">
                  <Stack gap="md">
                    {/* Progress */}
                    {subtasks.length > 0 && (
                      <Box>
                        <Group justify="space-between" mb={6}>
                          <Text size="sm" c="dimmed">{completedSubtasks.length}/{subtasks.length} bajarildi</Text>
                          <Text size="sm" fw={600} c={completedSubtasks.length === subtasks.length ? "#2ecc71" : "#1e3a5f"}>
                            {Math.round((completedSubtasks.length / subtasks.length) * 100)}%
                          </Text>
                        </Group>
                        <Progress
                          value={(completedSubtasks.length / subtasks.length) * 100}
                          size={6} radius="xl"
                          color={completedSubtasks.length === subtasks.length ? "green" : "#1e3a5f"}
                        />
                      </Box>
                    )}

                    {/* Ro'yxat */}
                    {subtasks.length > 0 ? (
                      <Stack gap="xs">
                        {subtasks.map((subtask) => {
                          const isDone = !!subtask.completedAt;
                          return (
                            <Paper key={subtask.id} p="xs" radius="sm" style={{ backgroundColor: isDone ? "#f0fdf4" : "#f8f9fa", cursor: "pointer" }}
                              onClick={() => setSelectedSubtaskId(subtask.id)}
                            >
                              <Group justify="space-between" wrap="nowrap">
                                <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                                  <Tooltip
                                    label={canCompleteTask ? "" : "Bu amalni bajarish uchun ruxsat yo'q"}
                                    disabled={canCompleteTask}
                                    withArrow
                                    position="top"
                                  >
                                    <Box
                                      w={18} h={18}
                                      style={{
                                        borderRadius: "50%",
                                        border: isDone ? "none" : "2px solid #dee2e6",
                                        backgroundColor: isDone ? "#2ecc71" : "transparent",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                        cursor: canCompleteTask ? "pointer" : "not-allowed",
                                        opacity: canCompleteTask ? 1 : 0.6,
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!canCompleteTask) return;
                                        handleToggleSubtask(subtask.id);
                                      }}
                                    >
                                      {isDone && <IconCheck size={10} color="white" />}
                                    </Box>
                                  </Tooltip>
                                  <Text size="sm" c={isDone ? "dimmed" : "#212529"} lineClamp={1}
                                    style={{ textDecoration: isDone ? "line-through" : "none", flex: 1 }}
                                  >
                                    {subtask.title}
                                  </Text>
                                </Group>
                                <Group gap={4} wrap="nowrap">
                                  {subtask.boardColumn && (
                                    <Badge size="xs" variant="light" style={{ backgroundColor: `${subtask.boardColumn.color}20`, color: subtask.boardColumn.color }}>
                                      {subtask.boardColumn.name}
                                    </Badge>
                                  )}
                                  <IconChevronRight size={14} color="#868e96" />
                                </Group>
                              </Group>
                            </Paper>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Paper p="xl" radius="sm" style={{ backgroundColor: "#f8f9fa", textAlign: "center" }}>
                        <IconSubtask size={32} color="#adb5bd" style={{ margin: "0 auto 8px" }} />
                        <Text size="sm" c="dimmed">Ichki vazifalar yo'q</Text>
                      </Paper>
                    )}

                    {/* Qo'shish */}
                    {showSubtaskForm && task.projectId ? (
                      <SubtaskForm
                        parentTaskId={taskId}
                        projectId={task.projectId}
                        onClose={() => setShowSubtaskForm(false)}
                      />
                    ) : (
                      <GuardedButton
                        permission="task:create"
                        variant="light" fullWidth
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setShowSubtaskForm(true)}
                        style={{ backgroundColor: "#f8f9fa", color: "#495057", border: "1px dashed #dee2e6" }}
                      >
                        Ichki vazifa qo'shish
                      </GuardedButton>
                    )}
                  </Stack>
                </Tabs.Panel>
              </ScrollArea>
            </Tabs>
          </Box>
        ) : (
          <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Text c="dimmed">Vazifa topilmadi</Text>
          </Box>
        )}
      </Drawer>

      {selectedSubtaskId && (
        <TaskDetailDrawer
          taskId={selectedSubtaskId}
          isOpen={!!selectedSubtaskId}
          onClose={() => setSelectedSubtaskId(null)}
        />
      )}
    </>
  );
};

export default TaskDetailDrawer;
