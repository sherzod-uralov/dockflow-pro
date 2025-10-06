"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodTypeAny } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

export type FieldOption = { label: string; value: string | number };
export type Field = {
  name: string;
  label?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file"
    | "tel"
    | "url";
  placeholder?: string;
  options?: FieldOption[];
  colSpan?: number;
};

interface Props {
  schema: ZodTypeAny;
  fields: Field[];
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void | Promise<void>;
  submitLabel?: string;
  className?: string;
  renderActions?: (formState: {
    isSubmitting: boolean;
    isValid: boolean;
  }) => React.ReactNode;
}

export default function SimpleFormGenerator({
  schema,
  fields,
  defaultValues = {},
  onSubmit,
  submitLabel = "Saqlash",
  className = "",
  renderActions,
}: Props) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className + " grid grid-cols-2 gap-4"}
      >
        {fields.map((f) => (
          <div
            key={f.name}
            className={f.colSpan ? `col-span-${f.colSpan}` : "col-span-1"}
          >
            <FormField
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem>
                  {f.label && <FormLabel>{f.label}</FormLabel>}
                  <FormControl>
                    {(() => {
                      switch (f.type) {
                        case "textarea":
                          return (
                            <Textarea placeholder={f.placeholder} {...field} />
                          );

                        case "select":
                          return (
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={f.placeholder ?? "Tanlang"}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {f.options?.map((opt) => (
                                  <SelectItem
                                    key={String(opt.value)}
                                    value={String(opt.value)}
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );

                        case "checkbox":
                          return (
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          );

                        case "radio":
                          return (
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              {f.options?.map((opt) => (
                                <div
                                  key={String(opt.value)}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={String(opt.value)}
                                    id={`${f.name}-${opt.value}`}
                                  />
                                  <FormLabel htmlFor={`${f.name}-${opt.value}`}>
                                    {opt.label}
                                  </FormLabel>
                                </div>
                              ))}
                            </RadioGroup>
                          );

                        case "number":
                          return (
                            <Input
                              type="number"
                              placeholder={f.placeholder}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                )
                              }
                            />
                          );

                        case "file":
                          return (
                            <Input
                              type="file"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.files
                                    ? e.target.files[0]
                                    : undefined,
                                )
                              }
                            />
                          );

                        default:
                          return (
                            <Input
                              type={f.type ?? "text"}
                              placeholder={f.placeholder}
                              {...field}
                            />
                          );
                      }
                    })()}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <div className="flex justify-end col-span-2 gap-2">
          {renderActions ? (
            renderActions({
              isSubmitting: form.formState.isSubmitting,
              isValid: form.formState.isValid,
            })
          ) : (
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saqlanmoqda..." : submitLabel}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
