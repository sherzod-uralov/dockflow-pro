"use client";

import { useState } from "react";
import { Paper, Group, TextInput, ActionIcon } from "@mantine/core";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useCreateTask } from "../../hook/task.hook";
import { TaskPriority } from "../../type/task.type";

interface SubtaskFormProps {
  parentTaskId: string;
  projectId: string;
  onClose: () => void;
  onSuccess?: (taskId: string) => void;
}

export const SubtaskForm = ({
  parentTaskId,
  projectId,
  onClose,
  onSuccess,
}: SubtaskFormProps) => {
  const [title, setTitle] = useState("");
  const createMutation = useCreateTask();

  const handleSubmit = () => {
    if (!title.trim()) return;
    createMutation.mutate(
      {
        title: title.trim(),
        projectId,
        parentTaskId,
        priority: TaskPriority.MEDIUM,
      },
      {
        onSuccess: (data) => {
          setTitle("");
          onClose();
          onSuccess?.(data.id);
        },
      }
    );
  };

  return (
    <Paper p="sm" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
      <Group gap="xs">
        <TextInput
          placeholder="Ichki vazifa nomini kiriting..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          size="xs"
          style={{ flex: 1 }}
          autoFocus
        />
        <ActionIcon variant="subtle" size="sm" color="gray" onClick={onClose}>
          <IconX size={14} />
        </ActionIcon>
        <ActionIcon
          size="sm"
          color="green"
          onClick={handleSubmit}
          loading={createMutation.isLoading}
          disabled={!title.trim()}
        >
          <IconCheck size={14} />
        </ActionIcon>
      </Group>
    </Paper>
  );
};
