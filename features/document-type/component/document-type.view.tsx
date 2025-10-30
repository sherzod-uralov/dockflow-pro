"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { useSearchParams } from "next/navigation";
import { useGetDocumentTypeById } from "../hook/document-type.hook";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";
import { Copy, FileText, Info } from "lucide-react";

const DocumentTypeView = () => {
  const params = useSearchParams();
  const documentTypeId = params.get("documentTypeId") || "";

  const {
    data: documentType,
    isLoading,
    isFetching,
  } = useGetDocumentTypeById(documentTypeId);

  return (
    <SkeletonWrapper isLoading={isLoading || isFetching}>
      {documentType && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    {documentType.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Hujjat turi haqida batafsil ma'lumotlar
                  </CardDescription>
                </div>
                {documentType.id && (
                  <Badge
                    variant="outline"
                    className="font-mono cursor-pointer hover:bg-muted transition-colors"
                    onClick={() =>
                      handleCopyToClipboard(documentType.id, "ID nusxalandi")
                    }
                  >
                    ID: {documentType.id.slice(0, 8)}...
                    <Copy className="ml-1 h-3 w-3" />
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Nomi */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Nomi</span>
                </div>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                  {documentType.name}
                </p>
              </div>

              {documentType.description && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Tavsif</span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                      {documentType.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </SkeletonWrapper>
  );
};

export default DocumentTypeView;
