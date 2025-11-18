"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetWopiToken, useSaveAnnotations } from "@/features/document-editor";
import { getEditorPermissions, getPermissionDescription, getSaveButtonText } from "@/features/document-editor/utils/permission.utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckCircle, Lock, Edit3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("id") || "";
  const documentId = searchParams.get("documentId") || "";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [xfdfContent, setXfdfContent] = useState<string>("");

  const { data: wopiData, isLoading, error } = useGetWopiToken(fileId, documentId);
  const saveAnnotationsMutation = useSaveAnnotations();

  const permissions = wopiData?.actionType
    ? getEditorPermissions(wopiData.actionType)
    : null;

  console.log("WOPI Data:", wopiData);
  console.log("Permissions:", permissions);

  useEffect(() => {
    if (wopiData && iframeRef.current) {
      const WOPI_SRC = `${wopiData.wopiSrc}?access_token=${wopiData.accessToken}`;
      const COLLABORA_URL = `https://office.nordicuniversity.org/browser/e808afa229/cool.html?WOPISrc=${encodeURIComponent(WOPI_SRC)}`;

      iframeRef.current.src = COLLABORA_URL;
    }
  }, [wopiData]);

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

  if (!fileId) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Alert className="max-w-md">
          <AlertDescription>
            Fayl ID topilmadi. URL'da id parametri bo'lishi kerak.
          </AlertDescription>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Button>
        </Alert>
      </div>
    );
  }

  if (!documentId) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Alert className="max-w-md">
          <AlertDescription>
            Hujjat ID topilmadi. URL'da documentId parametri bo'lishi kerak.
          </AlertDescription>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Button>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Header Skeleton */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Editor Skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Hujjat yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.
            <br />
            <span className="text-sm text-muted-foreground">
              {(error as any)?.response?.data?.message || "Noma'lum xatolik"}
            </span>
          </AlertDescription>
          <Button onClick={handleGoBack} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
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
