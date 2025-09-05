"use client"

import { useState } from "react"
import { Sidebar } from "@/components/shared/layout/sidebar"
import { Header } from "@/components/shared/layout/header"
import { FileGrid } from "@/components/shared/file-grid"
import { FileStats } from "@/components/shared/file-stats"

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">File Manager</h1>
                <p className="text-muted-foreground mt-1">Manage and organize your files efficiently</p>
              </div>
            </div>

            <FileStats />
            <FileGrid />
          </div>
        </main>
      </div>
    </div>
  )
}
