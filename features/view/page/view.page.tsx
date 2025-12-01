"use client";

import { useVerifyDocument } from "../hook/view.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileText,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Hash,
  Flag,
  Building2,
} from "lucide-react";
import { WorkflowStepStatus, WorkflowActionType, WorkflowStatus } from "@/features/workflow/type/workflow.type";
import { WorkflowStepInfo } from "../type/view.type";
import { da } from "date-fns/locale";

interface ViewPageProps {
  documentId: string;
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    APPROVED: { label: "Tasdiqlangan", variant: "default" },
    PUBLISHED: { label: "Chop etilgan", variant: "default" },
    PENDING: { label: "Kutilmoqda", variant: "secondary" },
    DRAFT: { label: "Qoralama", variant: "outline" },
    REJECTED: { label: "Rad etilgan", variant: "destructive" },
    ARCHIVED: { label: "Arxivlangan", variant: "secondary" },
  };
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const priorityConfig: Record<string, { label: string; className: string }> = {
    HIGH: { label: "Yuqori", className: "bg-red-100 text-red-800 border-red-200" },
    MEDIUM: { label: "O'rtacha", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    LOW: { label: "Past", className: "bg-green-100 text-green-800 border-green-200" },
  };
  const config = priorityConfig[priority] || { label: priority, className: "" };
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

const getStepStatusIcon = (status: WorkflowStepStatus, isRejected: boolean) => {
  if (isRejected) {
    return <XCircle className="h-5 w-5 text-red-500" />;
  }
  switch (status) {
    case WorkflowStepStatus.COMPLETED:
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case WorkflowStepStatus.IN_PROGRESS:
    case WorkflowStepStatus.PENDING:
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case WorkflowStepStatus.NOT_STARTED:
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    case WorkflowStepStatus.REJECTED:
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
  }
};

const getActionTypeLabel = (actionType: WorkflowActionType) => {
  const labels: Record<WorkflowActionType, string> = {
    [WorkflowActionType.APPROVAL]: "Tasdiqlash",
    [WorkflowActionType.REVIEW]: "Ko'rib chiqish",
    [WorkflowActionType.SIGN]: "Imzolash",
    [WorkflowActionType.QR_CODE]: "QR kod qo'shish",
    [WorkflowActionType.ACKNOWLEDGE]: "Tanishish",
  };
  return labels[actionType] || actionType;
};

const getStepStatusLabel = (status: WorkflowStepStatus, isRejected: boolean) => {
  if (isRejected) return "Rad etilgan";
  const labels: Record<WorkflowStepStatus, string> = {
    [WorkflowStepStatus.COMPLETED]: "Bajarilgan",
    [WorkflowStepStatus.IN_PROGRESS]: "Jarayonda",
    [WorkflowStepStatus.PENDING]: "Kutilmoqda",
    [WorkflowStepStatus.NOT_STARTED]: "Boshlanmagan",
    [WorkflowStepStatus.REJECTED]: "Rad etilgan",
  };
  return labels[status] || status;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const WorkflowStepCard = ({ step, isLast }: { step: WorkflowStepInfo; isLast: boolean }) => {
  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-[22px] top-[44px] h-[calc(100%-20px)] w-0.5 bg-gray-200" />
      )}
      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-1">
          {getStepStatusIcon(step.status, step.isRejected)}
        </div>
        <div className="flex-1 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {step.order}. {getActionTypeLabel(step.actionType)}
            </span>
            <Badge variant="outline" className="text-xs">
              {getStepStatusLabel(step.status, step.isRejected)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{step.assignedToUser?.fullname || "Noma'lum"}</span>
              {step.assignedToUser?.username && (
                <span className="text-xs">(@{step.assignedToUser.username})</span>
              )}
            </div>
            {step.completedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Bajarilgan: {formatDate(step.completedAt)}</span>
              </div>
            )}
            {step.isRejected && step.rejectionReason && (
              <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200">
                <p className="text-red-700 text-sm">
                  <strong>Rad etilish sababi:</strong> {step.rejectionReason}
                </p>
              </div>
            )}
            {step.actions && step.actions.length > 0 && (
              <div className="mt-2 space-y-1">
                {step.actions.map((action) => (
                  <div key={action.id} className="text-xs bg-gray-50 p-2 rounded">
                    <span className="font-medium">{action.performedBy?.fullname}</span>
                    {action.comment && <span className="ml-2">- {action.comment}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ViewPage({ documentId }: ViewPageProps) {
  const { data, isLoading, isError, error } = useVerifyDocument(documentId);

  console.log(data)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
            <Clock className="h-5 w-5 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Ish jarayoni hali yakunlanmagan</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Hujjat ish jarayoni hali tugallanmagan. Iltimos, yakunlanishini kuting va qayta urinib ko'ring.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Hujjat topilmadi</AlertTitle>
            <AlertDescription>
              Berilgan ID bo'yicha hujjat topilmadi.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isWorkflowComplete = data.workflow?.status === WorkflowStatus.COMPLETED;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hujjatni tekshirish</h1>
            <p className="text-muted-foreground">Hujjat va ish jarayoni ma'lumotlari</p>
          </div>
        </div>

        {/* Verification Status */}
        {isWorkflowComplete && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Hujjat tasdiqlangan</AlertTitle>
            <AlertDescription className="text-green-700">
              Ushbu hujjat barcha ish jarayonlarini muvaffaqiyatli o'tgan va tasdiqlangan.
            </AlertDescription>
          </Alert>
        )}

        {/* Document Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Hujjat ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Sarlavha</label>
                  <p className="font-medium">{data.title}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tavsif</label>
                  <p className="text-sm">{data.description || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Hujjat raqami:</span>
                  <span className="font-mono font-medium">{data.documentNumber}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(data.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Muhimlik</label>
                    <div className="mt-1">{getPriorityBadge(data.priority)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Hujjat turi:</span>
                  <span className="font-medium">{data.documentType?.name || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Yaratuvchi:</span>
                  <span className="font-medium">{data.createdBy?.fullname || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Yaratilgan:</span>
                  <span className="text-sm">{formatDate(data.createdAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Info */}
        {data.workflow && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ish jarayoni
                </CardTitle>
                <Badge variant={data.workflow.status === WorkflowStatus.COMPLETED ? "default" : "secondary"}>
                  {data.workflow.status === WorkflowStatus.COMPLETED
                    ? "Yakunlangan"
                    : data.workflow.status === WorkflowStatus.ACTIVE
                      ? "Faol"
                      : data.workflow.status === WorkflowStatus.CANCELLED
                        ? "Bekor qilingan"
                        : "Qoralama"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {data.workflow.workflowSteps && data.workflow.workflowSteps.length > 0 ? (
                <div className="space-y-0">
                  {data.workflow.workflowSteps
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <WorkflowStepCard
                        key={step.id}
                        step={step}
                        isLast={index === data.workflow!.workflowSteps.length - 1}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Ish jarayoni qadamlari mavjud emas
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {!data.workflow && (
          <Alert>
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Ish jarayoni mavjud emas</AlertTitle>
            <AlertDescription>
              Ushbu hujjat uchun ish jarayoni tayinlanmagan.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
