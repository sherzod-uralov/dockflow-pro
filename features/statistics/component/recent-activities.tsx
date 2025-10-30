"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  User,
  Workflow,
  CheckSquare,
  Clock,
} from "lucide-react";
import type { RecentActivity } from "../type/statistics.type";

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const activityIcons = {
  document: FileText,
  user: User,
  workflow: Workflow,
  task: CheckSquare,
};

const activityColors = {
  document: "text-blue-500 bg-blue-50",
  user: "text-green-500 bg-green-50",
  workflow: "text-purple-500 bg-purple-50",
  task: "text-orange-500 bg-orange-50",
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} kun oldin`;
    if (hours > 0) return `${hours} soat oldin`;
    if (minutes > 0) return `${minutes} daqiqa oldin`;
    return "Hozir";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>So'nggi Faoliyat</CardTitle>
        <CardDescription>Tizimda bo'lgan oxirgi o'zgarishlar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Hozircha faoliyat yo'q
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(activity.timestamp)}</span>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <span>{activity.user}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
