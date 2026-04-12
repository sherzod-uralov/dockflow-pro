import { Paper, Group, Text, Badge, ActionIcon } from "@mantine/core";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";
import {
  TaskGetResponse,
  TASK_PRIORITY_OPTIONS,
} from "../../type/task.type";
import { colors } from "@/lib/colors";

interface SubtaskItemProps {
  subtask: TaskGetResponse;
  onToggleComplete: (id: string, isClosed: boolean) => void;
  onClick: (id: string) => void;
}

export const SubtaskItem = ({
  subtask,
  onToggleComplete,
  onClick,
}: SubtaskItemProps) => {
  const isCompleted = subtask.boardColumn?.isClosed === true;
  const priorityOption = TASK_PRIORITY_OPTIONS.find(
    (p) => p.value === subtask.priority
  );

  return (
    <Paper
      p="xs"
      radius="sm"
      style={{
        backgroundColor: colors.bg,
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
              onToggleComplete(subtask.id, !isCompleted);
            }}
          >
            {isCompleted && <IconCheck size={10} />}
          </ActionIcon>
          <Text
            size="sm"
            c={isCompleted ? "dimmed" : colors.textPrimary}
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
          <IconChevronRight size={14} color={colors.textDimmed} />
        </Group>
      </Group>
    </Paper>
  );
};
