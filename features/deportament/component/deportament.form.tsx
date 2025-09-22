import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  DeportamentInferType,
  deportamentScheme,
} from "../schema/deportament.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ModalState } from "@/types/modal";
import {
  useCreateDeportament,
  useGetAllDeportaments,
  useUpdateDeportament,
} from "../hook/deportament.hook";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/shared/ui/custom-select";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";

type DeportamentFormType = z.infer<typeof deportamentScheme>;

interface DeportamentFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  deportament?: DeportamentInferType & { id: string };
  onSuccess?: () => void;
}

const DeportamentFormModal = ({
  modal,
  mode,
  deportament,
  onSuccess,
}: DeportamentFormModalProps) => {
  const createDeportamentMutation = useCreateDeportament();
  const updateDeportamentMutation = useUpdateDeportament();
  const { data } = useGetAllDeportaments();
  const { data: users } = useGetUserQuery();

  const isUpdate = mode === "update";
  const isLoading =
    createDeportamentMutation.isLoading || updateDeportamentMutation.isLoading;

  const form = useForm<DeportamentFormType>({
    resolver: zodResolver(deportamentScheme),
    defaultValues: {
      name: "",
      description: "",
      directorId: null,
      code: "",
      location: "",
      parentId: null,
    },
  });

  useEffect(() => {
    if (isUpdate && deportament) {
      form.reset({
        name: deportament.name || "",
        description: deportament.description || "",
        directorId: deportament.directorId || "",
        code: deportament.code || "",
        location: deportament.location || "",
        parentId: deportament.parentId || "",
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
        description: "",
        code: "",
        location: "",
      });
    }
  }, [deportament, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: DeportamentFormType) => {
    if (isUpdate && deportament) {
      updateDeportamentMutation.mutate(
        { id: deportament.id, data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
          onError: (error) => {
            console.error("Update error:", error);
          },
        },
      );
    } else {
      createDeportamentMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
          form.reset();
          onSuccess?.();
        },
        onError: (error) => {
          console.error("Create error:", error);
        },
      });
    }
  };

  const handleCancel = () => {
    modal.closeModal();
    form.reset();
  };

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deportament nomi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Deportament nomini kiriting"
                  disabled={isLoading}
                  {...field}
                />
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
              <FormLabel>Deportament tavsifi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deportament tavsifini kiriting"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deportament uchun kod kiriting (ITD)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Deportament kodini kiriting"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deportament joylashuvi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Deportament joyini kiriting"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="directorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deportament direktori</FormLabel>
              <FormControl>
                <CustomSelect
                  onChange={field.onChange}
                  selectPlaceholder="Deportament direktorini tanlang"
                  options={
                    users?.data?.map((item) => ({
                      value: item.id,
                      label: item.fullname,
                    })) || []
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deportament biriktirish</FormLabel>
              <FormControl>
                <CustomSelect
                  onChange={field.onChange}
                  selectPlaceholder="Deportamentni tanlang"
                  options={
                    data?.data?.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })) || []
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            className="hover:text-text-on-dark"
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
                : "Qo'shilmoqda..."
              : isUpdate
                ? "Yangilash"
                : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DeportamentFormModal;
