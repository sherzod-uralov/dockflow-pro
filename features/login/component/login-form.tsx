"use client";

import {
    TextInput,
    PasswordInput,
    Button,
    Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUser, IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "../hook/login.hook";
import Cookie from "js-cookie";
import React from "react";

interface LoginFormValues {
    username: string;
    password: string;
}

export const LoginForm = () => {
    const authMutation = useLoginMutation();
    const router = useRouter();

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            return;
        }

        authMutation.mutate(form.values, {
            onSuccess: (data) => {
                Cookie.set("accessToken", data.accessToken);
                Cookie.set("refreshToken", data.refreshToken);
                router.push("/dashboard");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="lg">
                {/* Username */}
                <TextInput
                    label="Foydalanuvchi nomi"
                    placeholder="Foydalanuvchi nomini kiriting"
                    size="md"
                    radius="sm"
                    leftSection={<IconUser size={18} color="#868e96" />}
                    {...form.getInputProps("username")}
                    styles={{
                        label: {
                            fontWeight: 500,
                            marginBottom: 6,
                            color: "#212529",
                        },
                        input: {
                            "&:focus": {
                                borderColor: "#1e3a5f",
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
                    leftSection={<IconLock size={18} color="#868e96" />}
                    {...form.getInputProps("password")}
                    styles={{
                        label: {
                            fontWeight: 500,
                            marginBottom: 6,
                            color: "#212529",
                        },
                        input: {
                            "&:focus": {
                                borderColor: "#1e3a5f",
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
                            backgroundColor: "#1e3a5f",
                            height: 48,
                            "&:hover": {
                                backgroundColor: "#162d4a",
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
