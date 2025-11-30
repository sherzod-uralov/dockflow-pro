"use client";

import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { setColorScheme } = useMantineColorScheme();

  const handleToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setColorScheme(newTheme);
  };

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      radius="sm"
      onClick={handleToggle}
      aria-label="Mavzuni o'zgartirish"
    >
      <IconSun
        size={20}
        stroke={1.5}
        style={{
          display: theme === "dark" ? "none" : "block",
        }}
      />
      <IconMoon
        size={20}
        stroke={1.5}
        style={{
          display: theme === "dark" ? "block" : "none",
        }}
      />
    </ActionIcon>
  );
}
