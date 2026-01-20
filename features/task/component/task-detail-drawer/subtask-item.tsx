import { Paper, Group, Text, Badge, ActionIcon } from "@mantine/core";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";
import {
  TaskGetResponse,
  TaskStatus,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from "../../type/task.type";

interface SubtaskItemProps {
  subtask: TaskGetResponse;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onClick: (id: string) => void;
}

export const SubtaskItem = ({
  subtask,
  onStatusChange,
  onClick,
}: SubtaskItemProps) => {
  const isCompleted = subtask.status === TaskStatus.COMPLETED;
  const priorityOption = TASK_PRIORITY_OPTIONS.find(
    (p) => p.value === subtask.priority
  );

  return (
    <Paper
      p="xs"
      radius="sm"
      style={{
        backgroundColor: "#f8f9fa",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
      onClick={() => onClick(subtask.id)}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <ActionIcon
            variant={isCompleted ? "filled" : "outline"}
            size="xs"
            color={isCompleted ? "green" : "gray"}
            radius="xl"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(
                subtask.id,
                isCompleted ? TaskStatus.NOT_STARTED : TaskStatus.COMPLETED
              );
            }}
          >
            {isCompleted && <IconCheck size={10} />}
          </ActionIcon>
          <Text
            size="sm"
            c={isCompleted ? "dimmed" : "#212529"}
            lineClamp={1}
            style={{
              textDecoration: isCompleted ? "line-through" : "none",
              flex: 1,
            }}
          >
            {subtask.title}
          </Text>
        </Group>
        <Group gap={4}>
          {priorityOption && (
            <Badge
              size="xs"
              variant="light"
              style={{
                backgroundColor: `${priorityOption.color}20`,
                color: priorityOption.color,
              }}
            >
              {priorityOption.label}
            </Badge>
          )}
          <IconChevronRight size={14} color="#868e96" />
        </Group>
      </Group>
    </Paper>
  );
};
