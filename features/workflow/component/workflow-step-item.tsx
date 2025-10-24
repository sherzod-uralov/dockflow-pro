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
import { WorkflowCreateType } from "../schema/workflow.schema";
import { Card, CardContent } from "@/components/ui/card";

interface WorkflowStepItemProps {
  index: number;
  control: Control<WorkflowCreateType>;
  onRemove: () => void;
  usersData?: {
    data: Array<{ id: string; fullname: string; username: string }>;
  };
  isLoadingUsers?: boolean;
  canRemove: boolean;
}

const WorkflowStepItem = ({
  index,
  control,
  onRemove,
  usersData,
  isLoadingUsers,
  canRemove,
}: WorkflowStepItemProps) => {
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

  // Фильтруем пользователей: убираем уже выбранных
  const availableUsers =
    usersData?.data.filter((user) => !selectedUserIds.includes(user.id)) || [];

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
