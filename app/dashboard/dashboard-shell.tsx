"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Box, ScrollArea } from "@mantine/core";
import { Sidebar } from "@/components/shared/layout/sidebar";
import { Header } from "@/components/shared/layout/header";
import { PermissionProvider } from "@/providers/permission-provider";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import { SocketProvider } from "@/providers/socket.provider";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import { useChatSocket } from "@/features/chat";

// Og'ir komponentlar — lazy load
const AiChatWidget = dynamic(
  () => import("@/features/ai-chat/component/ai-chat-widget").then(m => ({ default: m.AiChatWidget })),
  { ssr: false }
);
const CallOverlay = dynamic(
  () => import("@/features/chat/component/call-overlay").then(m => ({ default: m.CallOverlay })),
  { ssr: false }
);

const ChatSocketMount = () => {
  useChatSocket();
  return null;
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user } = useGetProfileQuery();
  const pathname = usePathname();

  return (
    <PermissionProvider>
      <OnboardingProvider>
        <SocketProvider>
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
                <Box key={pathname} mx="auto" className="page-transition">
                  {children}
                </Box>
              </ScrollArea>
            </Box>
          </Box>
          {/* {user?.id && <TelegramConnectModal userId={user.id} />} */}
          <ChatSocketMount />
          <CallOverlay />
          <AiChatWidget />
        </SocketProvider>
      </OnboardingProvider>
    </PermissionProvider>
  );
}
//