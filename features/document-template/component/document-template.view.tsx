"use client";

import { useGetDocumentTemplateById } from "../hook/document-template.hook";
import { useSearchParams } from "next/navigation";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";

// Fayl hajmini formatlash
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Sanani formatlash
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Ma'lumot yo'q";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Ma'lumot yo'q";
    }

    return new Intl.DateTimeFormat("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    return "Ma'lumot yo'q";
  }
};

const DocumentTemplateView = () => {
  const params = useSearchParams();
  const templateId = params.get("templateId") || "";

  const { data, isLoading, isFetching } =
    useGetDocumentTemplateById(templateId);

  const handleDownload = () => {
    if (data?.templateFile?.fileUrl) {
      window.open(data.templateFile.fileUrl, "_blank");
    }
  };

  return (
    <SkeletonWrapper isLoading={isLoading || isFetching}>
      {data && (
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold">{data.name}</h3>
            {data.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.description}
              </p>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hujjat turi</p>
              <p className="font-medium">{data.documentType?.name || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Holati</p>
              <Badge variant={data.isActive ? "default" : "secondary"}>
                {data.isActive ? "Faol" : "Nofaol"}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Ommaviy</p>
              <Badge variant={data.isPublic ? "default" : "outline"}>
                {data.isPublic ? "Ha" : "Yo'q"}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Yaratilgan</p>
              <p className="text-sm">{formatDate(data.createdAt)}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Yangilangan</p>
              <p className="text-sm">{formatDate(data.updatedAt)}</p>
            </div>
          </div>

          {/* File Info */}
          {data.templateFile && (
            <div className="border-t pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {data.templateFile.fileName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatFileSize(data.templateFile.fileSize)} •{" "}
                      {data.templateFile.mimeType.includes("word")
                        ? "Word"
                        : data.templateFile.mimeType
                            .split("/")
                            .pop()
                            ?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="flex items-center hover:text-text-on-dark gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors flex-shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Yuklab olish
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </SkeletonWrapper>
  );
};

export default DocumentTemplateView;
