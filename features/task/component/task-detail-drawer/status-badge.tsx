import { Badge } from "@mantine/core";
import { colors } from "@/lib/colors";

interface StatusBadgeProps {
  boardColumn?: { name: string; color?: string; isClosed?: boolean };
}

export const StatusBadge = ({ boardColumn }: StatusBadgeProps) => {
  const color = boardColumn?.color || colors.textDimmed;
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
