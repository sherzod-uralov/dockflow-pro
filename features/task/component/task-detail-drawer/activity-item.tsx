import { Group, Box, Text } from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import { colors } from "@/lib/colors";

export interface Activity {
  id: string;
  action: string;
  details?: string;
  createdAt: Date | string;
  user?: { fullname: string };
}

interface ActivityItemProps {
  activity: Activity;
}

export const ActivityItem = ({ activity }: ActivityItemProps) => (
  <Group gap="sm" wrap="nowrap" align="flex-start">
    <Box
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: colors.primary,
        marginTop: 6,
        flexShrink: 0,
      }}
    />
    <Box style={{ flex: 1 }}>
      <Text size="sm" c={colors.textSecondary}>
        <Text span fw={500}>
          {activity.user?.fullname}
        </Text>{" "}
        {activity.action}
      </Text>
      {activity.details && (
        <Text size="xs" c="dimmed">
          {activity.details}
        </Text>
      )}
      <Text size="xs" c="dimmed">
        {formatDistanceToNow(new Date(activity.createdAt), {
          addSuffix: true,
          locale: uz,
        })}
      </Text>
    </Box>
  </Group>
);
