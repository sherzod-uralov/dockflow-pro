"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
  workflowCreateSchema,
  workflowUpdateSchema,
  WorkflowFormType,
} from "../schema/workflow.schema";
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
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import { useEffect, useMemo } from "react";
import { WorkflowFormProps } from "../type/workflow.type";
import {
  useCreateWorkflow,
  useUpdateWorkflowStep, // ✅ ДОБАВИЛИ импорт
} from "../hook/workflow.hook";
import WorkflowStepItem from "./workflow-step-item";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetAllDeportaments } from "@/features/deportament/hook/deportament.hook";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  apiToFormData,
  formToApiPayload,
  createEmptyStep,
} from "../utils/workflow.mapper";
import { useGetAllDocuments } from "@/features/document";

const ACTION_TYPE_OPTIONS = [
  {
    value: "APPROVAL",
    label: "Tasdiqlash",
    description: "Hujjatni tasdiqlash jarayoni",
  },
  {
    value: "REVIEW",
    label: "Ko'rib chiqish",
    description: "Hujjatni ko'rib chiqish",
  },
  { value: "SIGN", label: "Imzolash", description: "Hujjatga imzo qo'yish" },
  {
    value: "NOTIFY",
    label: "Xabarnoma",
    description: "Foydalanuvchilarga xabar yuborish",
  },
] as const;

const WORKFLOW_TYPE_OPTIONS = [
  {
    value: "Ketma-ket",
    label: "Ketma-ket",
    description:
      "Har bir bosqich oldingi bosqich tugaganidan keyin boshlanadi",
  },
  {
    value: "Parallel",
    label: "Parallel",
    description: "Barcha bosqichlar bir vaqtning o'zida bajariladi",
  },
] as const;

const WorkflowForm = ({
  modal,
  mode,
  workflow,
  onSuccess,
}: WorkflowFormProps) => {
  const createWorkflowMutation = useCreateWorkflow();
  const updateStepMutation = useUpdateWorkflowStep(); // ✅ ИЗМЕНЕНО: используем хук для step
  const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery({
    pageSize: 1000, // Загружаем всех пользователей
  });
  const { data: departmentsData, isLoading: isLoadingDepartments } =
    useGetAllDeportaments({
      pageSize: 1000, // Загружаем все отделы
    });

  const { data: documentsData, isLoading: isLoadingDocuments } =
    useGetAllDocuments();

  const isUpdate = mode === "edit";
  const isLoading =
    createWorkflowMutation.isLoading || updateStepMutation.isLoading; // ✅ ИЗМЕНЕНО

  // Выбираем правильную схему валидации
  const validationSchema = useMemo(
    () => (isUpdate ? workflowUpdateSchema : workflowCreateSchema),
    [isUpdate],
  );

  const form = useForm<WorkflowFormType>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      documentId: "",
      actionType: "APPROVAL",
      workflowType: "Ketma-ket",
      steps: [createEmptyStep()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  // Загрузка данных при редактировании
  useEffect(() => {
    if (isUpdate && workflow) {
      const formData = apiToFormData(workflow);
      form.reset(formData);
    } else if (!isUpdate) {
      form.reset({
        documentId: "",
        actionType: "APPROVAL",
        workflowType: "Ketma-ket",
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
        const payload = {
          order: index,
          actionType: values.actionType,
          assignedToUserId: step.assignedToUserId,
          dueDate: step.dueDate ? `${step.dueDate}T23:59:59.000Z` : null,
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
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Document Selection */}
        <FormField
          control={form.control}
          name="documentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hujjat *</FormLabel>
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

        {/* Workflow Type */}
        <FormField
          control={form.control}
          name="workflowType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow turi *</FormLabel>
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

        {/* Action Type */}
        <FormField
          control={form.control}
          name="actionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amal turi (barcha bosqichlar uchun) *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Amal turini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACTION_TYPE_OPTIONS.map((option) => (
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
                {isUpdate
                  ? "Siz amal turini o'zgartirishingiz mumkin. Bu barcha bosqichlarga qo'llaniladi."
                  : "Bu amal turi barcha workflow bosqichlariga qo'llaniladi"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {isUpdate ? (
              <>
                <strong>Tahrirlash rejimi:</strong> Siz amal turini
                o'zgartirishingiz, yangi bosqichlar qo'shishingiz yoki
                mavjudlarini o'chirishingiz mumkin. Hujjatni o'zgartirish mumkin
                emas.
              </>
            ) : (
              <>
                Workflow bosqichlari ketma-ket bajariladi. Har bir bosqich uchun
                mas'ul shaxsni belgilang. Muddat avtomatik ravishda joriy vaqt
                bilan belgilanadi.
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Workflow Steps Section */}
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

          {/* Validation Error for steps array */}
          {form.formState.errors.steps?.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.steps.root.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Steps List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <WorkflowStepItem
                key={field.id}
                index={index}
                control={form.control}
                onRemove={() => remove(index)}
                usersData={usersData}
                departmentsData={departmentsData}
                isLoadingUsers={isLoadingUsers}
                isLoadingDepartments={isLoadingDepartments}
                canRemove={fields.length > 1}
              />
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

        {/* Form Actions */}
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
