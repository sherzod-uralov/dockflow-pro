"use client";
import React, { useState } from "react";
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
} from "lucide-react";
import { WorkflowStepApiResponse } from "@/features/workflow";
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
}

const TaskCard = ({ task, onActionComplete }: TaskCardProps) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [comment, setComment] = useState("");
  const [rollbackToUserId, setRollbackToUserId] = useState<string>("");

  const completeMutation = useCompleteWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();

  // Получаем данные пользователя
  const { data: userData, isLoading: isUserLoading } = useGetUserByIdQuery(
    task.assignedToUserId,
  );

  // Загружаем workflow для получения списка пользователей
  const { data: workflowData, isLoading: isWorkflowLoading } =
    useGetWorkflowById(task.workflowId);

  // Получаем пользователей из предыдущих шагов для rollback
  const previousUsers =
    workflowData?.workflowSteps
      .filter((step) => step.order < task.order && step.assignedToUser)
      .map((step) => ({
        id: step.assignedToUserId,
        name:
          step.assignedToUser?.fullname || step.assignedToUser?.username || "",
        username: step.assignedToUser?.username || "",
        stepOrder: step.order,
      })) || [];

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
      }
    > = {
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

    return configs[task.actionType] || configs.APPROVAL;
  };

  const getStatusBadge = () => {
    const variants: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      NOT_STARTED: { label: "Boshlanmagan", variant: "outline" },
      PENDING: { label: "Kutilmoqda", variant: "outline" },
      IN_PROGRESS: { label: "Jarayonda", variant: "default" },
      COMPLETED: { label: "Tugallangan", variant: "secondary" },
      REJECTED: { label: "Rad etilgan", variant: "destructive" },
    };

    const status = variants[task.status] || variants.NOT_STARTED;
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  const actionConfig = getActionTypeConfig();
  const ActionIcon = actionConfig.icon;

  const canPerformActions =
    task.status === "NOT_STARTED" ||
    task.status === "PENDING" ||
    task.status === "IN_PROGRESS";

  const document = task.workflow?.document;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {document?.title || "Hujjat topilmadi"}
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {document?.documentNumber || "—"}
              </p>
            </div>
            <div className="flex-shrink-0">{getStatusBadge()}</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${actionConfig.color} flex items-center gap-1.5`}
            >
              <ActionIcon className="h-3 w-3" />
              {actionConfig.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Bosqich {task.order}
            </span>
          </div>

          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Muddat:</span>
              <span className="font-medium">{formatDate(task.dueDate)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Mas'ul:</span>
            {isUserLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="font-medium">
                {userData?.fullname ||
                  userData?.username ||
                  "Foydalanuvchi topilmadi"}
              </span>
            )}
          </div>

          {task.completedAt && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Tugallangan:</span>
              <span className="font-medium">
                {formatDate(task.completedAt)}
              </span>
            </div>
          )}

          {task.isRejected && task.rejectionReason && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive mb-1">
                Rad etish sababi:
              </p>
              <p className="text-sm text-muted-foreground">
                {task.rejectionReason}
              </p>
            </div>
          )}

          {canPerformActions && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowCompleteDialog(true)}
                disabled={isLoading}
                className="flex-1"
                variant="default"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Tasdiqlash
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={isLoading}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rad etish
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Dialog */}
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

      {/* Reject Dialog with Rollback */}
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
            {/* ROLLBACK USER SELECT */}
            <div className="space-y-2">
              <Label htmlFor="rollback-user">
                Qaytarish uchun foydalanuvchi{" "}
                <span className="text-destructive">*</span>
              </Label>
              {isWorkflowLoading ? (
                <div className="text-sm text-muted-foreground">
                  Yuklanmoqda...
                </div>
              ) : previousUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Qaytarish uchun foydalanuvchilar yo'q
                </div>
              ) : (
                <Select
                  value={rollbackToUserId}
                  onValueChange={setRollbackToUserId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="rollback-user">
                    <SelectValue placeholder="Foydalanuvchini tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {previousUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} (@{user.username}) - Bosqich{" "}
                        {user.stepOrder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* REJECTION REASON */}
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

            {/* COMMENT */}
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
