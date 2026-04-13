"use client";

import { Paper, Group, Text, Box } from "@mantine/core";
import { useRouter } from "next/navigation";
import type { Icon } from "@tabler/icons-react";
import { colors } from "@/lib/colors";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: Icon;
  href?: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  href,
  description,
  trend,
}: StatCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(`/dashboard/${href}`);
    }
  };

  return (
    <Paper
      p="lg"
      radius="sm"
      withBorder
      style={{
        cursor: href ? "pointer" : "default",
        borderColor: colors.border,
      }}
      onClick={handleClick}
    >
      <Group justify="space-between" align="flex-start" mb="md">
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        <Box
          p={8}
          style={{
            backgroundColor: colors.bgSubtle,
            borderRadius: 6,
          }}
        >
          <Icon size={20} color={colors.textSecondary} stroke={1.5} />
        </Box>
      </Group>

      <Text fw={700} style={{ fontSize: 28, lineHeight: 1.2, color: colors.textPrimary }}>
        {value}
      </Text>

      {description && (
        <Text size="sm" c="dimmed" mt={6}>
          {description}
        </Text>
      )}

      {trend && (
        <Group gap={6} mt="sm">
          <Text
            size="sm"
            fw={500}
            c={trend.isPositive ? colors.successDark : colors.errorDark}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </Text>
          <Text size="sm" c="dimmed">
            oldingi oydan
          </Text>
        </Group>
      )}
    </Paper>
  );
}
