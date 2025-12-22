"use client";

import { useState, useEffect } from "react";
import {
    Paper,
    Avatar,
    Text,
    Group,
    Button,
    Badge,
    Stack,
    Grid,
    TextInput,
    PasswordInput,
    FileInput,
    LoadingOverlay,
    Box,
    Tabs,
    Container,
    ThemeIcon,
} from "@mantine/core";
import {
    IconUser,
    IconDeviceFloppy,
    IconLock,
    IconId,
    IconBuilding,
    IconCalendar,
    IconClock,
    IconUpload,
    IconSettings,
} from "@tabler/icons-react";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import { useUpdateUserMutation } from "@/features/admin/admin-users/hook/user.hook";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";

export default function ProfilePage() {
    const { data: profile, isLoading, refetch } = useGetProfileQuery();
    const { mutateAsync: updateUser } = useUpdateUserMutation();
    const { mutateAsync: uploadFile, isLoading: isUploading } = useCreateAttachment();

    const [activeTab, setActiveTab] = useState<string | null>("general");
    const [formData, setFormData] = useState({
        fullname: "",
        username: "",
        password: "",
        avatarFile: null as File | null,
    });
    const [formErrors, setFormErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form data when profile loads
    useEffect(() => {
        if (profile) {
            setFormData((prev) => ({
                ...prev,
                fullname: profile.fullname,
                username: profile.username,
            }));
        }
    }, [profile]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Ma'lumot yo'q";
        return new Date(dateString).toLocaleDateString("oz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const validateForm = () => {
        const errors: any = {};
        if (!formData.fullname?.trim()) errors.fullname = "To'liq ism talab qilinadi";
        if (!formData.username?.trim()) errors.username = "Username talab qilinadi";
        if (formData.password && formData.password.length < 6) {
            errors.password = "Parol kamida 6 belgidan iborat bo'lishi kerak";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!profile?.id || !validateForm()) return;

        setIsSubmitting(true);
        try {
            const updateData: any = {
                fullname: formData.fullname,
                username: formData.username,
                isActive: profile.isActive,
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            if (formData.avatarFile) {
                // Upload file first
                const response = await uploadFile(formData.avatarFile);
                updateData.avatarUrl = response.fileUrl;
            }

            await updateUser({
                id: profile.id,
                data: updateData,
            });

            // Clear password field after success
            setFormData(prev => ({ ...prev, password: "", avatarFile: null }));
            refetch();
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Box pos="relative" h={400}>
                <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Paper p="xl" withBorder>
                <Text ta="center" c="dimmed">Profil ma'lumotlari topilmadi</Text>
            </Paper>
        );
    }

    return (
        <Container size="xl" py="md">
            <Stack gap="lg">
                {/* Top Section: Identity Card (Full Width) */}
                <Paper radius="md" p="xl" withBorder shadow="sm">
                    <Grid align="center" gutter="xl">
                        <Grid.Col span={{ base: 12, md: 'content' }}>
                            <Stack align="center" gap="sm">
                                <Avatar
                                    src={profile.avatarUrl}
                                    size={120}
                                    radius={120}
                                    color="blue"
                                >
                                    {getInitials(profile.fullname)}
                                </Avatar>
                                <Badge
                                    size="lg"
                                    variant="light"
                                    color={profile.isActive ? "green" : "red"}
                                >
                                    {profile.isActive ? "Faol" : "Nofaol"}
                                </Badge>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 'auto' }}>
                            <Stack gap="xs">
                                <div style={{ textAlign: "left" }}>
                                    <Text fw={700} size="xl" style={{ lineHeight: 1.2 }}>
                                        {profile.fullname}
                                    </Text>
                                    <Text c="dimmed" size="sm">
                                        @{profile.username}
                                    </Text>
                                </div>

                                <Group gap="xl" mt="md">
                                    <Group gap="xs">
                                        <ThemeIcon size="sm" variant="light" color="gray">
                                            <IconUser size={14} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xs" c="dimmed">Rol</Text>
                                            <Text size="sm" fw={500}>{profile.role.name}</Text>
                                        </div>
                                    </Group>
                                    <Group gap="xs">
                                        <ThemeIcon size="sm" variant="light" color="gray">
                                            <IconBuilding size={14} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xs" c="dimmed">Bo'lim</Text>
                                            <Text size="sm" fw={500}>{profile.department?.name || "-"}</Text>
                                        </div>
                                    </Group>
                                    <Group gap="xs">
                                        <ThemeIcon size="sm" variant="light" color="gray">
                                            <IconClock size={14} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xs" c="dimmed">So'nggi kirish</Text>
                                            <Text size="sm" fw={500}>{formatDate(profile.lastLogin)}</Text>
                                        </div>
                                    </Group>
                                </Group>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Paper>

                {/* Bottom Section: Content Tabs (Full Width) */}
                <Paper radius="md" withBorder shadow="sm" style={{ overflow: "hidden" }}>
                    <Tabs value={activeTab} onChange={setActiveTab} variant="default">
                        <Tabs.List px="md" pt="md">
                            <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
                                Asosiy ma'lumotlar
                            </Tabs.Tab>
                            <Tabs.Tab value="security" leftSection={<IconLock size={16} />}>
                                Xavfsizlik
                            </Tabs.Tab>
                            <Tabs.Tab value="system" leftSection={<IconId size={16} />}>
                                Tizim
                            </Tabs.Tab>
                        </Tabs.List>

                        <Box p="xl" pos="relative">
                            <LoadingOverlay visible={isSubmitting || isUploading} overlayProps={{ radius: "sm", blur: 1 }} />

                            <Tabs.Panel value="general">
                                <Stack gap="lg" maw={800}>
                                    <Grid>
                                        <Grid.Col span={{ base: 12, sm: 6 }}>
                                            <TextInput
                                                label="To'liq ism"
                                                description="Foydalanuvchining to'liq ismi familiyasi"
                                                placeholder="Ism Familiya"
                                                value={formData.fullname}
                                                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                                error={formErrors.fullname}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, sm: 6 }}>
                                            <TextInput
                                                label="Username"
                                                description="Tizimga kirish uchun login"
                                                placeholder="username"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                error={formErrors.username}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={12}>
                                            <FileInput
                                                label="Avatar rasmi"
                                                description="Profil rasmini yangilash (jpg, png)"
                                                placeholder="Fayl tanlang"
                                                leftSection={<IconUpload size={16} />}
                                                accept="image/png,image/jpeg"
                                                clearable
                                                //@ts-ignore
                                                onChange={(file) => setFormData({ ...formData, avatarFile: file })}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Group justify="flex-end" mt="md">
                                        <Button
                                            leftSection={<IconDeviceFloppy size={18} />}
                                            onClick={handleSubmit}
                                            loading={isSubmitting || isUploading}
                                        >
                                            Saqlash
                                        </Button>
                                    </Group>
                                </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="security">
                                <Stack gap="lg" maw={600}>
                                    <PasswordInput
                                        label="Yangi parol"
                                        description="Parolni o'zgartirish uchun yangi parolni kiriting. Bo'sh qoldirsangiz o'zgarmaydi."
                                        placeholder="********"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        error={formErrors.password}
                                    />

                                    <Group justify="flex-end" mt="md">
                                        <Button
                                            leftSection={<IconDeviceFloppy size={18} />}
                                            onClick={handleSubmit}
                                            loading={isSubmitting}
                                            color="red"
                                            variant="light"
                                        >
                                            Parolni yangilash
                                        </Button>
                                    </Group>
                                </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="system">
                                <Stack gap="md" maw={800}>
                                    <TextInput
                                        label="Tizim ID"
                                        value={profile.id}
                                        readOnly
                                        variant="filled"
                                    />
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="Yaratilgan vaqt"
                                                value={new Date(profile.createdAt).toLocaleString()}
                                                readOnly
                                                variant="filled"
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <TextInput
                                                label="So'nggi tahrir"
                                                value={new Date(profile.updatedAt).toLocaleString()}
                                                readOnly
                                                variant="filled"
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Stack>
                            </Tabs.Panel>
                        </Box>
                    </Tabs>
                </Paper>
            </Stack>
        </Container>
    );
}