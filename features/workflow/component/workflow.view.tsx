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
  CheckCircle,
  XCircle,
  MessageSquare,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  FileEdit,
  Play,
} from "lucide-react";
import {
  WorkflowApiResponse,
  WorkflowStepApiResponse,
  WorkflowType,
  WorkflowStepStatus,
  getAvailableRollbackUsers,
  RollbackUser,
  validateAndExtractUserIds,
} from "../type/workflow.type";
import {
  useUpdateWorkflowStep,
  useCompleteWorkflowStep,
  useRejectWorkflowStep,
  useEnrichedRollbackUsers,
} from "../hook/workflow.hook";
import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetDocumentById } from "@/features/document";
import { createWorkflowDocumentEditUrl } from "@/utils/url-helper";
import { useRouter } from "next/navigation";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";

interface WorkflowViewProps {
  workflow: WorkflowApiResponse;
  onClose?: () => void;
}

interface RollbackHistoryItem {
  id: string;
  rejectedAt: string;
  rejectedBy: any;
  fromStepOrder: number;
  fromStepUser: any;
  toStepOrder: number;
  toStepUser: any;
  rejectionReason: string;
  comment?: string;
}

const WorkflowView = ({ workflow, onClose }: WorkflowViewProps) => {
  const router = useRouter();
  const updateStepMutation = useUpdateWorkflowStep();
  const completeMutation = useCompleteWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] =
    useState<WorkflowStepApiResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [comment, setComment] = useState("");
  const [enableRollback, setEnableRollback] = useState(false);
  const [selectedRollbackUserId, setSelectedRollbackUserId] = useState("");

  // Получаем информацию о текущем пользователе
  const { data: currentUserProfile, isLoading: isProfileLoading } =
    useGetProfileQuery();

  // Получаем полные данные документа с attachments
  const { data: documentData } = useGetDocumentById(
    workflow.document?.id || "",
  );

  // Примечание: Автоматический запуск первого шага происходит при создании workflow
  // через formToApiPayload в workflow.mapper.ts (первый шаг создается сразу в статусе IN_PROGRESS)

  const isLoading =
    updateStepMutation.isLoading ||
    completeMutation.isLoading ||
    rejectMutation.isLoading;

  // Функция для начала работы над шагом
  const handleStartStep = (stepId: string) => {
    updateStepMutation.mutate({
      id: stepId,
      data: {
        status: WorkflowStepStatus.IN_PROGRESS,
        startedAt: new Date().toISOString(),
      },
    });
  };

  // Функция для завершения шага
  const handleCompleteStep = (stepId: string) => {
    completeMutation.mutate(stepId);
  };

  // Функция для редактирования документа
  const handleEditDocument = () => {
    if (documentData?.attachments?.[0]?.id) {
      const editUrl = createWorkflowDocumentEditUrl(
        documentData.attachments[0].id,
      );
      router.push(editUrl);
    }
  };

  // Проверяем возможность редактирования документа
  const canEditDocument =
    documentData?.attachments && documentData.attachments.length > 0;

  // Валидация workflow steps
  const workflowValidation = useMemo(
    () => validateAndExtractUserIds(workflow),
    [workflow],
  );

  // Получить доступных пользователей для rollback (создатель документа + участники workflow)
  const availableRollbackUsers = useMemo(() => {
    if (!selectedStep) return [];

    const users: RollbackUser[] = [];

    // Добавляем создателя документа первым
    if (documentData?.createdBy) {
      users.push({
        userId: documentData.createdBy.id,
        userName: documentData.createdBy.fullname,
        stepOrder: 0, // Специальное значение для создателя
        userEmail: undefined,
        userRole: "Yaratuvchi",
        stepActionType: "CREATOR",
        stepStatus: "CREATOR",
      });
    }

    // Добавляем предыдущих участников workflow (без дубликатов создателя)
    const workflowUsers = getAvailableRollbackUsers(selectedStep, workflow);
    const filteredWorkflowUsers = workflowUsers.filter(
      (user) => user.userId !== documentData?.createdBy?.id,
    );

    users.push(...filteredWorkflowUsers);
    return users;
  }, [selectedStep, workflow, documentData]);

  // Загрузить расширенные данные о пользователях
  const { enrichedUsers, isLoading: isLoadingUsers } = useEnrichedRollbackUsers(
    availableRollbackUsers,
  );

  // Открыть диалог отклонения
  const handleRejectClick = (step: WorkflowStepApiResponse) => {
    // Проверка валидности workflow
    const validation = validateAndExtractUserIds(workflow);
    if (!validation.isValid) {
      alert(validation.error || "Нет доступных шагов workflow для отклонения");
      return;
    }

    setSelectedStep(step);
    setRejectionReason("");
    setComment("");
    setEnableRollback(true); // Включаем rollback по умолчанию
    // Устанавливаем создателя документа по умолчанию
    if (documentData?.createdBy?.id) {
      setSelectedRollbackUserId(documentData.createdBy.id);
    } else {
      setSelectedRollbackUserId("");
    }
    setRejectDialogOpen(true);
  };

  // Подтвердить отклонение
  const handleConfirmReject = () => {
    if (!selectedStep) return;

    // Валидация причины отклонения (минимум 10 символов)
    if (!rejectionReason.trim()) {
      alert("Iltimos, rad etish sababini kiriting");
      return;
    }
    if (rejectionReason.trim().length < 10) {
      alert("Rad etish sababi kamida 10 ta belgidan iborat bo'lishi kerak");
      return;
    }

    // Валидация выбора пользователя для rollback
    if (enableRollback && !selectedRollbackUserId) {
      alert("Iltimos, qaytarish uchun foydalanuvchini tanlang");
      return;
    }

    const payload: any = {
      rejectionReason: rejectionReason.trim(),
    };

    if (comment.trim()) {
      payload.comment = comment.trim();
    }

    if (enableRollback && selectedRollbackUserId) {
      payload.rollbackToUserId = selectedRollbackUserId;
    }

    rejectMutation.mutate(
      {
        id: selectedStep.id,
        data: payload,
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectionReason("");
          setComment("");
          setEnableRollback(false);
          setSelectedRollbackUserId("");
          setSelectedStep(null);
        },
      },
    );
  };

  // Получить историю rollback из workflow
  const getRollbackHistory = (): RollbackHistoryItem[] => {
    const rollbackHistory: RollbackHistoryItem[] = [];

    // Проходим по всем шагам
    workflow.workflowSteps.forEach((step) => {
      // Ищем действия типа REJECTED с metadata о rollback
      const rejectedActions =
        step.actions?.filter(
          (action: any) =>
            action.actionType === "REJECTED" &&
            action.metadata?.rollbackToUserId,
        ) || [];

      rejectedActions.forEach((rejectedAction: any) => {
        const metadata = rejectedAction.metadata;

        // Находим шаг, к которому произошел откат
        const targetStep = workflow.workflowSteps.find(
          (s) => s.id === metadata.rollbackToStepId,
        );

        rollbackHistory.push({
          id: rejectedAction.id,
          rejectedAt: rejectedAction.createdAt,
          rejectedBy: rejectedAction.performedBy,
          fromStepOrder: step.order,
          fromStepUser: step.assignedToUser,
          toStepOrder: metadata.rollbackToStepOrder,
          toStepUser: targetStep?.assignedToUser,
          rejectionReason: metadata.rejectionReason || "",
          comment: rejectedAction.comment,
        });
      });
    });

    // Сортируем по дате (новые первые)
    return rollbackHistory.sort((a, b) => {
      const dateA = new Date(a.rejectedAt).getTime();
      const dateB = new Date(b.rejectedAt).getTime();
      return dateB - dateA;
    });
  };

  const rollbackHistory = useMemo(() => getRollbackHistory(), [workflow]);

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
  ) => {
    // Фильтруем действия: показываем только действия текущего пользователя этого шага
    const filteredActions =
      step.actions?.filter(
        (action) => action.performedBy?.id === step.assignedToUser?.id,
      ) || [];

    // Проверяем, является ли текущий пользователь исполнителем этого шага
    const isCurrentUserAssigned =
      currentUserProfile?.id === step.assignedToUserId;

    return (
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
                  <AvatarImage
                    src=""
                    alt={step.assignedToUser?.username || ""}
                  />
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
                  <p className="font-medium">
                    {formatDateTime(step.startedAt)}
                  </p>
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

            {/* Actions History - только действия текущего пользователя */}
            {filteredActions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Amallar tarixi</span>
                </div>
                <div className="space-y-2">
                  {filteredActions.map((action) => (
                    <div
                      key={action.id}
                      className={`border rounded-md p-3 ${
                        action.actionType === "REJECTED"
                          ? "bg-red-50 border-red-200"
                          : action.actionType === "APPROVED"
                            ? "bg-green-50 border-green-200"
                            : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src=""
                              alt={action.performedBy?.username || ""}
                            />
                            <AvatarFallback className="text-xs">
                              {action.performedBy?.fullname
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">
                              {action.performedBy?.fullname || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(action.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            action.actionType === "REJECTED"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : action.actionType === "APPROVED"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                          }`}
                        >
                          {action.actionType === "REJECTED"
                            ? "Rad etildi"
                            : action.actionType === "APPROVED"
                              ? "Tasdiqlandi"
                              : action.actionType === "REVIEWED"
                                ? "Ko'rildi"
                                : action.actionType === "SIGNED"
                                  ? "Imzolandi"
                                  : "Xabarnoma"}
                        </Badge>
                      </div>
                      {action.comment && (
                        <p className="text-sm mt-2">{action.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isCurrentStep &&
              isCurrentUserAssigned &&
              step.status !== "COMPLETED" &&
              step.status !== "REJECTED" && (
                <div className="space-y-2 pt-2 border-t">
                  {/* Кнопка редактирования документа */}
                  {canEditDocument && (
                    <Button
                      size="sm"
                      onClick={handleEditDocument}
                      disabled={isLoading}
                      className="w-full"
                      variant="outline"
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      Hujjatni tahrirlash
                    </Button>
                  )}

                  {/* Основные действия - показываем только когда статус IN_PROGRESS */}
                  {step.status === "IN_PROGRESS" && (
                    <div className="flex gap-2">
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
                    </div>
                  )}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    );
  };

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

      {/* Rollback History Card - показываем если есть история */}
      {rollbackHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RotateCcw className="h-5 w-5 text-orange-500" />
              Qaytarishlar tarixi
            </CardTitle>
            <CardDescription>
              Jami {rollbackHistory.length} ta qaytarish amalga oshirilgan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rollbackHistory.map((rollback, index) => (
                <div
                  key={rollback.id}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <ArrowLeft className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={rollback.rejectedBy?.avatarUrl || ""}
                              alt={rollback.rejectedBy?.username || ""}
                            />
                            <AvatarFallback className="text-xs">
                              {rollback.rejectedBy?.fullname
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {rollback.rejectedBy?.fullname || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(rollback.rejectedAt)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-orange-100 text-orange-800 border-orange-300"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Qaytarildi
                        </Badge>
                      </div>

                      {/* Rollback Flow */}
                      <div className="bg-white rounded-md p-3 border border-orange-100">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="secondary" className="text-xs">
                              Bosqich {rollback.fromStepOrder}
                            </Badge>
                            <div className="text-xs">
                              <p className="font-medium">
                                {rollback.fromStepUser?.fullname}
                              </p>
                              <p className="text-muted-foreground">
                                @{rollback.fromStepUser?.username}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-orange-600">
                            <span className="text-xs font-medium">
                              qaytarildi
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </div>

                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="secondary" className="text-xs">
                              Bosqich {rollback.toStepOrder}
                            </Badge>
                            <div className="text-xs">
                              <p className="font-medium">
                                {rollback.toStepUser?.fullname}
                              </p>
                              <p className="text-muted-foreground">
                                @{rollback.toStepUser?.username}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rollback Reason */}
                      <div className="bg-white rounded-md p-3 border border-orange-100">
                        <p className="text-xs font-medium text-orange-800 mb-1">
                          Rad etish sababi:
                        </p>
                        <p className="text-sm text-gray-700">
                          {rollback.rejectionReason}
                        </p>
                        {rollback.comment &&
                          rollback.comment !== rollback.rejectionReason && (
                            <>
                              <p className="text-xs font-medium text-orange-800 mt-2 mb-1">
                                Qo'shimcha izoh:
                              </p>
                              <p className="text-sm text-gray-700">
                                {rollback.comment}
                              </p>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bosqichni rad etish</DialogTitle>
            <DialogDescription>
              Iltimos, rad etish sababini kiriting va qaytarish (rollback)
              parametrlarini sozlang.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Rejection Reason */}
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Rad etish sababi <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (kamida 10 ta belgi)
                </span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Rad etish sababini batafsil yozing (kamida 10 ta belgi)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                maxLength={500}
                minLength={10}
                required
                className={`resize-none ${
                  rejectionReason.length > 0 && rejectionReason.length < 10
                    ? "border-destructive"
                    : ""
                }`}
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs">
                {rejectionReason.length === 0 ? (
                  <p className="text-destructive">
                    Bu maydon majburiy (kamida 10 ta belgi)
                  </p>
                ) : rejectionReason.length < 10 ? (
                  <p className="text-destructive">
                    Yana {10 - rejectionReason.length} ta belgi kerak
                  </p>
                ) : (
                  <p className="text-green-600">✓ Yetarli</p>
                )}
                <p className="text-muted-foreground">
                  {rejectionReason.length}/500
                </p>
              </div>
            </div>

            {/* Additional Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Qo'shimcha izoh</Label>
              <Textarea
                id="comment"
                placeholder="Qo'shimcha ma'lumot kiriting..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                maxLength={1000}
                className="resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {comment.length}/1000
              </p>
            </div>

            {/* Rollback Option */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-rollback"
                  checked={enableRollback}
                  onCheckedChange={(checked) => {
                    setEnableRollback(checked === true);
                    if (!checked) {
                      setSelectedRollbackUserId("");
                    } else if (documentData?.createdBy?.id) {
                      // При включении чекбокса выбираем создателя по умолчанию
                      setSelectedRollbackUserId(documentData.createdBy.id);
                    }
                  }}
                  disabled={isLoading || isLoadingUsers}
                />
                <label
                  htmlFor="enable-rollback"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Hujjatni qaytarish (rollback)
                </label>
              </div>

              {!enableRollback && (
                <p className="text-xs text-muted-foreground pl-6">
                  ℹ️ Hujjatni qaytarmasdan rad etish
                </p>
              )}

              {enableRollback && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="rollback-user">
                    Qaytarish uchun foydalanuvchi{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  {isLoadingUsers ? (
                    <div className="text-sm text-muted-foreground">
                      Foydalanuvchilar yuklanmoqda...
                    </div>
                  ) : enrichedUsers.length === 0 ? (
                    <div className="text-sm text-destructive">
                      Avvalgi foydalanuvchilar topilmadi
                    </div>
                  ) : (
                    <>
                      <Select
                        value={selectedRollbackUserId}
                        onValueChange={setSelectedRollbackUserId}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="rollback-user">
                          <SelectValue placeholder="Foydalanuvchini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {enrichedUsers.map((user) => {
                            // Формируем детальную строку для пользователя
                            const isCreator = user.stepOrder === 0;
                            const userDisplay = isCreator
                              ? `🔖 ${user.userName} (Yaratuvchi)`
                              : [
                                  `Bosqich ${user.stepOrder}`,
                                  user.userName,
                                  user.username && `@${user.username}`,
                                  user.userRole && `- ${user.userRole}`,
                                ]
                                  .filter(Boolean)
                                  .join(" ");

                            return (
                              <SelectItem key={user.userId} value={user.userId}>
                                {userDisplay}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {documentData?.createdBy && (
                        <p className="text-xs text-muted-foreground">
                          💡 Sukut bo'yicha hujjat yaratuvchiga qaytariladi
                        </p>
                      )}
                    </>
                  )}
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Workflow ushbu foydalanuvchining bosqichidan qayta
                    boshlanadi
                  </p>
                </div>
              )}
            </div>

            {/* Ошибка валидации workflow */}
            {!workflowValidation.isValid && (
              <div className="text-sm text-destructive bg-red-50 p-3 rounded-md border border-red-200">
                ⚠️ {workflowValidation.error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
                setComment("");
                setEnableRollback(false);
                setSelectedRollbackUserId("");
                setSelectedStep(null);
              }}
              disabled={isLoading}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={
                isLoading ||
                !rejectionReason.trim() ||
                (enableRollback && !selectedRollbackUserId)
              }
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
