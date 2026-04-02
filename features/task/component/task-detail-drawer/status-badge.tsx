import { Badge } from "@mantine/core";

interface StatusBadgeProps {
  boardColumn?: { name: string; color?: string; isClosed?: boolean };
}

export const StatusBadge = ({ boardColumn }: StatusBadgeProps) => {
  const color = boardColumn?.color || "#95a5a6";
  const label = boardColumn?.name || "Noma'lum";

  return (
    <Badge
      size="sm"
      variant="light"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {label}
    </Badge>
  );
};
