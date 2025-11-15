"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  FileSearch,
  FileSignature,
  Bell,
  Clock,
  User,
  FileText,
  FileEdit,
  AlertCircle,
  TrendingUp,
  Minus,
  TrendingDown,
  Layers,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import type { WorkflowStepApiResponse } from "@/features/workflow";
import {
  useCompleteWorkflowStep,
  useRejectWorkflowStep,
  useGetWorkflowById,
} from "@/features/workflow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/date-utils";
import { useGetUserByIdQuery } from "@/features/admin/admin-users/hook/user.hook";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDocumentById } from "@/features/document";
import {
  createWorkflowDocumentEditUrl,
  createWorkflowDocumentViewUrl,
} from "@/utils/url-helper";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";

interface TaskCardProps {
  task: WorkflowStepApiResponse & {
    workflow?: {
      id: string;
      documentId: string;
      currentStepOrder: number;
      status: string;
      document?: {
        id: string;
        title: string;
        documentNumber: string;
        description?: string;
        status: string;
        priority?: string;
      };
    };
  };
  onActionComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onCardClick?: () => void;
  showActions?: boolean;
}

const TaskCard = ({
  task,
  onActionComplete,
  onEdit,
  onDelete,
  onView,
  onCardClick,
  showActions = true,
}: TaskCardProps) => {
  const router = useRouter();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [comment, setComment] = useState("");
  const [rollbackToUserId, setRollbackToUserId] = useState<string>("");

  const completeMutation = useCompleteWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();

  // Получаем информацию о текущем пользователе
  const { data: currentUserProfile, isLoading: isProfileLoading } =
    useGetProfileQuery();

  const { data: userData, isLoading: isUserLoading } = useGetUserByIdQuery(
    task.assignedToUserId,
  );

  const { data: workflowData, isLoading: isWorkflowLoading } =
    useGetWorkflowById(task.workflowId);

  const documentId = task.workflow?.document?.id || "";
  const { data: documentData } = useGetDocumentById(documentId);

  // Получаем список пользователей для отклонения (создатель документа + участники workflow)
  const availableUsersForRejection = () => {
    const users: Array<{
      id: string;
      name: string;
      username: string;
      stepOrder?: number;
      isCreator?: boolean;
    }> = [];

    // Добавляем создателя документа первым
    if (documentData?.createdBy) {
      users.push({
        id: documentData.createdBy.id,
        name: documentData.createdBy.fullname,
        username: "Yaratuvchi",
        isCreator: true,
      });
    }

    // Добавляем предыдущих участников workflow
    const previousStepUsers =
      workflowData?.workflowSteps
        .filter(
          (step) =>
            step.order < task.order &&
            step.assignedToUser &&
            step.assignedToUserId !== documentData?.createdBy?.id, // Не дублируем создателя
        )
        .map((step) => ({
          id: step.assignedToUserId,
          name:
            step.assignedToUser?.fullname ||
            step.assignedToUser?.username ||
            "",
          username: step.assignedToUser?.username || "",
          stepOrder: step.order,
        })) || [];

    users.push(...previousStepUsers);
    return users;
  };

  const rollbackUsers = availableUsersForRejection();

  const isLoading =
    completeMutation.isLoading || rejectMutation.isLoading || isUserLoading;

  const handleComplete = () => {
    completeMutation.mutate(task.id, {
      onSuccess: () => {
        setShowCompleteDialog(false);
        onActionComplete?.();
      },
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      alert("Rad etish sababi kamida 10 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (!rollbackToUserId) {
      alert("Iltimos, qaytarish uchun foydalanuvchini tanlang");
      return;
    }

    const payload: any = {
      rejectionReason: rejectReason.trim(),
      rollbackToUserId: rollbackToUserId,
    };

    if (comment.trim()) {
      payload.comment = comment.trim();
    }

    rejectMutation.mutate(
      {
        id: task.id,
        data: payload,
      },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectReason("");
          setComment("");
          setRollbackToUserId("");
          onActionComplete?.();
        },
      },
    );
  };

  const getActionTypeConfig = () => {
    const configs: Record<
      string,
      {
        label: string;
        icon: any;
        color: string;
        bgColor: string;
        borderColor: string;
        canEdit: boolean;
      }
    > = {
      APPROVAL: {
        label: "Tasdiqlash",
        icon: CheckCircle2,
        color: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        canEdit: false,
      },
      REVIEW: {
        label: "Ko'rib chiqish",
        icon: FileSearch,
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        canEdit: false,
      },
      SIGN: {
        label: "Imzolash",
        icon: FileSignature,
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        canEdit: true,
      },
      QR_CODE: {
        label: "QR kod qo'shish",
        icon: FileEdit,
        color: "text-indigo-700",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        canEdit: true,
      },
      ACKNOWLEDGE: {
        label: "Tanishish",
        icon: FileText,
        color: "text-teal-700",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        canEdit: false,
      },
    };

    return configs[task.actionType] || configs.APPROVAL;
  };

  const getStatusConfig = () => {
    const configs: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        className: string;
      }
    > = {
      NOT_STARTED: {
        label: "Boshlanmagan",
        variant: "outline",
        className: "border-gray-300 text-gray-700",
      },
      PENDING: {
        label: "Kutilmoqda",
        variant: "outline",
        className: "border-orange-300 text-orange-700 bg-orange-50",
      },
      IN_PROGRESS: {
        label: "Jarayonda",
        variant: "default",
        className: "bg-blue-600 text-white border-blue-600",
      },
      COMPLETED: {
        label: "Tugallangan",
        variant: "secondary",
        className: "bg-green-100 text-green-800 border-green-300",
      },
      REJECTED: {
        label: "Rad etilgan",
        variant: "destructive",
        className: "bg-red-100 text-red-800 border-red-300",
      },
    };

    return configs[task.status] || configs.NOT_STARTED;
  };

  const getPriorityConfig = (priority?: string) => {
    const configs: Record<
      string,
      { label: string; icon: any; className: string }
    > = {
      HIGH: {
        label: "Yuqori",
        icon: TrendingUp,
        className: "text-red-600 bg-red-50 border-red-200",
      },
      MEDIUM: {
        label: "O'rta",
        icon: Minus,
        className: "text-orange-600 bg-orange-50 border-orange-200",
      },
      LOW: {
        label: "Past",
        icon: TrendingDown,
        className: "text-blue-600 bg-blue-50 border-blue-200",
      },
    };

    return priority ? configs[priority] : null;
  };

  const calculateProgress = () => {
    if (!workflowData?.workflowSteps) return 0;
    const totalSteps = workflowData.workflowSteps.length;
    const completedSteps = workflowData.workflowSteps.filter(
      (step) => step.status === "COMPLETED",
    ).length;
    return (completedSteps / totalSteps) * 100;
  };

  const actionConfig = getActionTypeConfig();
  const statusConfig = getStatusConfig();
  const ActionIcon = actionConfig.icon;
  const priorityConfig = getPriorityConfig(task.workflow?.document?.priority);
  const PriorityIcon = priorityConfig?.icon;

  // Проверяем, является ли текущий пользователь исполнителем задачи
  const isCurrentUserAssigned =
    currentUserProfile?.id === task.assignedToUserId;

  const canPerformActions =
    isCurrentUserAssigned &&
    (task.status === "NOT_STARTED" ||
      task.status === "PENDING" ||
      task.status === "IN_PROGRESS");

  const document = task.workflow?.document;

  const canEditDocument =
    isCurrentUserAssigned &&
    task.status === "IN_PROGRESS" &&
    actionConfig.canEdit &&
    documentData?.attachments &&
    documentData.attachments.length > 0;

  const handleEditDocument = () => {
    if (documentData?.attachments?.[0]?.id && documentId) {
      const editUrl = createWorkflowDocumentEditUrl(
        documentData.attachments[0].id,
        documentId,
        task.actionType, // Pass actionType to determine which editor to use
      );
      router.push(editUrl);
    }
  };

  const handleViewDocument = () => {
    if (documentData?.attachments?.[0]?.id && documentId) {
      const viewUrl = createWorkflowDocumentViewUrl(
        documentData.attachments[0].id,
        documentId,
        task.actionType, // Pass actionType to determine which viewer to use
      );
      router.push(viewUrl);
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "COMPLETED";

  const progress = calculateProgress();

  return (
    <>
      <Card
        className={`hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden ${
          onCardClick ? "cursor-pointer" : ""
        }`}
        onClick={onCardClick}
      >
        <div
          className={`h-1.5 ${actionConfig.bgColor.replace("bg-", "bg-gradient-to-r from-")}`}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${actionConfig.bgColor}`}>
                    <FileText className={`h-5 w-5 ${actionConfig.color}`} />
                  </div>
                  <span className="truncate">
                    {document?.title || "Hujjat topilmadi"}
                  </span>
                </CardTitle>
                {showActions && (onEdit || onDelete) && (
                  <div className="flex items-center gap-1 shrink-0">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                        }}
                        title="Tahrirlash"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs">
                  {document?.documentNumber || "—"}
                </Badge>
                {document?.status && (
                  <Badge variant="secondary" className="text-xs">
                    {document.status}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <Badge
                variant={statusConfig.variant}
                className={statusConfig.className}
              >
                {statusConfig.label}
              </Badge>
              {priorityConfig && PriorityIcon && (
                <Badge
                  variant="outline"
                  className={`${priorityConfig.className} flex items-center gap-1`}
                >
                  <PriorityIcon className="h-3 w-3" />
                  {priorityConfig.label}
                </Badge>
              )}
            </div>
          </div>

          {document?.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 pl-11">
              {document.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {workflowData && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Workflow jarayoni</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Bosqich {task.order} / {workflowData.workflowSteps.length}
                </span>
                <span>
                  {
                    workflowData.workflowSteps.filter(
                      (s) => s.status === "COMPLETED",
                    ).length
                  }{" "}
                  tugallangan
                </span>
              </div>
            </div>
          )}

          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${actionConfig.bgColor} ${actionConfig.borderColor}`}
          >
            <div className={`p-2 rounded-md bg-white shadow-sm`}>
              <ActionIcon className={`h-5 w-5 ${actionConfig.color}`} />
            </div>
            <div>
              <p className={`font-semibold ${actionConfig.color}`}>
                {actionConfig.label}
              </p>
              <p className="text-xs text-muted-foreground">
                Bosqich {task.order}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Due date with overdue indicator */}
            {task.dueDate && (
              <div
                className={`flex items-center gap-2.5 p-3 rounded-lg border ${
                  isOverdue
                    ? "bg-red-50 border-red-200"
                    : "bg-background border-border"
                }`}
              >
                <div
                  className={`p-2 rounded-md ${isOverdue ? "bg-red-100" : "bg-muted"}`}
                >
                  {isOverdue ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Muddat</p>
                  <p
                    className={`text-sm font-medium truncate ${isOverdue ? "text-red-700" : ""}`}
                  >
                    {formatDate(task.dueDate)}
                  </p>
                  {isOverdue && (
                    <p className="text-xs text-red-600 font-medium">
                      Muddati o'tgan
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Assigned user */}
            <div className="flex items-center gap-2.5 p-3 rounded-lg border bg-background">
              <div className="p-2 rounded-md bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Mas'ul</p>
                {isUserLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <p className="text-sm font-medium truncate">
                    {userData?.fullname ||
                      userData?.username ||
                      "Foydalanuvchi topilmadi"}
                  </p>
                )}
              </div>
            </div>

            {/* Completed date */}
            {task.completedAt && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg border bg-green-50 border-green-200 md:col-span-2">
                <div className="p-2 rounded-md bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-700">Tugallangan</p>
                  <p className="text-sm font-medium text-green-900">
                    {formatDate(task.completedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {task.isRejected && task.rejectionReason && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-bold text-red-900">
                  Rad etish sababi:
                </p>
              </div>
              <p className="text-sm text-red-800 pl-7">
                {task.rejectionReason}
              </p>
            </div>
          )}

          {/* View button for completed tasks */}
          {task.status === "COMPLETED" &&
            documentData?.attachments &&
            documentData.attachments.length > 0 && (
              <div className="space-y-2 pt-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDocument();
                  }}
                  className="w-full h-11 font-medium"
                  variant="outline"
                  size="lg"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Hujjatni ko'rish
                </Button>
              </div>
            )}

          {canPerformActions && (
            <div className="space-y-2 pt-2">
              {canEditDocument && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditDocument();
                  }}
                  disabled={isLoading}
                  className="w-full h-11 font-medium bg-transparent"
                  variant="outline"
                  size="lg"
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  {task.actionType === "QR_CODE"
                    ? "QR kod qo'shish"
                    : "Hujjatni tahrirlash"}
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCompleteDialog(true);
                  }}
                  disabled={isLoading}
                  className="h-11 font-medium"
                  variant="default"
                  size="lg"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Tasdiqlash
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Устанавливаем создателя документа по умолчанию
                    if (documentData?.createdBy?.id) {
                      setRollbackToUserId(documentData.createdBy.id);
                    }
                    setShowRejectDialog(true);
                  }}
                  disabled={isLoading}
                  className="h-11 font-medium"
                  variant="destructive"
                  size="lg"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rad etish
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vazifani tasdiqlash</AlertDialogTitle>
            <AlertDialogDescription>
              Siz haqiqatan ham bu vazifani tasdiqlashni xohlaysizmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={isLoading}>
              {isLoading ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Vazifani rad etish</AlertDialogTitle>
            <AlertDialogDescription>
              Hujjatni qaytarish uchun foydalanuvchini tanlang va rad etish
              sababini kiriting
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollback-user">
                Qaytarish uchun foydalanuvchi{" "}
                <span className="text-destructive">*</span>
              </Label>
              {isWorkflowLoading ? (
                <div className="text-sm text-muted-foreground">
                  Yuklanmoqda...
                </div>
              ) : rollbackUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Qaytarish uchun foydalanuvchilar yo'q
                </div>
              ) : (
                <>
                  <Select
                    value={rollbackToUserId}
                    onValueChange={setRollbackToUserId}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="rollback-user">
                      <SelectValue placeholder="Foydalanuvchini tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rollbackUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.isCreator && "🔖 "}
                          {user.name}
                          {user.isCreator
                            ? " (Yaratuvchi)"
                            : user.stepOrder
                              ? ` (@${user.username}) - Bosqich ${user.stepOrder}`
                              : ` (@${user.username})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {documentData?.createdBy && (
                    <p className="text-xs text-muted-foreground">
                      💡 Sukut bo'yicha hujjat yaratuvchiga qaytariladi
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reject-reason">
                Rad etish sababi <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (kamida 10 ta belgi)
                </span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Rad etish sababini kiriting..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                maxLength={500}
                disabled={isLoading}
                className="resize-none"
              />
              <div className="flex justify-between text-xs">
                {rejectReason.length < 10 ? (
                  <p className="text-destructive">
                    {rejectReason.length === 0
                      ? "Bu maydon majburiy"
                      : `Yana ${10 - rejectReason.length} ta belgi kerak`}
                  </p>
                ) : (
                  <p className="text-green-600">✓ Yetarli</p>
                )}
                <p className="text-muted-foreground">
                  {rejectReason.length}/500
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reject-comment">Qo'shimcha izoh</Label>
              <Textarea
                id="reject-comment"
                placeholder="Qo'shimcha ma'lumot kiriting..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                maxLength={1000}
                disabled={isLoading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/1000
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoading}
              onClick={() => {
                setRejectReason("");
                setComment("");
                setRollbackToUserId("");
              }}
            >
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={
                isLoading ||
                !rejectReason.trim() ||
                rejectReason.trim().length < 10 ||
                !rollbackToUserId
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Rad etilmoqda..." : "Rad etish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskCard;
