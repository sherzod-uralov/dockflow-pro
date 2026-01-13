"use client";

import { useState } from "react";
import {
  Box,
  Stack,
  Group,
  Text,
  TextInput,
  Checkbox,
  ActionIcon,
  Progress,
  Paper,
  Menu,
  Collapse,
  Button,
  Loader,
} from "@mantine/core";
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";
import {
  useGetAllTaskChecklists,
  useCreateTaskChecklist,
  useUpdateTaskChecklist,
  useDeleteTaskChecklist,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
} from "../hook/task-checklist.hook";
import { TaskChecklistGetResponse, TaskChecklistItemGetResponse } from "../type/task-checklist.type";

interface TaskChecklistProps {
  taskId: string;
}

const ChecklistItemRow = ({
  item,
  checklistId,
  onToggle,
  onDelete,
}: {
  item: TaskChecklistItemGetResponse;
  checklistId: string;
  onToggle: (item: TaskChecklistItemGetResponse) => void;
  onDelete: (checklistId: string, itemId: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);
  const updateMutation = useUpdateChecklistItem();

  const handleSave = () => {
    if (editValue.trim() && editValue !== item.title) {
      updateMutation.mutate(
        { checklistId, itemId: item.id, data: { title: editValue.trim() } },
        { onSuccess: () => setIsEditing(false) }
      );
    } else {
      setIsEditing(false);
    }
  };

  return (
    <Group gap="sm" wrap="nowrap" py={4}>
      <Checkbox
        checked={item.isCompleted}
        onChange={() => onToggle(item)}
        size="sm"
        styles={{
          input: {
            cursor: "pointer",
            "&:checked": {
              backgroundColor: "#1e3a5f",
              borderColor: "#1e3a5f",
            },
          },
        }}
      />
      {isEditing ? (
        <TextInput
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          size="xs"
          style={{ flex: 1 }}
          autoFocus
          styles={{
            input: {
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
            },
          }}
        />
      ) : (
        <Text
          size="sm"
          style={{
            flex: 1,
            textDecoration: item.isCompleted ? "line-through" : "none",
            color: item.isCompleted ? "#adb5bd" : "#212529",
            cursor: "pointer",
          }}
          onClick={() => setIsEditing(true)}
        >
          {item.title}
        </Text>
      )}
      <ActionIcon
        variant="subtle"
        size="xs"
        color="red"
        onClick={() => onDelete(checklistId, item.id)}
      >
        <IconTrash size={14} />
      </ActionIcon>
    </Group>
  );
};

const ChecklistSection = ({
  checklist,
  onDelete,
}: {
  checklist: TaskChecklistGetResponse;
  onDelete: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(checklist.title);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);

  const updateMutation = useUpdateTaskChecklist();
  const createItemMutation = useCreateChecklistItem();
  const updateItemMutation = useUpdateChecklistItem();
  const deleteItemMutation = useDeleteChecklistItem();

  const completedCount = checklist.items?.filter((i) => i.isCompleted).length || 0;
  const totalCount = checklist.items?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== checklist.title) {
      updateMutation.mutate(
        { id: checklist.id, data: { title: editTitle.trim() } },
        { onSuccess: () => setIsEditing(false) }
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      createItemMutation.mutate(
        { checklistId: checklist.id, data: { title: newItemTitle.trim() } },
        {
          onSuccess: () => {
            setNewItemTitle("");
            setShowAddItem(false);
          },
        }
      );
    }
  };

  const handleToggleItem = (item: TaskChecklistItemGetResponse) => {
    updateItemMutation.mutate({
      checklistId: checklist.id,
      itemId: item.id,
      data: { isCompleted: !item.isCompleted },
    });
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    deleteItemMutation.mutate({ checklistId, itemId });
  };

  return (
    <Paper p="sm" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
      {/* Header */}
      <Group justify="space-between" mb="xs">
        <Group gap="xs" style={{ cursor: "pointer" }} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          {isEditing ? (
            <TextInput
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              size="xs"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              styles={{
                input: {
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                },
              }}
            />
          ) : (
            <Text size="sm" fw={600} c="#212529">
              {checklist.title}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            ({completedCount}/{totalCount})
          </Text>
        </Group>

        <Menu shadow="md" width={150} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" size="xs" color="gray">
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={() => setIsEditing(true)}
            >
              Nomini o'zgartirish
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={() => onDelete(checklist.id)}
            >
              O'chirish
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Progress */}
      <Progress
        value={progress}
        size="xs"
        mb="sm"
        color={progress === 100 ? "green" : "#1e3a5f"}
      />

      {/* Items */}
      <Collapse in={isOpen}>
        <Stack gap={0}>
          {checklist.items?.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              checklistId={checklist.id}
              onToggle={handleToggleItem}
              onDelete={handleDeleteItem}
            />
          ))}

          {/* Add item */}
          {showAddItem ? (
            <Group gap="xs" mt="xs">
              <TextInput
                placeholder="Yangi element..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                size="xs"
                style={{ flex: 1 }}
                autoFocus
                styles={{
                  input: {
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                  },
                }}
              />
              <ActionIcon
                size="sm"
                color="green"
                onClick={handleAddItem}
                loading={createItemMutation.isLoading}
              >
                <IconCheck size={14} />
              </ActionIcon>
            </Group>
          ) : (
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => setShowAddItem(true)}
              mt="xs"
              styles={{
                root: {
                  color: "#868e96",
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                  },
                },
              }}
            >
              Element qo'shish
            </Button>
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export const TaskChecklist = ({ taskId }: TaskChecklistProps) => {
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");

  const { data: checklistsData, isLoading } = useGetAllTaskChecklists({
    taskId,
    pageSize: 100,
  });

  const createMutation = useCreateTaskChecklist();
  const deleteMutation = useDeleteTaskChecklist();

  const checklists = checklistsData?.data || [];

  const handleAddChecklist = () => {
    if (newChecklistTitle.trim()) {
      createMutation.mutate(
        { taskId, title: newChecklistTitle.trim() },
        {
          onSuccess: () => {
            setNewChecklistTitle("");
            setShowAddChecklist(false);
          },
        }
      );
    }
  };

  const handleDeleteChecklist = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Box py="md" style={{ display: "flex", justifyContent: "center" }}>
        <Loader size="sm" color="#1e3a5f" />
      </Box>
    );
  }

  return (
    <Stack gap="md">
      {checklists.map((checklist) => (
        <ChecklistSection
          key={checklist.id}
          checklist={checklist}
          onDelete={handleDeleteChecklist}
        />
      ))}

      {/* Add checklist */}
      {showAddChecklist ? (
        <Paper p="sm" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs">
            <TextInput
              placeholder="Checklist nomi..."
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddChecklist()}
              size="sm"
              style={{ flex: 1 }}
              autoFocus
              styles={{
                input: {
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                },
              }}
            />
            <Button
              size="sm"
              onClick={handleAddChecklist}
              loading={createMutation.isLoading}
              style={{ backgroundColor: "#1e3a5f" }}
            >
              Qo'shish
            </Button>
            <Button
              size="sm"
              variant="subtle"
              color="gray"
              onClick={() => {
                setShowAddChecklist(false);
                setNewChecklistTitle("");
              }}
            >
              Bekor
            </Button>
          </Group>
        </Paper>
      ) : (
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={() => setShowAddChecklist(true)}
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
          Checklist qo'shish
        </Button>
      )}
    </Stack>
  );
};

export default TaskChecklist;
