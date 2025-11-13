"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetDocumentById } from "@/features/document";
import { Button } from "@/components/ui/button";
import { FC } from "react";

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

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    PUBLISHED: {
      label: "Nashr qilingan",
      className:
        "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
      icon: CheckCircle2,
    },
    DRAFT: {
      label: "Qoralama",
      className:
        "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200",
      icon: Clock,
    },
    PENDING: {
      label: "Kutilmoqda",
      className: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
      icon: Clock,
    },
  };

  const currentConfig = config[status as keyof typeof config] || {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
    icon: AlertCircle,
  };

  const Icon = currentConfig.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "transition-all duration-200 flex items-center gap-1.5",
        currentConfig.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {currentConfig.label}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = {
    HIGH: {
      label: "Yuqori",
      className: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
    },
    MEDIUM: {
      label: "O'rta",
      className:
        "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
    },
    LOW: {
      label: "Past",
      className: "bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200",
    },
  };

  const currentConfig = config[priority as keyof typeof config] || {
    label: priority,
    className: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn("transition-all duration-200", currentConfig.className)}
    >
      {currentConfig.label}
    </Badge>
  );
};

const DocumentView: FC<{ documentId: string }> = ({ documentId }) => {
  const router = useRouter();

  const { data, isLoading } = useGetDocumentById(documentId);

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  if (!data && isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Ma'lumot yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-xl font-semibold">{data.title}</h3>
        {data.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {data.description}
          </p>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
        <div className="group">
          <p className="text-xs text-muted-foreground mb-1.5 transition-colors group-hover:text-foreground">
            Hujjat raqami
          </p>
          <p className="font-medium">{data.documentNumber || "—"}</p>
        </div>

        <div className="group">
          <p className="text-xs text-muted-foreground mb-1.5 transition-colors group-hover:text-foreground">
            Hujjat turi
          </p>
          <p className="font-medium">{data.documentType?.name || "—"}</p>
        </div>

        <div className="group">
          <p className="text-xs text-muted-foreground mb-1.5 transition-colors group-hover:text-foreground">
            Jurnal
          </p>
          <p className="font-medium">{data.journal?.name || "—"}</p>
        </div>

        <div className="group">
          <p className="text-xs text-muted-foreground mb-1.5 transition-colors group-hover:text-foreground">
            Holati
          </p>
          <StatusBadge status={data.status} />
        </div>

        <div className="group">
          <p className="text-xs text-muted-foreground mb-1.5 transition-colors group-hover:text-foreground">
            Muhimlik
          </p>
          <PriorityBadge priority={data.priority} />
        </div>

        <div className="group">
          <p className="text-xs text-muted-foreground mb-1.5 transition-colors group-hover:text-foreground">
            Versiya
          </p>
          <Badge
            variant="outline"
            className="font-mono bg-indigo-50 text-indigo-700 border-indigo-300"
          >
            v{data.versions || 0}
          </Badge>
        </div>
      </div>
      <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
          <div className="p-2 rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Yaratuvchi</p>
            <p className="font-medium">{data.createdBy?.fullname || "—"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
          <div className="p-2 rounded-full bg-green-100">
            <Calendar className="h-4 w-4 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              Yaratilgan sana
            </p>
            <p className="text-sm">{formatDate(data.createdAt)}</p>
          </div>
        </div>

        {data.updatedAtBy && (
          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="p-2 rounded-full bg-purple-100">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">
                Oxirgi o'zgartiruvchi
              </p>
              <p className="font-medium">{data.updatedAtBy?.fullname || "—"}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
          <div className="p-2 rounded-full bg-amber-100">
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              Yangilangan sana
            </p>
            <p className="text-sm">{formatDate(data.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {data.attachments && data.attachments.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Biriktirilgan fayllar</p>
            <Badge variant="secondary" className="ml-auto text-text-on-dark">
              {data.attachments.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {data.attachments.map((file: any, index: number) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-4 p-3 border rounded-lg transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {file.fileName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="text-text-on-dark"
                    onClick={() => router.push(`/pdf/${documentId}`)}
                  >
                    hujjatni tahrirlash
                  </Button>
                  <button
                    onClick={() => handleDownload(file.fileUrl)}
                    className="flex items-center gap-2 hover:text-text-on-dark px-3 py-1.5 text-sm border rounded-md hover:bg-primary hover:border-primary transition-all duration-200 flex-shrink-0 group/btn"
                  >
                    <Download className="h-4 w-4 group-hover/btn:animate-bounce" />
                    Yuklab olish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentView;
