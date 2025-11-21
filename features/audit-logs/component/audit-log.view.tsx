// audit-log.view.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";
import { Copy, User, Calendar, Globe, FileText, Activity } from "lucide-react";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { useGetAuditLogById } from "@/features/audit-logs/hook/audit-log.hook";
import { format } from "date-fns";
import { AuditAction } from "../type/audit-log.type";

const AuditLogView = () => {
  const params = useSearchParams();
  const auditLogId = params.get("auditLogId") || "";

  const { data, isLoading, isFetching } = useGetAuditLogById(auditLogId);

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return "bg-green-100 text-green-700 border-green-200";
      case AuditAction.UPDATE:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case AuditAction.DELETE:
        return "bg-red-100 text-red-700 border-red-200";
      case AuditAction.RESTORE:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case AuditAction.LOGIN:
        return "bg-purple-100 text-purple-700 border-purple-200";
      case AuditAction.LOGOUT:
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <SkeletonWrapper isLoading={isLoading || isFetching}>
      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="h-5 w-5 text-primary" />
                    Audit Log #{data.id.slice(0, 8)}...
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Tizim harakati haqida batafsil ma'lumotlar
                  </CardDescription>
                </div>
                {data.id && (
                  <Badge
                    variant="outline"
                    className="font-mono cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleCopyToClipboard(data.id!, "ID")}
                  >
                    ID: {data.id.slice(0, 8)}...
                    <Copy className="ml-1 h-3 w-3" />
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Entity</span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">{data.entity}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Action</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={getActionColor(data.action)}
                    >
                      {data.action}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Vaqt</span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md">
                      <div className="text-sm">
                        {format(
                          new Date(data.performedAt),
                          "dd.MM.yyyy HH:mm:ss",
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Foydalanuvchi</span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md space-y-1">
                      <div className="text-sm font-medium">
                        {data.performedBy?.fullname}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{data.performedBy?.username}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">IP Address</span>
                    </div>
                    <div
                      className="p-3 bg-blue-50 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
                      onClick={() =>
                        handleCopyToClipboard(data.ipAddress, "IP Address")
                      }
                    >
                      <code className="text-sm font-mono text-blue-700">
                        {data.ipAddress}
                      </code>
                      <Copy className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {data.entityId && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Entity ID</span>
                    </div>
                    <div
                      className="p-3 bg-muted/30 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                      onClick={() =>
                        handleCopyToClipboard(data.entityId, "Entity ID")
                      }
                    >
                      <code className="text-sm font-mono">{data.entityId}</code>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </>
              )}

              {data.changes && Object.keys(data.changes).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">O'zgarishlar</span>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(data.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              className="hover:text-text-on-dark"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Yopish
            </Button>
          </div>
        </div>
      )}
    </SkeletonWrapper>
  );
};

export default AuditLogView;
