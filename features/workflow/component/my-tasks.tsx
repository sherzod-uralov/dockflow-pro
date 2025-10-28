"use client";
import React, { useState } from "react";
import { useGetMyTasks } from "@/features/workflow";
import { usePagination } from "@/hooks/use-pagination";
import TaskCard from "./task-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Inbox } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  WorkflowStepStatus,
  WorkflowActionType,
} from "@/features/workflow";

const MyTasks = () => {
  const { pageNumber, pageSize, handlePageSizeChange, handlePageChange } =
    usePagination();

  const [statusFilter, setStatusFilter] = useState<
    WorkflowStepStatus | undefined
  >(undefined);
  const [actionTypeFilter, setActionTypeFilter] = useState<
    WorkflowActionType | undefined
  >(undefined);

  const { data, isLoading, refetch } = useGetMyTasks({
    status: statusFilter,
    actionType: actionTypeFilter,
    page: pageNumber,
    limit: pageSize,
  });

  const handleFilterChange = () => {
    handlePageChange(1);
    refetch();
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Vazifalar topilmadi</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {statusFilter || actionTypeFilter
            ? "Tanlangan filtrlarga mos vazifalar mavjud emas."
            : "Sizga hozircha hech qanday vazifa tayinlanmagan."}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Bu yerda sizga tayinlangan workflow vazifalari ko'rsatilgan. Har bir
          vazifani ko'rib chiqib, tasdiqlash yoki rad etish mumkin.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Holat</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value === "all"
                      ? undefined
                      : (value as WorkflowStepStatus),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Barchasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="NOT_STARTED">Boshlanmagan</SelectItem>
                  <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                  <SelectItem value="IN_PROGRESS">Jarayonda</SelectItem>
                  <SelectItem value="COMPLETED">Tugallangan</SelectItem>
                  <SelectItem value="REJECTED">Rad etilgan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amal turi</Label>
              <Select
                value={actionTypeFilter}
                onValueChange={(value) =>
                  setActionTypeFilter(
                    value === "all"
                      ? undefined
                      : (value as WorkflowActionType),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Barchasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="APPROVAL">Tasdiqlash</SelectItem>
                  <SelectItem value="REVIEW">Ko'rib chiqish</SelectItem>
                  <SelectItem value="SIGN">Imzolash</SelectItem>
                  <SelectItem value="NOTIFY">Xabarnoma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleFilterChange} variant="default">
              Filtrlarni qo'llash
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {isLoading ? (
        renderSkeleton()
      ) : !data || data.data.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((step) => {
              // Backend уже возвращает только workflow steps текущего пользователя
              // Создаем объект для TaskCard с правильной структурой
              const taskData = {
                ...step,
                workflow: step.workflow
                  ? {
                      id: step.workflow.id,
                      documentId: step.workflow.document?.id || "",
                      currentStepOrder: 0,
                      status: "ACTIVE",
                      document: step.workflow.document
                        ? {
                            id: step.workflow.document.id,
                            title: step.workflow.document.title,
                            documentNumber:
                              step.workflow.document.documentNumber,
                            description:
                              step.workflow.document.description || "",
                            status: "ACTIVE",
                            priority: "MEDIUM",
                          }
                        : undefined,
                    }
                  : {
                      id: "",
                      documentId: "",
                      currentStepOrder: 0,
                      status: "ACTIVE",
                      document: {
                        id: "",
                        title: "Неизвестный документ",
                        documentNumber: "",
                        description: "",
                        status: "ACTIVE",
                        priority: "MEDIUM",
                      },
                    },
              };

              return (
                <TaskCard
                  key={step.id}
                  task={taskData}
                  onActionComplete={refetch}
                />
              );
            })}
          </div>

          {/* Pagination Info */}
          {data.count > pageSize && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Jami: {data.count} ta vazifa
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber === 1}
                >
                  Oldingi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber * pageSize >= data.count}
                >
                  Keyingi
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTasks;
