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
import { Copy, Key, FileText, Package } from "lucide-react";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { useGetPermissionById } from "@/features/admin/permissions/hook/permission.hook";

const PermissionView = () => {
  const params = useSearchParams();
  const permissionId = params.get("permissionId") || "";

  const { data, isLoading, isFetching } = useGetPermissionById(permissionId);

  return (
    <SkeletonWrapper isLoading={isLoading || isFetching}>
      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Key className="h-5 w-5 text-primary" />
                    {data.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Ruxsat haqida batafsil ma'lumotlar
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
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Nomi</span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md">
                      <span className="text-sm">{data.name}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Kalit</span>
                    </div>
                    <div
                      className="p-3 bg-blue-50 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
                      onClick={() => handleCopyToClipboard(data.key, "Kalit")}
                    >
                      <code className="text-sm font-mono text-blue-700">
                        {data.key}
                      </code>
                      <Copy className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Modul</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 px-3 py-1 capitalize"
                    >
                      {data.module}
                    </Badge>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Tavsif</span>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm leading-relaxed">
                    {data.description || "Tavsif kiritilmagan"}
                  </p>
                </div>
              </div>

              <Separator />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Yopish
            </Button>
          </div>
        </div>
      )}
    </SkeletonWrapper>
  );
};

export default PermissionView;
