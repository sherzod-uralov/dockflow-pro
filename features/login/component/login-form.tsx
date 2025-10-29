"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
        className="space-y-6 bg-card text-card-foreground p-8 rounded-xl max-w-md mx-auto"
      >
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-foreground">Kirish</h2>
          <p className="text-sm text-muted-foreground">
            Tizimga kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        <FormField
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium text-sm">
                Foydalanuvchi nomi
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Foydalanuvchi nomi"
                  className="bg-input text-foreground border border-input-border rounded-lg focus:border-input-focus focus:ring-2 focus:ring-primary/20 w-full py-3 px-4 transition-all duration-200 placeholder:text-muted-foreground hover:border-border-hover"
                />
              </FormControl>
              <FormMessage className="text-error text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium text-sm">
                Parol
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-input text-foreground border border-input-border rounded-lg focus:border-input-focus focus:ring-2 focus:ring-primary/20 w-full py-3 px-4 pr-12 transition-all duration-200 placeholder:text-muted-foreground hover:border-border-hover"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-error text-xs mt-1" />
            </FormItem>
          )}
        />

        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed shadow-custom-md hover:shadow-custom-lg active:scale-[0.98]"
        >
          Kirish
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Parolingizni unutdingizmi?{" "}
            <a
              href="#"
              className="text-primary hover:text-primary-hover font-medium transition-colors duration-200 hover:underline"
            >
              Tiklash
            </a>
          </p>
        </div>
      </form>
    </Form>
  );
};
