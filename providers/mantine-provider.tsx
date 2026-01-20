"use client";

import { MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

// =============================================================================
// Color Palettes
// =============================================================================

const govBlue: MantineColorsTuple = [
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
];

// =============================================================================
// Theme Configuration
// =============================================================================

const theme = createTheme({
  primaryColor: "gov",
  colors: {
    gov: govBlue,
  },
  fontFamily: "inherit",
  defaultRadius: "sm",

  // ==========================================================================
  // Component Default Styles
  // ==========================================================================
  components: {
    // Button defaults
    Button: {
      defaultProps: {
        radius: "sm",
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },

    // Card defaults
    Card: {
      defaultProps: {
        radius: "sm",
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: "#e9ecef",
        },
      },
    },

    // Modal defaults
    Modal: {
      defaultProps: {
        radius: "sm",
      },
    },

    // Paper defaults
    Paper: {
      defaultProps: {
        radius: "sm",
      },
      styles: {
        root: {
          borderColor: "#e9ecef",
        },
      },
    },

    // NavLink defaults
    NavLink: {
      defaultProps: {
        radius: "sm",
      },
    },

    // Text defaults
    Text: {
      styles: {
        root: {
          // Default text color
          // color: "#212529", // Uncomment if you want default dark text
        },
      },
    },

    // Input defaults
    TextInput: {
      styles: {
        input: {
          borderColor: "#e9ecef",
          "&:focus": {
            borderColor: "#1c7ed6",
          },
        },
      },
    },

    // Select defaults
    Select: {
      styles: {
        input: {
          borderColor: "#e9ecef",
          "&:focus": {
            borderColor: "#1c7ed6",
          },
        },
      },
    },

    // Table defaults
    Table: {
      styles: {
        th: {
          backgroundColor: "#f8f9fa",
          color: "#212529",
          fontWeight: 600,
        },
        td: {
          borderColor: "#e9ecef",
        },
      },
    },

    // Badge defaults
    Badge: {
      defaultProps: {
        radius: "sm",
      },
    },

    // Divider defaults
    Divider: {
      styles: {
        root: {
          borderColor: "#e9ecef",
        },
      },
    },
  },
});

// =============================================================================
// Provider
// =============================================================================

export function MantineProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}

export { theme };
