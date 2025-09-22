import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserSchema, UserSchemaZodType } from "../schema/user.schema";
import { Input } from "@/components/ui/input";
import { useCreateUserMutation } from "../hook/user.hook";
import { Button } from "@/components/ui/button";
import { UserFormProps } from "../type/user.types";
import { useEffect } from "react";
import { useGetRoles } from "../../roles/hook/role.hook";
import { CustomSelect } from "@/components/shared/ui/custom-select";
import { useGetAllDeportaments } from "@/features/deportament";

const UserForm = ({ mode, modal, userData }: UserFormProps) => {
  const form = useForm<UserSchemaZodType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      fullname: "",
      username: "",
      password: "",
      roleId: "",
      departmentId: "",
      avatarUrl: "",
      isActive: true,
    },
  });

  const usercreateMutation = useCreateUserMutation(form as any);
  const { data: roles } = useGetRoles({
    pageNumber: 1,
    pageSize: 10,
    search: "",
  });
  const { data: departments } = useGetAllDeportaments({
    pageNumber: 1,
    pageSize: 10,
    search: "",
  });

  useEffect(() => {
    if (mode === "edit" && userData) {
      form.reset(userData);
    }
  }, [mode, userData]);

  const handleSubmit = async (values: UserSchemaZodType) => {
    if (mode === "create") {
      usercreateMutation.mutate(values);
    } else {
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">To'liq ismi</FormLabel>
              <FormControl>
                <Input placeholder="Ismni kiriting (F.I.O)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">
                Foydalanuvchi nomi (kirish uchun)
              </FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Parol (kirish uchun)</FormLabel>
              <FormControl>
                <Input placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Ro'l</FormLabel>
              <FormControl>
                <CustomSelect
                  selectPlaceholder="Ro'lni tanlang"
                  options={
                    roles?.data?.map((role) => ({
                      value: role.id,
                      label: role.name,
                    })) || []
                  }
                  onChange={(val) => field.onChange(val)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Bo'lim</FormLabel>
              <FormControl>
                <CustomSelect
                  selectPlaceholder="Bo'limni tanlang"
                  options={
                    departments?.data?.map((department) => ({
                      value: department.id,
                      label: department.name,
                    })) || []
                  }
                  onChange={(val) => field.onChange(val)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profil uchun rasm</FormLabel>
              <FormControl>
                <Input placeholder="Avatar URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktivmi?</FormLabel>
              <FormControl>//</FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-end justify-end">
          <Button type="submit">Qo'shish</Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
