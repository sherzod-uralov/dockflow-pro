"use client";

import { Box, Text, Group, Breadcrumbs, Anchor } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import type { ReactNode } from "react";
import React from "react";
import Link from "next/link";

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
          c="#495057"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            textDecoration: "none",
            "&:hover": {
              color: "#1e3a5f",
            },
          }}
        >
          {item.icon && (
            <Box component="span" c="#1e3a5f" style={{ display: "flex" }}>
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
          borderLeft: "4px solid #1e3a5f",
        }}
      >
        <Text size="xl" fw={600} c="#212529">
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
          separator={<IconChevronRight size={14} color="#868e96" />}
          separatorMargin={6}
        >
          {breadcrumbItems}
        </Breadcrumbs>
      )}
    </Group>
  );
}
