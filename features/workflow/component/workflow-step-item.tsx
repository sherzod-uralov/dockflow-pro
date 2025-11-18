import { Control, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { WorkflowFormType } from "../schema/workflow.schema";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface WorkflowStepItemProps {
  index: number;
  control: Control<WorkflowFormType>;
  onRemove: () => void;
  usersData?: {
    data: Array<{
      id: string;
      fullname: string;
      username: string;
      department?: {
        id: string;
        name?: string;
      } | null;
    }>;
  };
  departmentsData?: {
    data: Array<{ id: string; name: string }>;
  };
  isLoadingUsers?: boolean;
  isLoadingDepartments?: boolean;
  canRemove: boolean;
}

const WorkflowStepItem = ({
  index,
  control,
  onRemove,
  usersData,
  departmentsData,
  isLoadingUsers,
  isLoadingDepartments,
  canRemove,
}: WorkflowStepItemProps) => {
  // Состояние для выбранного отдела
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);

  // ✨ НОВОЕ: Следим за всеми выбранными пользователями
  const allSteps =
    useWatch({
      control,
      name: "steps",
    }) || [];

  // Получаем ID всех уже выбранных пользователей (кроме текущего step)
  const selectedUserIds = allSteps
    .map((step, idx) => (idx !== index ? step?.assignedToUserId : null))
    .filter(Boolean) as string[];

  // Фильтруем пользователей: сначала по отделу, затем убираем уже выбранных
  const filteredByDepartment = selectedDepartmentId
    ? usersData?.data.filter(
        (user) => user.department?.id === selectedDepartmentId,
      ) || []
    : usersData?.data || [];

  const availableUsers = filteredByDepartment.filter(
    (user) => !selectedUserIds.includes(user.id),
  );

  return (
    <Card className="relative">
      <CardContent className="p-4">
        {/* Header с номером и кнопкой удаления */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <span className="font-semibold text-sm">Bosqich {index + 1}</span>
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Bosqichni o'chirish"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* ✨ Department Selection */}
        <div className="mb-4">
          <FormLabel>Bo'lim</FormLabel>
          <Select
            onValueChange={(value) => {
              setSelectedDepartmentId(value === "all" ? null : value);
            }}
            value={selectedDepartmentId || "all"}
            disabled={isLoadingDepartments}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bo'limni tanlang" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">Barcha bo'limlar</SelectItem>
              {departmentsData?.data.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ✨ Action Type Selection */}
        <FormField
          control={control}
          name={`steps.${index}.actionType`}
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Amal turi *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Amal turini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="APPROVAL">
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <div>
                        <div className="font-medium">Tasdiqlash</div>
                        <div className="text-xs text-muted-foreground">
                          Hujjatni tasdiqlash jarayoni
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="REVIEW">
                    <div className="flex items-center gap-2">
                      <span>🔍</span>
                      <div>
                        <div className="font-medium">Ko'rib chiqish</div>
                        <div className="text-xs text-muted-foreground">
                          Hujjatni ko'rib chiqish
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="SIGN">
                    <div className="flex items-center gap-2">
                      <span>✍️</span>
                      <div>
                        <div className="font-medium">Imzolash</div>
                        <div className="text-xs text-muted-foreground">
                          Hujjatga imzo qo'yish
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="QR_CODE">
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <div>
                        <div className="font-medium">QR kod qo'shish</div>
                        <div className="text-xs text-muted-foreground">
                          Hujjatga QR kod va izohlar qo'shish
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACKNOWLEDGE">
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <div>
                        <div className="font-medium">Tanishish</div>
                        <div className="text-xs text-muted-foreground">
                          Hujjat bilan tanishish
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✨ Assigned User с фильтрацией */}
        <FormField
          control={control}
          name={`steps.${index}.assignedToUserId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mas'ul shaxs *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingUsers}
              >
                <FormControl>
                  <SelectTrigger
                    className={
                      field.value &&
                      !availableUsers.find((u) => u.id === field.value)
                        ? "border-destructive"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Foydalanuvchini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {/* Если текущий пользователь уже выбран, показываем его */}
                  {field.value &&
                    !availableUsers.find((u) => u.id === field.value) && (
                      <SelectItem
                        value={field.value}
                        className="text-muted-foreground"
                      >
                        {usersData?.data.find((u) => u.id === field.value)
                          ?.fullname || "Tanlangan foydalanuvchi"}{" "}
                        (allaqachon tanlangan)
                      </SelectItem>
                    )}

                  {/* Доступные пользователи */}
                  {availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullname} (@{user.username})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Barcha foydalanuvchilar tanlangan
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default WorkflowStepItem;
