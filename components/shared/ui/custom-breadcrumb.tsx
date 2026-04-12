"use client";

import { Box, Text, Group, Breadcrumbs, Anchor } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import type { ReactNode } from "react";
import React from "react";
import Link from "next/link";
import { colors } from "@/lib/colors";

type BreadcrumbItemType = {
  label: string;
  href?: string;
  icon?: ReactNode;
};

interface PageHeaderProps {
  title: string;
  description?: string;
  items?: BreadcrumbItemType[];
}

export function PageHeader({
  title,
  description,
  items = [],
}: PageHeaderProps) {
  const breadcrumbItems = items.map((item, index) => {
    const isLast = index === items.length - 1;

    if (!isLast && item.href) {
      return (
        <Anchor
          key={index}
          component={Link}
          href={item.href}
          size="sm"
          c={colors.textSecondary}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            textDecoration: "none",
            "&:hover": {
              color: colors.primary,
            },
          }}
        >
          {item.icon && (
            <Box component="span" c={colors.primary} style={{ display: "flex" }}>
              {item.icon}
            </Box>
          )}
          {item.label}
        </Anchor>
      );
    }

    return (
      <Text key={index} size="sm" c="dimmed" fw={500}>
        {item.icon && (
          <Box component="span" mr={4} style={{ display: "inline-flex" }}>
            {item.icon}
          </Box>
        )}
        {item.label}
      </Text>
    );
  });

  return (
    <Group justify="space-between" mb="lg">
      <Box
        pl="sm"
        style={{
          borderLeft: `4px solid ${colors.primary}`,
        }}
      >
        <Text size="xl" fw={600} c={colors.textPrimary}>
          {title}
        </Text>
        {description && (
          <Text size="sm" c="dimmed" mt={2}>
            {description}
          </Text>
        )}
      </Box>

      {items.length > 0 && (
        <Breadcrumbs
          separator={<IconChevronRight size={14} color={colors.textDimmed} />}
          separatorMargin={6}
        >
          {breadcrumbItems}
        </Breadcrumbs>
      )}
    </Group>
  );
}
