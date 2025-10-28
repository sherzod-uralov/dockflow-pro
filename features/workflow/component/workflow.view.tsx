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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { formatDateTime, formatDate } from "@/lib/date-utils";
import {
  Copy,
  FileText,
  CheckCircle2,
  FileSearch,
  FileSignature,
  Bell,
  Clock,
  User,
  AlertCircle,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  WorkflowApiResponse,
  WorkflowStepApiResponse,
} from "../type/workflow.type";
import {
  useUpdateWorkflowStep,
  useCompleteWorkflowStep,
  useRejectWorkflowStep,
} from "../hook/workflow.hook";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface WorkflowViewProps {
  workflow: WorkflowApiResponse;
  onClose?: () => void;
}

const WorkflowView = ({ workflow, onClose }: WorkflowViewProps) => {
  const updateStepMutation = useUpdateWorkflowStep();
  const completeMutation = useCompleteWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] =
    useState<WorkflowStepApiResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const isLoading =
    updateStepMutation.isLoading ||
    completeMutation.isLoading ||
    rejectMutation.isLoading;

  // Функция для начала работы над шагом
  const handleStartStep = (stepId: string) => {
    updateStepMutation.mutate({
      id: stepId,
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date().toISOString(),
      },
    });
  };

  // Функция для завершения шага
  const handleCompleteStep = (stepId: string) => {
    completeMutation.mutate(stepId);
  };

  // Открыть диалог отклонения
  const handleRejectClick = (step: WorkflowStepApiResponse) => {
    setSelectedStep(step);
    setRejectDialogOpen(true);
  };

  // Подтвердить отклонение
  const handleConfirmReject = () => {
    if (!selectedStep) return;

    rejectMutation.mutate(
      {
        id: selectedStep.id,
        data: rejectionReason.trim() ? { reason: rejectionReason.trim() } : undefined,
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectionReason("");
          setSelectedStep(null);
        },
      },
    );
  };

  // Функция для получения badge статуса workflow
  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      ACTIVE: { variant: "default", label: "Faol" },
      COMPLETED: { variant: "secondary", label: "Tugallangan" },
      CANCELLED: { variant: "destructive", label: "Bekor qilingan" },
      DRAFT: { variant: "outline", label: "Qoralama" },
    };

    const config = variants[status] || variants.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Функция для получения badge статуса шага
  const getStepStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; icon: any }> =
      {
        NOT_STARTED: {
          color: "bg-slate-100 text-slate-800 border-slate-300",
          label: "Boshlanmagan",
          icon: Clock,
        },
        PENDING: {
          color: "bg-gray-100 text-gray-800 border-gray-300",
          label: "Kutilmoqda",
          icon: Clock,
        },
        IN_PROGRESS: {
          color: "bg-blue-100 text-blue-800 border-blue-300",
          label: "Jarayonda",
          icon: Play,
        },
        COMPLETED: {
          color: "bg-green-100 text-green-800 border-green-300",
          label: "Tugallangan",
          icon: CheckCircle,
        },
        REJECTED: {
          color: "bg-red-100 text-red-800 border-red-300",
          label: "Rad etilgan",
          icon: XCircle,
        },
      };

    const item = config[status] || config.NOT_STARTED;
    const Icon = item.icon;

    return (
      <Badge
        variant="outline"
        className={`${item.color} flex items-center gap-1.5 w-fit`}
      >
        <Icon className="h-3 w-3" />
        {item.label}
      </Badge>
    );
  };

  // Функция для получения badge типа действия
  const getActionTypeBadge = (actionType: string) => {
    const config: Record<string, { label: string; icon: any; color: string }> =
      {
        APPROVAL: {
          label: "Tasdiqlash",
          icon: CheckCircle2,
          color: "bg-green-100 text-green-800 border-green-300",
        },
        REVIEW: {
          label: "Ko'rib chiqish",
          icon: FileSearch,
          color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        SIGN: {
          label: "Imzolash",
          icon: FileSignature,
          color: "bg-purple-100 text-purple-800 border-purple-300",
        },
        NOTIFY: {
          label: "Xabarnoma",
          icon: Bell,
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        },
      };

    const item = config[actionType] || config.APPROVAL;
    const Icon = item.icon;

    return (
      <Badge
        variant="outline"
        className={`${item.color} flex items-center gap-1.5 w-fit`}
      >
        <Icon className="h-3 w-3" />
        {item.label}
      </Badge>
    );
  };

  // Рендер одного шага
  const renderStep = (
    step: WorkflowStepApiResponse,
    isCurrentStep: boolean,
  ) => (
    <div
      key={step.id}
      className={`relative pl-8 pb-6 ${isCurrentStep ? "border-l-2 border-primary" : "border-l-2 border-gray-200"}`}
    >
      {/* Круг на линии */}
      <div
        className={`absolute left-0 top-0 -translate-x-1/2 h-4 w-4 rounded-full border-2 ${
          isCurrentStep
            ? "bg-primary border-primary"
            : step.status === "COMPLETED"
              ? "bg-green-500 border-green-500"
              : step.status === "REJECTED"
                ? "bg-red-500 border-red-500"
                : "bg-gray-300 border-gray-300"
        }`}
      />

      <Card className={isCurrentStep ? "border-primary shadow-md" : ""}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                Bosqich {step.order}
              </span>
              {isCurrentStep && (
                <Badge variant="default" className="text-xs">
                  Joriy
                </Badge>
              )}
            </div>
            {getStepStatusBadge(step.status)}
          </div>

          {/* Mas'ul shaxs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Mas'ul shaxs</span>
            </div>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={step.assignedToUser?.username || ""} />
                <AvatarFallback>
                  {step.assignedToUser?.fullname
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "??"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {step.assignedToUser?.fullname || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{step.assignedToUser?.username || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {step.startedAt && (
              <div>
                <p className="text-muted-foreground text-xs">Boshlangan</p>
                <p className="font-medium">{formatDateTime(step.startedAt)}</p>
              </div>
            )}
            {step.completedAt && (
              <div>
                <p className="text-muted-foreground text-xs">Tugallangan</p>
                <p className="font-medium">
                  {formatDateTime(step.completedAt)}
                </p>
              </div>
            )}
            {step.dueDate && (
              <div>
                <p className="text-muted-foreground text-xs">Muddat</p>
                <p className="font-medium">{formatDate(step.dueDate)}</p>
              </div>
            )}
          </div>

          {/* Rejection Info */}
          {step.isRejected && step.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Rad etilgan sabab:
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {step.rejectionReason}
                  </p>
                  {step.rejectedAt && (
                    <p className="text-xs text-red-600 mt-1">
                      {formatDateTime(step.rejectedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isCurrentStep &&
            step.status !== "COMPLETED" &&
            step.status !== "REJECTED" && (
              <div className="flex gap-2 pt-2 border-t">
                {(step.status === "NOT_STARTED" || step.status === "PENDING") && (
                  <Button
                    size="sm"
                    onClick={() => handleStartStep(step.id)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isLoading ? "Yuklanmoqda..." : "Boshlash"}
                  </Button>
                )}
                {step.status === "IN_PROGRESS" && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleCompleteStep(step.id)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isLoading ? "Yuklanmoqda..." : "Tasdiqlash"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectClick(step)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rad etish
                    </Button>
                  </>
                )}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                {workflow.document.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Workflow haqida batafsil ma'lumotlar
              </CardDescription>
            </div>
            {workflow.id && (
              <Badge
                variant="outline"
                className="font-mono cursor-pointer hover:bg-muted transition-colors"
                onClick={() =>
                  handleCopyToClipboard(workflow.id, "ID nusxalandi")
                }
              >
                ID: {workflow.id.slice(0, 8)}...
                <Copy className="ml-1 h-3 w-3" />
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Document Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Hujjat ma'lumotlari</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-md space-y-1">
              <p className="text-sm">
                <span className="font-medium">Raqam:</span>{" "}
                {workflow.document.documentNumber}
              </p>
              <p className="text-sm">
                <span className="font-medium">Versiya:</span>{" "}
                {workflow.document.version}
              </p>
              {workflow.document.description && (
                <p className="text-sm">
                  <span className="font-medium">Tavsif:</span>{" "}
                  {workflow.document.description}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Workflow Status and Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Holat</p>
              {getStatusBadge(workflow.status)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Amal turi</p>
              {workflow.workflowSteps[0] &&
                getActionTypeBadge(workflow.workflowSteps[0].actionType)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Jarayon</p>
              <span className="font-mono font-medium">
                {workflow.currentStepOrder} / {workflow.workflowSteps.length}
              </span>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Yaratilgan</p>
              <p className="font-medium">
                {formatDateTime(workflow.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Yangilangan</p>
              <p className="font-medium">
                {formatDateTime(workflow.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow bosqichlari</CardTitle>
          <CardDescription>
            Jami {workflow.workflowSteps.length} ta bosqich
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {workflow.workflowSteps
              .sort((a, b) => a.order - b.order)
              .map((step) =>
                renderStep(step, step.order === workflow.currentStepOrder),
              )}
          </div>
        </CardContent>
      </Card>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Yopish
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bosqichni rad etish</DialogTitle>
            <DialogDescription>
              Iltimos, rad etish sababini kiriting (ixtiyoriy).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rad etish sababi</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Sabab yozing..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedStep(null);
              }}
              disabled={isLoading}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isLoading}
            >
              {isLoading ? "Rad etilmoqda..." : "Rad etish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowView;
