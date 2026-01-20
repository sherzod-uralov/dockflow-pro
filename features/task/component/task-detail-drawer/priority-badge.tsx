import { Badge } from "@mantine/core";
import { IconFlag } from "@tabler/icons-react";
import { TaskPriority, TASK_PRIORITY_OPTIONS } from "../../type/task.type";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const option = TASK_PRIORITY_OPTIONS.find((o) => o.value === priority);

  return (
    <Badge
      size="sm"
      variant="light"
      leftSection={<IconFlag size={12} />}
      style={{
        backgroundColor: `${option?.color}20`,
        color: option?.color,
      }}
    >
      {option?.label || priority}
    </Badge>
  );
};
