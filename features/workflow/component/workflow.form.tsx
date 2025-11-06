"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Info, Trash2, Search } from "lucide-react";
import {
  workflowCreateSchema,
  workflowUpdateSchema,
  WorkflowFormType,
} from "../schema/workflow.schema";
import {
  WorkflowFormProps,
  ACTION_TYPE_OPTIONS,
  WORKFLOW_TYPE_OPTIONS,
  WorkflowActionType,
  WorkflowType,
  WorkflowStepUpdateType,
} from "@/features/workflow/type/workflow.type";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetAllDocuments } from "@/features/document";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  apiToFormData,
  formToApiPayload,
  createEmptyStep,
} from "../utils/workflow.mapper";
import { useCreateWorkflow, useUpdateWorkflowStep } from "@/features/workflow";

const WorkflowForm = ({
  modal,
  mode,
  workflow,
  onSuccess,
}: WorkflowFormProps) => {
  const createWorkflowMutation = useCreateWorkflow();
  const updateStepMutation = useUpdateWorkflowStep();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery();
  const { data: documentsData } = useGetAllDocuments();

  // Состояние для поиска пользователей в каждом шаге
  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>(
    {},
  );

  const isUpdate = mode === "edit";
  const isLoading =
    createWorkflowMutation.isLoading || updateStepMutation.isLoading;

  const validationSchema = useMemo(
    () => (isUpdate ? workflowUpdateSchema : workflowCreateSchema),
    [isUpdate],
  );

  const form = useForm<WorkflowFormType>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      documentId: "",
      workflowType: WorkflowType.CONSECUTIVE,
      steps: [createEmptyStep()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  useEffect(() => {
    if (isUpdate && workflow) {
      const formData = apiToFormData(workflow);
      form.reset(formData);
    } else if (!isUpdate) {
      form.reset({
        documentId: "",
        workflowType: WorkflowType.CONSECUTIVE,
        steps: [createEmptyStep()],
      });
    }
  }, [workflow, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: WorkflowFormType) => {
    if (isUpdate && workflow) {
      const stepsToUpdate = values.steps.filter((step) => step.id);

      if (stepsToUpdate.length === 0) {
        return;
      }

      let completed = 0;
      const total = stepsToUpdate.length;

      stepsToUpdate.forEach((step, index) => {
        const payload: WorkflowStepUpdateType = {
          order: index,
          actionType: step.actionType as WorkflowActionType,
          assignedToUserId: step.assignedToUserId,
        };

        updateStepMutation.mutate(
          {
            id: step.id!,
            data: payload,
          },
          {
            onSuccess: () => {
              completed++;
              if (completed === total) {
                modal.closeModal();
                form.reset();
                onSuccess?.();
              }
            },
          },
        );
      });
    } else {
      const payload = formToApiPayload(values, isUpdate);

      createWorkflowMutation.mutate(payload, {
        onSuccess: () => {
          modal.closeModal();
          form.reset();
          onSuccess?.();
        },
      });
    }
  };

  const handleAddStep = () => {
    append(createEmptyStep());
  };

  const handleCancel = () => {
    modal.closeModal();
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="documentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hujjat</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isUpdate}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hujjatni tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentsData?.data.map((doc: any) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title} - {doc.documentNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workflowType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow turi</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Workflow turini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {WORKFLOW_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Ketma-ket: har bir bosqich oldingi bosqich tugaganidan keyin
                boshlanadi. Parallel: barcha bosqichlar bir vaqtning o'zida
                bajariladi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {isUpdate ? (
              <>
                <strong>Tahrirlash rejimi:</strong> Siz yangi bosqichlar
                qo'shishingiz yoki mavjudlarini o'chirishingiz mumkin. Hujjatni
                o'zgartirish mumkin emas.
              </>
            ) : (
              <>
                Workflow bosqichlari ketma-ket bajariladi. Har bir bosqich uchun
                mas'ul shaxs va amal turini belgilang.
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Workflow bosqichlari</h3>
              <p className="text-sm text-muted-foreground">
                {isUpdate
                  ? "Bosqichlarni tahrirlang, qo'shing yoki o'chiring"
                  : "Har bir bosqich uchun mas'ul shaxsni tanlang"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              disabled={fields.length >= 20}
            >
              <Plus className="h-4 w-4 mr-2" />
              Bosqich qo'shish
            </Button>
          </div>

          {form.formState.errors.steps?.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.steps.root.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Bosqich {index + 1}
                    </CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`steps.${index}.assignedToUserId`}
                    render={({ field: formField }) => {
                      // Следим за всеми выбранными пользователями
                      const allSteps =
                        useWatch({
                          control: form.control,
                          name: "steps",
                        }) || [];

                      // Получаем ID всех уже выбранных пользователей (кроме текущего step)
                      const selectedUserIds = allSteps
                        .map((step, idx) =>
                          idx !== index ? step?.assignedToUserId : null,
                        )
                        .filter(Boolean) as string[];

                      // Фильтруем пользователей: убираем уже выбранных
                      const availableUsers =
                        usersData?.data.filter(
                          (user: any) => !selectedUserIds.includes(user.id),
                        ) || [];

                      // Фильтрация по поисковому запросу
                      const searchQuery = searchQueries[index] || "";
                      const filteredUsers = availableUsers.filter(
                        (user: any) => {
                          const query = searchQuery.toLowerCase();
                          return (
                            user.fullname.toLowerCase().includes(query) ||
                            user.username.toLowerCase().includes(query)
                          );
                        },
                      );

                      return (
                        <FormItem>
                          <FormLabel>Mas'ul shaxs</FormLabel>
                          <Select
                            onValueChange={formField.onChange}
                            value={formField.value}
                            disabled={isLoadingUsers}
                            onOpenChange={(open) => {
                              if (!open) {
                                setSearchQueries((prev) => ({
                                  ...prev,
                                  [index]: "",
                                }));
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={
                                  formField.value &&
                                  !availableUsers.find(
                                    (u: any) => u.id === formField.value,
                                  )
                                    ? "border-destructive"
                                    : ""
                                }
                              >
                                <SelectValue placeholder="Foydalanuvchini tanlang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="p-0">
                              {/* Зафиксированная шапка с поиском */}
                              <div className="sticky top-0 z-10 bg-background border-b">
                                <div className="flex items-center gap-2 px-2 py-2">
                                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <Input
                                    placeholder="Qidirish..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                      setSearchQueries((prev) => ({
                                        ...prev,
                                        [index]: e.target.value,
                                      }));
                                    }}
                                    className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>

                              {/* Скроллируемый список */}
                              <div className="max-h-[200px] overflow-y-auto p-1">
                                {/* Если текущий пользователь уже выбран в другом шаге */}
                                {formField.value &&
                                  !availableUsers.find(
                                    (u: any) => u.id === formField.value,
                                  ) && (
                                    <SelectItem
                                      value={formField.value}
                                      className="text-muted-foreground"
                                    >
                                      {usersData?.data.find(
                                        (u: any) => u.id === formField.value,
                                      )?.fullname ||
                                        "Tanlangan foydalanuvchi"}{" "}
                                      (allaqachon tanlangan)
                                    </SelectItem>
                                  )}

                                {/* Доступные пользователи */}
                                {filteredUsers.length > 0 ? (
                                  filteredUsers.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.fullname} (@{user.username})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                                    {searchQuery
                                      ? "Foydalanuvchi topilmadi"
                                      : "Barcha foydalanuvchilar tanlangan"}
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name={`steps.${index}.actionType`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>Amal turi</FormLabel>
                        <Select
                          onValueChange={formField.onChange}
                          value={formField.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Amal turini tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ACTION_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {fields.length === 0 && (
            <Alert>
              <AlertDescription>
                Kamida bitta bosqich qo'shishingiz kerak
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isUpdate
                ? "Yangilanmoqda..."
                : "Yaratilmoqda..."
              : isUpdate
                ? "Yangilash"
                : "Yaratish"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkflowForm;
