"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, ImageIcon, Video, Music, Archive, MoreVertical, Download, Share, Trash2, Eye } from "lucide-react"

const files = [
  {
    id: 1,
    name: "Project Proposal.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "2 hours ago",
    icon: FileText,
    color: "text-red-500",
  },
  {
    id: 2,
    name: "Dashboard Design.fig",
    type: "design",
    size: "15.8 MB",
    modified: "1 day ago",
    icon: ImageIcon,
    color: "text-purple-500",
  },
  {
    id: 3,
    name: "Demo Video.mp4",
    type: "video",
    size: "124.5 MB",
    modified: "3 days ago",
    icon: Video,
    color: "text-blue-500",
  },
  {
    id: 4,
    name: "Background Music.mp3",
    type: "audio",
    size: "8.2 MB",
    modified: "1 week ago",
    icon: Music,
    color: "text-green-500",
  },
  {
    id: 5,
    name: "Archive Files.zip",
    type: "archive",
    size: "45.1 MB",
    modified: "2 weeks ago",
    icon: Archive,
    color: "text-yellow-500",
  },
  {
    id: 6,
    name: "Meeting Notes.docx",
    type: "document",
    size: "1.2 MB",
    modified: "3 weeks ago",
    icon: FileText,
    color: "text-blue-600",
  },
]

export function FileGrid() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Recent Files</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="rounded-lg">
            {files.length} files
          </Badge>
          {selectedFiles.length > 0 && (
            <Badge variant="default" className="rounded-lg">
              {selectedFiles.length} selected
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <Card
            key={file.id}
            className={`rounded-xl border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${
              selectedFiles.includes(file.id) ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => toggleFileSelection(file.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-primary/10 ${file.color}`}>
                  <file.icon className="w-6 h-6" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem className="rounded-lg">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-card-foreground text-sm leading-tight line-clamp-2">{file.name}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{file.size}</span>
                  <span>{file.modified}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
