import { Badge } from "@mantine/core";
import { TaskStatus, TASK_STATUS_OPTIONS } from "../../type/task.type";

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const option = TASK_STATUS_OPTIONS.find((o) => o.value === status);

  return (
    <Badge
      size="sm"
      variant="light"
      style={{
        backgroundColor: `${option?.color}20`,
        color: option?.color,
      }}
    >
      {option?.label || status}
    </Badge>
  );
};
