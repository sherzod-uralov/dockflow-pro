"use client";

import { useState } from "react";
import { Paper, Stack, TextInput, Group, ActionIcon } from "@mantine/core";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useCreateTaskTimeEntry } from "@/features/task-time-entry/hook/task-time-entry.hook";
import { colors } from "@/lib/colors";

interface TimeEntryFormProps {
  taskId: string;
  onClose: () => void;
}

export const TimeEntryForm = ({ taskId, onClose }: TimeEntryFormProps) => {
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateTaskTimeEntry();

  const handleSubmit = () => {
    if (!hours || isNaN(parseFloat(hours))) return;
    createMutation.mutate(
      {
        taskId,
        hours: parseFloat(hours),
        description: description || undefined,
        date: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setHours("");
          setDescription("");
          onClose();
        },
      }
    );
  };

  return (
    <Paper p="sm" radius="sm" withBorder style={{ borderColor: colors.border }}>
      <Stack gap="xs">
        <TextInput
          placeholder="Soatlar (masalan: 2.5)"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          size="xs"
          type="number"
          step="0.5"
        />
        <TextInput
          placeholder="Tavsif (ixtiyoriy)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="xs"
        />
        <Group gap="xs" justify="flex-end">
          <ActionIcon variant="subtle" size="sm" color="gray" onClick={onClose}>
            <IconX size={14} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            color="green"
            onClick={handleSubmit}
            loading={createMutation.isLoading}
          >
            <IconCheck size={14} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
};
