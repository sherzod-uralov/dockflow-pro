"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

// Davlat sektori uchun professional ko'k rang palitrasi
const theme = createTheme({
  primaryColor: "gov",
  colors: {
    gov: [
      "#e7f5ff",
      "#d0ebff",
      "#a5d8ff",
      "#74c0fc",
      "#4dabf7",
      "#339af0",
      "#1c7ed6",
      "#1971c2",
      "#1864ab",
      "#145591",
    ],
  },
  fontFamily: "inherit",
  defaultRadius: "sm",
  components: {
    Button: {
      defaultProps: {
        radius: "sm",
      },
    },
    Card: {
      defaultProps: {
        radius: "sm",
        withBorder: true,
      },
    },
    Modal: {
      defaultProps: {
        radius: "sm",
      },
    },
    Paper: {
      defaultProps: {
        radius: "sm",
      },
    },
    NavLink: {
      defaultProps: {
        radius: "sm",
      },
    },
  },
});

export function MantineProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-right" />
        {children}
      </MantineProvider>
    );
  }

  return (
    <MantineProvider
      theme={theme}
      forceColorScheme="light"
    >
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
