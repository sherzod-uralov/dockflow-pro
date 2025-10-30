"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "@/components/shared/layout/sidebar";
import { Header } from "@/components/shared/layout/header";
import { PermissionProvider } from "@/providers/permission-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PermissionProvider>
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}
