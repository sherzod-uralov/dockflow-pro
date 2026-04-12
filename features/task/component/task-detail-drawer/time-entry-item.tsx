import { Paper, Group, Box, Text, Badge, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { colors } from "@/lib/colors";

export interface TimeEntry {
  id: string;
  hours: number;
  description?: string;
  date?: Date | string;
  isBillable?: boolean;
  user?: { fullname: string };
}

interface TimeEntryItemProps {
  entry: TimeEntry;
  onDelete: (id: string) => void;
}

export const TimeEntryItem = ({ entry, onDelete }: TimeEntryItemProps) => (
  <Paper p="xs" radius="sm" style={{ backgroundColor: colors.bg }}>
    <Group justify="space-between" wrap="nowrap">
      <Box style={{ flex: 1 }}>
        <Group gap="xs">
          <Text size="sm" fw={600} c={colors.primary}>
            {entry.hours}h
          </Text>
          {entry.isBillable && (
            <Badge size="xs" color="green" variant="light">
              Hisoblangan
            </Badge>
          )}
        </Group>
        {entry.description && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {entry.description}
          </Text>
        )}
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {entry.user?.fullname}
          </Text>
          {entry.date && (
            <Text size="xs" c="dimmed">
              • {format(new Date(entry.date), "dd MMM yyyy", { locale: uz })}
            </Text>
          )}
        </Group>
      </Box>
      <ActionIcon
        variant="subtle"
        size="xs"
        color="red"
        onClick={() => onDelete(entry.id)}
      >
        <IconTrash size={14} />
      </ActionIcon>
    </Group>
  </Paper>
);
