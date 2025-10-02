// src/components/journals/journal-form.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { JournalCreateType, journalCreate } from "../scheme/journal-create";

// UI компоненты
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Хуки для журналов, департаментов и пользователей
import {
  useJournalCreateMutation,
  useUpdateJournal,
} from "../hook/journal.hook";
import { useGetAllDeportaments } from "@/features/deportament/hook/deportament.hook";
import { useGetUserQuery } from "../../admin/admin-users/hook/user.hook";

// Тип для пропсов
import { JournalFormProps } from "../types/journal.types";

const journalSchema = journalCreate();

const JournalForm = ({ modal, mode, journal }: JournalFormProps) => {
  const { data: departmentsData, isLoading: isLoadingDepartments } =
    useGetAllDeportaments();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery();

  const journalCreateMutation = useJournalCreateMutation();
  const journalUpdateMutation = useUpdateJournal();
  const areListsLoading = isLoadingDepartments || isLoadingUsers;
  const form = useForm<JournalCreateType>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      name: "",
      prefix: "",
      format: "YYYY-MM-DD/{prefix}-{number}",
      departmentId: "",
      responsibleUserId: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && journal) {
      form.reset({
        name: journal.name,
        prefix: journal.prefix,
        format: journal.format,
        departmentId: journal.department.id,
        responsibleUserId: journal.responsibleUser.id,
      });
    }
  }, [mode, journal, form.reset, usersData, departmentsData]);

  const onSubmitHandler = (values: JournalCreateType) => {
    if (mode === "edit" && journal) {
      journalUpdateMutation.mutate(
        { data: values, id: journal.id },
        {
          onSuccess: () => {
            modal.closeModal();
          },
        },
      );
    } else {
      journalCreateMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
        },
      });
    }
  };

  const isLoading =
    isLoadingDepartments ||
    isLoadingUsers ||
    journalCreateMutation.isLoading ||
    journalUpdateMutation.isLoading;

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmitHandler)}
        >
          {/* Поля формы для журнала */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jurnal nomi</FormLabel>
                <FormControl>
                  <Input placeholder="Jurnal nomini kiriting..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prefiks</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan, KHM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <FormControl>
                    <Input placeholder="YYYY-MM/{prefix}-{number}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* --- Выпадающий список для Департамента --- */}
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departament</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingDepartments}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Departamentni tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departmentsData?.data.map((department: any) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Выпадающий список для Ответственного --- */}
          <FormField
            control={form.control}
            name="responsibleUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mas'ul shaxs</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value} // <--- ИЗМЕНЕНИЕ: defaultValue -> value
                  disabled={isLoadingUsers}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Foydalanuvchini tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usersData?.data.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Кнопки управления */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              size="sm"
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isLoading} size="sm">
              {isLoading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default JournalForm;
