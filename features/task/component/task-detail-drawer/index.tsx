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
} from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import {
  useGetTaskById,
  useGetAllTasks,
  useUpdateTask,
  useDeleteTask,
} from "../../hook/task.hook";
import {
  TaskStatus,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from "../../type/task.type";
import { TaskCommentsInline } from "@/features/task-comment/component/task-comments-inline";
import { TaskAttachments } from "@/features/task-attachment/component/task-attachments";
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Users for assignee selection
  const { data: usersData } = useGetUserQuery({
    pageNumber: 1,
    pageSize: 1000,
  });
  const allUsers = usersData?.data || [];

  // Task data
  const { data: task, isLoading: taskLoading } = useGetTaskById(taskId || "", {
    enabled: !!taskId && isOpen,
  });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Related data
  const { data: commentsData } = useGetAllTaskComments({
    taskId: taskId || "",
    pageSize: 1,
  });
  const { data: attachmentsData } = useGetAllTaskAttachments({
    taskId: taskId || "",
    pageSize: 1,
  });
  const { data: checklistsData } = useGetAllTaskChecklists({
    taskId: taskId || "",
    pageSize: 1,
  });
  const { data: timeEntriesData } = useGetAllTaskTimeEntries({
    taskId: taskId || "",
    pageSize: 100,
  });
  const { data: activitiesData } = useGetAllTaskActivities({
    taskId: taskId || "",
    pageSize: 50,
  });
  const { data: watchersData } = useGetAllTaskWatchers({
    taskId: taskId || "",
  });
  const { data: dependenciesData } = useGetAllTaskDependencies({
    taskId: taskId || "",
  });

  // Subtasks
  const { data: subtasksData } = useGetAllTasks({
    parentTaskId: taskId || undefined,
    pageSize: 100,
  });

  // Parent task (if this is a subtask)
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

  const handleSubtaskStatusChange = (subtaskId: string, status: TaskStatus) => {
    updateTask.mutate({ id: subtaskId, data: { status } });
  };

  const handleSubtaskClick = (subtaskId: string) => {
    setSelectedSubtaskId(subtaskId);
  };

  const handleUpdateField = (field: string, value: unknown) => {
    if (!taskId) return;
    updateTask.mutate({ id: taskId, data: { [field]: value } });
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
      onSuccess: () => {
        onClose();
        onDelete?.();
      },
    });
  };

  const toggleWatch = () => {
    if (!taskId) return;
    if (isWatching) {
      unwatchTask.mutate(taskId);
    } else {
      watchTask.mutate(taskId);
    }
  };

  if (!taskId) return null;

  const completedSubtasks = subtasks.filter((s) => s.status === TaskStatus.COMPLETED);

  return (
    <>
      <Drawer
        opened={isOpen}
        onClose={onClose}
        position="right"
        size={isFullscreen ? "100%" : "xl"}
        padding={0}
        withCloseButton={false}
        styles={{
          body: { height: "100%", display: "flex", flexDirection: "column" },
        }}
      >
        {taskLoading ? (
          <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Loader size="md" color="#1e3a5f" />
          </Box>
        ) : task ? (
          <Box style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              {/* Header */}
              <Box
                p="md"
                style={{
                  borderBottom: "1px solid #e9ecef",
                  flexShrink: 0,
                }}
              >
                <Group justify="space-between" mb="sm">
                  <Group gap="sm">
                    {task.project && (
                      <Badge
                        size="sm"
                        variant="light"
                        style={{
                          backgroundColor: `${task.project.color || "#1e3a5f"}20`,
                          color: task.project.color || "#1e3a5f",
                        }}
                      >
                        {task.project.name}
                      </Badge>
                    )}
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </Group>
                  <Group gap="xs">
                    <Tooltip label={isWatching ? "Kuzatishni to'xtatish" : "Kuzatish"}>
                      <ActionIcon
                        variant="subtle"
                        color={isWatching ? "blue" : "gray"}
                        onClick={toggleWatch}
                        loading={watchTask.isLoading || unwatchTask.isLoading}
                      >
                        {isWatching ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={isFullscreen ? "Kichraytirish" : "Kattalashtirish"}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
                      </ActionIcon>
                    </Tooltip>
                    <Menu shadow="md" width={150}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={handleDelete}
                        >
                          O'chirish
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                    <ActionIcon variant="subtle" color="gray" onClick={onClose}>
                      <IconX size={18} />
                    </ActionIcon>
                  </Group>
                </Group>

                {/* Title */}
                {isEditingTitle ? (
                  <TextInput
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle();
                      if (e.key === "Escape") {
                        setIsEditingTitle(false);
                        setEditTitle(task.title);
                      }
                    }}
                    autoFocus
                    size="md"
                    styles={{
                      input: {
                        fontSize: 18,
                        fontWeight: 600,
                        border: "none",
                        backgroundColor: "transparent",
                        padding: 0,
                      },
                    }}
                  />
                ) : (
                  <Text
                    size="lg"
                    fw={600}
                    c="#212529"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setEditTitle(task.title);
                      setIsEditingTitle(true);
                    }}
                  >
                    {task.title}
                  </Text>
                )}
              </Box>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onChange={setActiveTab}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  minHeight: 0,
                }}
              >
                <Tabs.List px="md" style={{ flexShrink: 0 }}>
                  <Tabs.Tab value="details" leftSection={<IconEdit size={14} />}>
                    Ma'lumot
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="comments"
                    leftSection={<IconMessage size={14} />}
                    rightSection={
                      commentsCount > 0 ? (
                        <Badge size="xs" variant="light" color="blue">
                          {commentsCount}
                        </Badge>
                      ) : null
                    }
                  >
                    Izohlar
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="attachments"
                    leftSection={<IconPaperclip size={14} />}
                    rightSection={
                      attachmentsCount > 0 ? (
                        <Badge size="xs" variant="light" color="blue">
                          {attachmentsCount}
                        </Badge>
                      ) : null
                    }
                  >
                    Fayllar
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="checklists"
                    leftSection={<IconChecklist size={14} />}
                    rightSection={
                      checklistsCount > 0 ? (
                        <Badge size="xs" variant="light" color="blue">
                          {checklistsCount}
                        </Badge>
                      ) : null
                    }
                  >
                    Checklist
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="subtasks"
                    leftSection={<IconSubtask size={14} />}
                    rightSection={
                      subtasks.length > 0 ? (
                        <Badge size="xs" variant="light" color="blue">
                          {completedSubtasks.length}/{subtasks.length}
                        </Badge>
                      ) : null
                    }
                  >
                    Subtasks
                  </Tabs.Tab>
                </Tabs.List>

                <ScrollArea style={{ flex: 1, minHeight: 0 }} p="md">
                  {/* Details Tab */}
                  <Tabs.Panel value="details">
                    <Stack gap="md">
                      {/* Description */}
                      <Box>
                        <Text size="sm" fw={500} c="#495057" mb="xs">
                          Tavsif
                        </Text>
                        {isEditingDesc ? (
                          <Textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            onBlur={handleSaveDesc}
                            autosize
                            minRows={3}
                            autoFocus
                          />
                        ) : (
                          <Paper
                            p="sm"
                            radius="sm"
                            style={{
                              backgroundColor: "#f8f9fa",
                              cursor: "pointer",
                              minHeight: 60,
                            }}
                            onClick={() => {
                              setEditDesc(task.description || "");
                              setIsEditingDesc(true);
                            }}
                          >
                            <Text size="sm" c={task.description ? "#495057" : "dimmed"}>
                              {task.description || "Tavsif qo'shish uchun bosing..."}
                            </Text>
                          </Paper>
                        )}
                      </Box>

                      <Divider />

                      {/* Status & Priority */}
                      <Group grow>
                        <Box>
                          <Text size="sm" fw={500} c="#495057" mb="xs">
                            Holat
                          </Text>
                          <Select
                            data={TASK_STATUS_OPTIONS.map((o) => ({
                              value: o.value,
                              label: o.label,
                            }))}
                            value={task.status}
                            onChange={(value) =>
                              value && handleUpdateField("status", value)
                            }
                            size="sm"
                          />
                        </Box>
                        <Box>
                          <Text size="sm" fw={500} c="#495057" mb="xs">
                            Muhimlik
                          </Text>
                          <Select
                            data={TASK_PRIORITY_OPTIONS.map((o) => ({
                              value: o.value,
                              label: o.label,
                            }))}
                            value={task.priority}
                            onChange={(value) =>
                              value && handleUpdateField("priority", value)
                            }
                            size="sm"
                          />
                        </Box>
                      </Group>

                      {/* Dates */}
                      <Group grow>
                        <Box>
                          <Text size="sm" fw={500} c="#495057" mb="xs">
                            <Group gap={4}>
                              <IconCalendar size={14} />
                              Boshlanish sanasi
                            </Group>
                          </Text>
                          <DatePickerInput
                            value={task.startDate ? new Date(task.startDate) : null}
                            onChange={(date) =>
                              handleUpdateField(
                                "startDate",
                                date ? new Date(date).toISOString() : null
                              )
                            }
                            placeholder="Sanani tanlang"
                            size="sm"
                            clearable
                            locale="uz"
                          />
                        </Box>
                        <Box>
                          <Text size="sm" fw={500} c="#495057" mb="xs">
                            <Group gap={4}>
                              <IconCalendar size={14} />
                              Tugash sanasi
                            </Group>
                          </Text>
                          <DatePickerInput
                            value={task.dueDate ? new Date(task.dueDate) : null}
                            onChange={(date) =>
                              handleUpdateField(
                                "dueDate",
                                date ? new Date(date).toISOString() : null
                              )
                            }
                            placeholder="Sanani tanlang"
                            size="sm"
                            clearable
                            locale="uz"
                          />
                        </Box>
                      </Group>

                      {/* Assignees */}
                      <Box>
                        <Text size="sm" fw={500} c="#495057" mb="xs">
                          <Group gap={4}>
                            <IconUser size={14} />
                            Mas'ullar
                          </Group>
                        </Text>
                        <Group gap="xs">
                          {task.assignees && task.assignees.length > 0 && (
                            <>
                              {task.assignees.map((assignee) => (
                                <Tooltip key={assignee.id} label={assignee.user.fullname}>
                                  <Avatar
                                    size="sm"
                                    radius="xl"
                                    color="blue"
                                    src={assignee.user.avatarUrl}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      const currentIds =
                                        task.assignees?.map((a) => a.user.id) || [];
                                      const newIds = currentIds.filter(
                                        (id) => id !== assignee.user.id
                                      );
                                      handleUpdateField("assigneeIds", newIds);
                                    }}
                                  >
                                    {assignee.user.fullname?.charAt(0)}
                                  </Avatar>
                                </Tooltip>
                              ))}
                            </>
                          )}

                          <Popover
                            opened={assigneePopoverOpen}
                            onChange={setAssigneePopoverOpen}
                            position="bottom-start"
                            width={250}
                            shadow="md"
                          >
                            <Popover.Target>
                              <Tooltip label="Mas'ul qo'shish">
                                <ActionIcon
                                  variant="light"
                                  size="sm"
                                  radius="xl"
                                  onClick={() => setAssigneePopoverOpen((o) => !o)}
                                  style={{
                                    backgroundColor: "#f8f9fa",
                                    border: "1px dashed #dee2e6",
                                  }}
                                >
                                  <IconPlus size={14} />
                                </ActionIcon>
                              </Tooltip>
                            </Popover.Target>
                            <Popover.Dropdown p="xs">
                              <Text size="xs" fw={500} c="dimmed" mb="xs">
                                Foydalanuvchi tanlang
                              </Text>
                              <ScrollArea.Autosize mah={200}>
                                <Stack gap={4}>
                                  {allUsers.map((user) => {
                                    const currentIds =
                                      task.assignees?.map((a) => a.user.id) || [];
                                    const isAssigned = currentIds.includes(user.id);
                                    return (
                                      <Paper
                                        key={user.id}
                                        p="xs"
                                        radius="sm"
                                        style={{
                                          backgroundColor: isAssigned
                                            ? "#e7f5ff"
                                            : "#f8f9fa",
                                          cursor: "pointer",
                                        }}
                                        onClick={() => {
                                          const newIds = isAssigned
                                            ? currentIds.filter((id) => id !== user.id)
                                            : [...currentIds, user.id];
                                          handleUpdateField("assigneeIds", newIds);
                                        }}
                                      >
                                        <Group gap="sm" wrap="nowrap">
                                          <Checkbox
                                            checked={isAssigned}
                                            onChange={() => {}}
                                            size="xs"
                                            styles={{
                                              input: { cursor: "pointer" },
                                            }}
                                          />
                                          <Avatar size="xs" radius="xl" color="blue">
                                            {user.fullname?.charAt(0)}
                                          </Avatar>
                                          <Text size="sm" lineClamp={1}>
                                            {user.fullname}
                                          </Text>
                                        </Group>
                                      </Paper>
                                    );
                                  })}
                                </Stack>
                              </ScrollArea.Autosize>
                            </Popover.Dropdown>
                          </Popover>

                          {(!task.assignees || task.assignees.length === 0) && (
                            <Text size="sm" c="dimmed">
                              Tayinlanmagan
                            </Text>
                          )}
                        </Group>
                      </Box>

                      <Divider />

                      {/* Parent Task */}
                      {task.parentTaskId && parentTask && (
                        <>
                          <Box>
                            <Text size="sm" fw={500} c="#495057" mb="xs">
                              <Group gap={4}>
                                <IconSubtask size={14} />
                                Asosiy vazifa
                              </Group>
                            </Text>
                            <Paper
                              p="xs"
                              radius="sm"
                              style={{
                                backgroundColor: "#e7f5ff",
                                cursor: "pointer",
                              }}
                              onClick={() => setSelectedSubtaskId(null)}
                            >
                              <Group gap="sm">
                                <IconChevronRight
                                  size={14}
                                  style={{ transform: "rotate(180deg)" }}
                                />
                                <Text size="sm" c="#1e3a5f" fw={500}>
                                  {parentTask.title}
                                </Text>
                              </Group>
                            </Paper>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {/* Time Entries */}
                      <Box>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" fw={500} c="#495057">
                            <Group gap={4}>
                              <IconClock size={14} />
                              Vaqt yozuvlari
                            </Group>
                          </Text>
                          <ActionIcon
                            variant="light"
                            size="sm"
                            onClick={() => setShowTimeForm(!showTimeForm)}
                          >
                            {showTimeForm ? <IconX size={14} /> : <IconClock size={14} />}
                          </ActionIcon>
                        </Group>
                        {showTimeForm && (
                          <Box mb="sm">
                            <TimeEntryForm
                              taskId={taskId}
                              onClose={() => setShowTimeForm(false)}
                            />
                          </Box>
                        )}
                        {timeEntries.length > 0 ? (
                          <Stack gap="xs">
                            {timeEntries.slice(0, 5).map((entry) => (
                              <TimeEntryItem
                                key={entry.id}
                                entry={entry}
                                onDelete={(id) => deleteTimeEntry.mutate(id)}
                              />
                            ))}
                            {timeEntries.length > 5 && (
                              <Text size="xs" c="dimmed" ta="center">
                                +{timeEntries.length - 5} ta boshqa
                              </Text>
                            )}
                          </Stack>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Vaqt yozuvlari yo'q
                          </Text>
                        )}
                      </Box>

                      <Divider />

                      {/* Dependencies */}
                      {dependencies.length > 0 && (
                        <Box>
                          <Text size="sm" fw={500} c="#495057" mb="xs">
                            <Group gap={4}>
                              <IconLink size={14} />
                              Bog'liqliklar
                            </Group>
                          </Text>
                          <Stack gap="xs">
                            {dependencies.map((dep) => (
                              <Paper
                                key={dep.id}
                                p="xs"
                                radius="sm"
                                style={{ backgroundColor: "#f8f9fa" }}
                              >
                                <Group justify="space-between">
                                  <Text size="sm">
                                    {dep.dependsOnTask?.title || "Noma'lum vazifa"}
                                  </Text>
                                  <ActionIcon
                                    variant="subtle"
                                    size="xs"
                                    color="red"
                                    onClick={() => deleteDependency.mutate(dep.id)}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Watchers */}
                      {watchers.length > 0 && (
                        <Box>
                          <Text size="sm" fw={500} c="#495057" mb="xs">
                            <Group gap={4}>
                              <IconEye size={14} />
                              Kuzatuvchilar ({watchers.length})
                            </Group>
                          </Text>
                          <Group gap="xs">
                            {watchers.map((watcher) => (
                              <Tooltip key={watcher.id} label={watcher.user?.fullname}>
                                <Avatar size="sm" radius="xl" color="blue">
                                  {watcher.user?.fullname?.charAt(0)}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </Group>
                        </Box>
                      )}

                      <Divider />

                      {/* Activity */}
                      <Box>
                        <Text size="sm" fw={500} c="#495057" mb="xs">
                          <Group gap={4}>
                            <IconActivity size={14} />
                            Faoliyat
                          </Group>
                        </Text>
                        {activities.length > 0 ? (
                          <Stack gap="sm">
                            {activities.slice(0, 10).map((activity) => (
                              <ActivityItem key={activity.id} activity={activity} />
                            ))}
                          </Stack>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Faoliyat tarixi bo'sh
                          </Text>
                        )}
                      </Box>

                      {/* Meta info */}
                      <Box pt="md">
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Yaratildi:{" "}
                            {format(new Date(task.createdAt), "dd MMM yyyy HH:mm", {
                              locale: uz,
                            })}
                          </Text>
                          {task.createdBy && (
                            <Text size="xs" c="dimmed">
                              • {task.createdBy.fullname}
                            </Text>
                          )}
                        </Group>
                      </Box>
                    </Stack>
                  </Tabs.Panel>

                  {/* Comments Tab */}
                  <Tabs.Panel value="comments" style={{ height: "calc(100vh - 250px)" }}>
                    <TaskCommentsInline taskId={taskId} />
                  </Tabs.Panel>

                  {/* Attachments Tab */}
                  <Tabs.Panel value="attachments">
                    <TaskAttachments taskId={taskId} />
                  </Tabs.Panel>

                  {/* Checklists Tab */}
                  <Tabs.Panel value="checklists">
                    <TaskChecklist taskId={taskId} />
                  </Tabs.Panel>

                  {/* Subtasks Tab */}
                  <Tabs.Panel value="subtasks">
                    <Stack gap="md">
                      {/* Header with progress */}
                      <Paper p="sm" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                        <Group justify="space-between" mb="xs">
                          <Group gap="xs">
                            <Text size="sm" fw={600} c="#212529">
                              Subtasks
                            </Text>
                            <Text size="xs" c="dimmed">
                              ({completedSubtasks.length}/{subtasks.length})
                            </Text>
                          </Group>
                        </Group>
                        {subtasks.length > 0 && (
                          <Box
                            style={{
                              height: 6,
                              backgroundColor: "#e9ecef",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              style={{
                                height: "100%",
                                width: `${(completedSubtasks.length / subtasks.length) * 100}%`,
                                backgroundColor:
                                  completedSubtasks.length === subtasks.length
                                    ? "#2ecc71"
                                    : "#1e3a5f",
                                borderRadius: 3,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </Box>
                        )}
                      </Paper>

                      {/* Subtask List */}
                      {subtasks.length > 0 ? (
                        <Stack gap="xs">
                          {subtasks.map((subtask) => (
                            <Paper
                              key={subtask.id}
                              p="xs"
                              radius="sm"
                              style={{ backgroundColor: "#f8f9fa" }}
                            >
                              <Group justify="space-between" wrap="nowrap">
                                <Group
                                  gap="sm"
                                  wrap="nowrap"
                                  style={{ flex: 1, minWidth: 0 }}
                                >
                                  <ActionIcon
                                    variant={
                                      subtask.status === TaskStatus.COMPLETED
                                        ? "filled"
                                        : "outline"
                                    }
                                    size="xs"
                                    color={
                                      subtask.status === TaskStatus.COMPLETED
                                        ? "green"
                                        : "gray"
                                    }
                                    radius="xl"
                                    onClick={() =>
                                      handleSubtaskStatusChange(
                                        subtask.id,
                                        subtask.status === TaskStatus.COMPLETED
                                          ? TaskStatus.NOT_STARTED
                                          : TaskStatus.COMPLETED
                                      )
                                    }
                                  >
                                    {subtask.status === TaskStatus.COMPLETED && (
                                      <IconCheck size={10} />
                                    )}
                                  </ActionIcon>
                                  <Text
                                    size="sm"
                                    c={
                                      subtask.status === TaskStatus.COMPLETED
                                        ? "dimmed"
                                        : "#212529"
                                    }
                                    lineClamp={1}
                                    style={{
                                      textDecoration:
                                        subtask.status === TaskStatus.COMPLETED
                                          ? "line-through"
                                          : "none",
                                      flex: 1,
                                      cursor: "pointer",
                                    }}
                                    onClick={() => handleSubtaskClick(subtask.id)}
                                  >
                                    {subtask.title}
                                  </Text>
                                </Group>
                                <ActionIcon
                                  variant="subtle"
                                  size="xs"
                                  color="red"
                                  onClick={() => {
                                    if (confirm("Ichki vazifani o'chirishni xohlaysizmi?")) {
                                      deleteTask.mutate(subtask.id);
                                    }
                                  }}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            </Paper>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="sm" c="dimmed" ta="center" py="md">
                          Ichki vazifalar yo'q
                        </Text>
                      )}

                      {/* Add Subtask */}
                      {showSubtaskForm && task.projectId ? (
                        <Paper p="sm" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                          <SubtaskForm
                            parentTaskId={taskId}
                            projectId={task.projectId}
                            onClose={() => setShowSubtaskForm(false)}
                          />
                        </Paper>
                      ) : (
                        <Button
                          variant="light"
                          leftSection={<IconPlus size={16} />}
                          onClick={() => setShowSubtaskForm(true)}
                          styles={{
                            root: {
                              backgroundColor: "#f8f9fa",
                              color: "#495057",
                              border: "1px dashed #e9ecef",
                              "&:hover": {
                                backgroundColor: "#e9ecef",
                              },
                            },
                          }}
                        >
                          Ichki vazifa qo'shish
                        </Button>
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

      {/* Nested Drawer for Subtask */}
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
