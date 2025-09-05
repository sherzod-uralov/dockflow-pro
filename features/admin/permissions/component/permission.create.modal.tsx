import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { permissionScheme } from "../scheme/permission.scheme";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ModalState } from "@/types/modal";
import { useCreatePermission } from "../hook/permission.hook";

type PermissionType = z.infer<typeof permissionScheme>;

const PermissionCreateModal = ({ modal }: { modal: ModalState }) => {
  const createPermissionMutation = useCreatePermission();
  const form = useForm<PermissionType>({
    resolver: zodResolver(permissionScheme),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      key: "",
      module: "",
    },
  });

  const handleCreatePermission = (values: PermissionType) => {
    createPermissionMutation.mutate(values, {
      onSuccess: () => {
        modal.closeModal();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(handleCreatePermission)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ruxsat nomi</FormLabel>
              <FormControl>
                <Input placeholder="Ruxsat nomi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ruxsat tavsifi</FormLabel>
              <FormControl>
                <Textarea placeholder="Ruxsat tavsifi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-between items-center">
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Ruxsat kalit so'zi</FormLabel>
                <FormControl>
                  <Input placeholder="Ruxsat kalit so'zi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="module"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Ruxsat modul nomi</FormLabel>
                <FormControl>
                  <Input placeholder="Ruxsat modul nomi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Qo'shish</Button>
      </form>
    </Form>
  );
};

export default PermissionCreateModal;
