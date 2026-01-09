"use client";

import {
    Box,
    Center,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { IconFileText } from "@tabler/icons-react";
import { LoginForm } from "@/features/login/component/login-form";

export default function LoginPage() {
    return (
        <Box
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <Paper
                p="xl"
                radius="md"
                shadow="sm"
                style={{
                    width: "100%",
                    maxWidth: 420,
                    border: "1px solid #e9ecef",
                }}
            >
                <Stack gap="xl">
                    {/* Logo */}
                    <Center>
                        <Box
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <Box
                                p={10}
                                style={{
                                    backgroundColor: "#1e3a5f",
                                    borderRadius: 8,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <IconFileText size={24} color="#fff" />
                            </Box>
                            <Text size="xl" fw={600} c="#212529">
                                Docflow Pro
                            </Text>
                        </Box>
                    </Center>

                    {/* Header */}
                    <Box ta="center">
                        <Title order={2} c="#212529" mb={8}>
                            Xush kelibsiz
                        </Title>
                        <Text size="sm" c="dimmed">
                            Tizimga kirish uchun login va parolni kiriting
                        </Text>
                    </Box>

                    {/* Form */}
                    <LoginForm />

                    {/* Footer */}
                    <Text size="xs" c="dimmed" ta="center">
                        Copyright © 2025 Nordic IT LTD.
                    </Text>
                </Stack>
            </Paper>
        </Box>
    );
}
