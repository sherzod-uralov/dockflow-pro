"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Box, ScrollArea } from "@mantine/core";
import { Sidebar } from "@/components/shared/layout/sidebar";
import { Header } from "@/components/shared/layout/header";
import { PermissionProvider } from "@/providers/permission-provider";
import { OnboardingProvider } from "@/hooks/use-onboarding";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PermissionProvider>
      <OnboardingProvider>
        <Box
          style={{
            display: "flex",
            height: "100vh",
            backgroundColor: "var(--mantine-color-body)",
          }}
        >
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <ScrollArea
              component="main"
              style={{ flex: 1 }}
              p="md"
              type="auto"
            >
              <Box maw={1280} mx="auto">
                {children}
              </Box>
            </ScrollArea>
          </Box>
        </Box>
      </OnboardingProvider>
    </PermissionProvider>
  );
}
