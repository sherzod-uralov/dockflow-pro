"use client";

import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  loginScheme,
  LoginFormValue,
} from "@/features/login/scheme/login-scheme";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "../hook/login.hook";
import Cookie from "js-cookie";

export const LoginForm = () => {
  const authMutation = useLoginMutation();
  const router = useRouter();
  const form = useForm<LoginFormValue>({
    resolver: zodResolver(loginScheme),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValue> = async (values) => {
    authMutation.mutate(values, {
      onSuccess: (data) => {
        Cookie.set("accessToken", data.accessToken);
        Cookie.set("refreshToken", data.refreshToken);
        router.push("/dashboard");
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-card text-card-foreground p-6 rounded-lg shadow-md max-w-md mx-auto"
      >
        <FormField
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-semibold">
                Username
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Foydalanuvchi nomi"
                  className="bg-input text-foreground border-border rounded-md focus:ring-2 focus:ring-primary w-full py-3 px-4 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-semibold">
                Parol
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Parolingiz"
                  className="bg-input text-foreground border-border rounded-md focus:ring-2 focus:ring-primary w-full py-3 px-4 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
        >
          Kirish
        </button>
      </form>
    </Form>
  );
};
