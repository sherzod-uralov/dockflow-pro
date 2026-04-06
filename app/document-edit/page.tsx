"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useGetWopiToken,
  useSaveAnnotations,
} from "@/features/document-editor";
import {
  getEditorPermissions,
  getPermissionDescription,
  getSaveButtonText,
} from "@/features/document-editor/utils/permission.utils";
import { Button } from "@mantine/core";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Lock, Edit3 } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("id") || "";
  const documentId = searchParams.get("documentId") || "";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [xfdfContent] = useState<string>("");

  const {
    data: wopiData
  } = useGetWopiToken(fileId, documentId);
  const saveAnnotationsMutation = useSaveAnnotations();

  const permissions = wopiData?.actionType
    ? getEditorPermissions(wopiData.actionType)
    : null;

  useEffect(() => {
    if (wopiData && iframeRef.current) {
      const COLLABORA_HOST = process.env.NEXT_PUBLIC_COLLABORA_URL || "https://office.docverse.uz";
      const API_BASE = (process.env.NEXT_PUBLIC_SERVER_URL || "https://api.docverse.uz/api/v1").replace(/\/+$/, "");
      const WOPI_SRC = `${API_BASE}/wopi/files/${fileId}`;

      const collaboraUrl = new URL(`${COLLABORA_HOST}/browser/dist/cool.html`);
      collaboraUrl.searchParams.set("WOPISrc", WOPI_SRC);
      collaboraUrl.searchParams.set("access_token", wopiData.accessToken);

      iframeRef.current.src = collaboraUrl.toString();
    }
  }, [wopiData, fileId]);

  const handleSaveAnnotations = () => {
    if (!documentId || !xfdfContent) {
      alert("Izohlar topilmadi");
      return;
    }

    saveAnnotationsMutation.mutate({
      documentId,
      xfdfContent,
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hover:text-text-on-dark" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>

            {wopiData?.actionType && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  {permissions?.canEdit ? (
                    <Edit3 className="mr-1 h-3 w-3" />
                  ) : (
                    <Lock className="mr-1 h-3 w-3" />
                  )}
                  {getSaveButtonText(wopiData.actionType)}
                </Badge>
                {permissions?.canViewOnly && (
                  <span className="text-xs text-muted-foreground">
                    (Faqat ko'rish)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {permissions?.canSaveAnnotations && (
              <Button
                onClick={handleSaveAnnotations}
                disabled={saveAnnotationsMutation.isLoading}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveAnnotationsMutation.isLoading
                  ? "Saqlanmoqda..."
                  : "Izohlarni saqlash"}
              </Button>
            )}
          </div>
        </div>

        {/* Permission Info */}
        {wopiData?.actionType && (
          <div className="px-4 pb-3 max-w-screen-2xl mx-auto">
            <Alert className="py-2">
              <AlertDescription className="text-sm">
                {getPermissionDescription(wopiData.actionType)}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Collabora Online Editor"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};

export default Page;
