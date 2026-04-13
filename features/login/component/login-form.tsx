"use client";

import {
    TextInput,
    PasswordInput,
    Button,
    Stack,
    Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUser, IconLock, IconAlertCircle } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "../hook/login.hook";
import Cookie from "js-cookie";
import React, { useState } from "react";
import { colors } from "@/lib/colors";

interface LoginFormValues {
    username: string;
    password: string;
}

export const LoginForm = () => {
    const authMutation = useLoginMutation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get("callbackUrl");
    const [loginError, setLoginError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: (value) =>
                value.length < 3 ? "Foydalanuvchi nomi 3 tadan katta bo'lishi kerak" : null,
            password: (value) =>
                value.length < 3 ? "Parol uzunligi 3 tadan katta bo'lishi kerak" : null,
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation
        setLoginError(null);

        const validation = form.validate();
        if (validation.hasErrors) {
            return;
        }

        authMutation.mutate(form.values, {
            onSuccess: (data) => {
                Cookie.set("accessToken", data.accessToken);
                Cookie.set("refreshToken", data.refreshToken);
                const target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
                router.push(target);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="lg">
                {/* Error Alert */}
                {loginError && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        title="Xatolik"
                        color="red"
                        variant="light"
                        withCloseButton
                        onClose={() => setLoginError(null)}
                    >
                        {loginError}
                    </Alert>
                )}

                {/* Username */}
                <TextInput
                    label="Foydalanuvchi nomi"
                    placeholder="Foydalanuvchi nomini kiriting"
                    size="md"
                    radius="sm"
                    leftSection={<IconUser size={18} color={colors.textDimmed} />}
                    {...form.getInputProps("username")}
                    styles={{
                        label: {
                            fontWeight: 500,
                            marginBottom: 6,
                            color: colors.textPrimary,
                        },
                        input: {
                            "&:focus": {
                                borderColor: colors.primary,
                            },
                        },
                    }}
                />

                {/* Password */}
                <PasswordInput
                    label="Parol"
                    placeholder="Parolni kiriting"
                    size="md"
                    radius="sm"
                    leftSection={<IconLock size={18} color={colors.textDimmed} />}
                    {...form.getInputProps("password")}
                    styles={{
                        label: {
                            fontWeight: 500,
                            marginBottom: 6,
                            color: colors.textPrimary,
                        },
                        input: {
                            "&:focus": {
                                borderColor: colors.primary,
                            },
                        },
                    }}
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    size="md"
                    radius="sm"
                    fullWidth
                    loading={authMutation.isLoading}
                    styles={{
                        root: {
                            backgroundColor: colors.primary,
                            height: 48,
                            "&:hover": {
                                backgroundColor: colors.primaryHover,
                            },
                        },
                    }}
                >
                    Kirish
                </Button>
            </Stack>
        </form>
    );
};
