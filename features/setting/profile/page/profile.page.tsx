"use client";

import { useState } from "react";
import {
    Paper,
    Avatar,
    Text,
    Group,
    Button,
    Badge,
    Stack,
    Grid,
    Divider,
    TextInput,
    PasswordInput,
    FileInput,
    LoadingOverlay,
    Card,
    ThemeIcon,
    Box,
    Title,
    Transition,
} from "@mantine/core";
import {
    IconPencil,
    IconX,
    IconCalendar,
    IconUser,
    IconShield,
    IconBuilding,
    IconClock,
    IconUpload,
    IconCheck,
} from "@tabler/icons-react";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import { useUpdateUserMutation } from "@/features/admin/admin-users/hook/user.hook";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullname: "",
        username: "",
        password: "",
        avatarFile: null,
    });
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: profile, isLoading, refetch } = useGetProfileQuery();
    const { mutateAsync: updateUser } = useUpdateUserMutation();

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.fullname || formData.fullname.length < 1) {
            newErrors.fullname = "To'liq ism kiritilishi shart";
        }

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = "Username kamida 3 ta belgidan iborat bo'lishi kerak";
        }

        if (formData.password && formData.password.length > 0) {
            if (formData.password.length < 8) {
                newErrors.password = "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
            } else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
                newErrors.password = "Parol katta harf, kichik harf va raqam o'z ichiga olishi kerak";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !profile?.id) return;

        setIsSubmitting(true);
        try {
            const updateData: any = {
                fullname: formData.fullname,
                username: formData.username,
                isActive: profile.isActive,
            };

            if (formData.password && formData.password.length > 0) {
                updateData.password = formData.password;
            }

            if (formData.avatarFile) {
                updateData.avatarUrl = URL.createObjectURL(formData.avatarFile);
            }

            await updateUser({
                id: profile.id,
                data: updateData,
            });
            setIsEditing(false);
            refetch();
        } catch (error) {
            console.error("Profile update error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
        return new Date(dateString).toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <Box pos="relative" mih={400}>
                <LoadingOverlay visible={true} />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Paper p="xl" radius="lg" shadow="sm">
                <Text ta="center" c="dimmed">
                    Profil ma'lumotlari topilmadi
                </Text>
            </Paper>
        );
    }

    return (
        <Box>
            <Paper
                p="xl"
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
                }}
            >
                {/* Header */}
                <Group justify="space-between" mb="xl">
                    <div>
                        <Title order={2} style={{ color: "#1F3A5F", fontSize: "2rem", fontWeight: 700 }}>
                            Profil
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            Shaxsiy ma'lumotlaringizni ko'ring va tahrirlang
                        </Text>
                    </div>
                    {!isEditing ? (
                        <Button
                            leftSection={<IconPencil size={16} />}
                            onClick={() => {
                                setIsEditing(true);
                                setFormData({
                                    fullname: profile.fullname,
                                    username: profile.username,
                                    password: "",
                                    avatarFile: null,
                                });
                                setErrors({});
                            }}
                            style={{
                                background: "#1F3A5F",
                            }}
                            size="md"
                        >
                            Tahrirlash
                        </Button>
                    ) : (
                        <Button
                            leftSection={<IconX size={16} />}
                            onClick={() => setIsEditing(false)}
                            variant="light"
                            color="red"
                            size="md"
                            style={{ borderRadius: "8px" }}
                        >
                            Bekor qilish
                        </Button>
                    )}
                </Group>

                <Transition
                    mounted={!isEditing}
                    transition="fade"
                    duration={400}
                    timingFunction="ease"
                >
                    {(styles) => (
                        <div style={styles}>
                            {/* Profile Header */}
                            <Card
                                p="xl"
                                mb="xl"
                                style={{
                                    background: "linear-gradient(135deg, #1F3A5F 0%, #2a5a8f 100%)",
                                    border: "none",
                                }}
                            >
                                <Group wrap="nowrap">
                                    <Avatar
                                        src={profile.avatarUrl}
                                        size={120}
                                        radius="xl"
                                        style={{
                                            border: "4px solid white",
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                                        }}
                                    >
                                        {getInitials(profile.fullname)}
                                    </Avatar>
                                    <Stack gap="xs">
                                        <Title order={2} c="white" style={{ fontSize: "1.75rem" }}>
                                            {profile.fullname}
                                        </Title>
                                        <Group gap="xs">
                                            <IconUser size={16} color="rgba(255,255,255,0.8)" />
                                            <Text size="sm" c="rgba(255,255,255,0.9)">
                                                @{profile.username}
                                            </Text>
                                        </Group>
                                        <Badge
                                            size="lg"
                                            variant="light"
                                            color={profile.isActive ? "green" : "gray"}
                                            leftSection={profile.isActive ? <IconCheck size={14} /> : null}
                                            style={{ borderRadius: "6px" }}
                                        >
                                            {profile.isActive ? "Faol" : "Nofaol"}
                                        </Badge>
                                    </Stack>
                                </Group>
                            </Card>

                            {/* Detailed Information */}
                            <Grid gutter="lg">
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <Paper p="lg">
                                        <Stack gap="lg">
                                            <Group wrap="nowrap">
                                                <ThemeIcon
                                                    size={48}
                                                    variant="light"
                                                    style={{ background: "rgba(31, 58, 95, 0.1)", color: "#1F3A5F" }}
                                                >
                                                    <IconShield size={24} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                                        Rol
                                                    </Text>
                                                    <Text size="lg" fw={600} style={{ color: "#1F3A5F" }}>
                                                        {profile.role.name || "Belgilanmagan"}
                                                    </Text>
                                                </div>
                                            </Group>

                                            <Divider />

                                            <Group wrap="nowrap">
                                                <ThemeIcon
                                                    size={48}
                                                    variant="light"
                                                    style={{ background: "rgba(31, 58, 95, 0.1)", color: "#1F3A5F" }}
                                                >
                                                    <IconBuilding size={24} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                                        Bo'lim
                                                    </Text>
                                                    <Text size="lg" fw={600} style={{ color: "#1F3A5F" }}>
                                                        {profile.department?.name || "Belgilanmagan"}
                                                    </Text>
                                                </div>
                                            </Group>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <Paper p="lg">
                                        <Stack gap="lg">
                                            <Group wrap="nowrap">
                                                <ThemeIcon
                                                    size={48}
                                                    variant="light"
                                                    style={{ background: "rgba(31, 58, 95, 0.1)", color: "#1F3A5F" }}
                                                >
                                                    <IconClock size={24} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                                        Oxirgi kirish
                                                    </Text>
                                                    <Text size="lg" fw={600} style={{ color: "#1F3A5F" }}>
                                                        {formatDate(profile.lastLogin)}
                                                    </Text>
                                                </div>
                                            </Group>

                                            <Divider />

                                            <Group wrap="nowrap">
                                                <ThemeIcon
                                                    size={48}
                                                    variant="light"
                                                    style={{ background: "rgba(31, 58, 95, 0.1)", color: "#1F3A5F" }}
                                                >
                                                    <IconCalendar size={24} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                                        Ro'yxatdan o'tgan
                                                    </Text>
                                                    <Text size="lg" fw={600} style={{ color: "#1F3A5F" }}>
                                                        {formatDate(profile.createdAt)}
                                                    </Text>
                                                </div>
                                            </Group>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                            </Grid>

                            {/* System Information */}
                            <Paper
                                p="lg"
                                mt="xl"
                                style={{
                                    background: "linear-gradient(135deg, rgba(31, 58, 95, 0.05) 0%, rgba(31, 58, 95, 0.1) 100%)",
                                }}
                            >
                                <Text size="sm" fw={700} mb="md" style={{ color: "#1F3A5F" }}>
                                    Tizim ma'lumotlari
                                </Text>
                                <Grid gutter="sm">
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Text size="sm">
                                            <Text span c="dimmed">
                                                ID:
                                            </Text>{" "}
                                            <Text span ff="monospace" size="xs">
                                                {profile.id}
                                            </Text>
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Text size="sm">
                                            <Text span c="dimmed">
                                                Yangilangan:
                                            </Text>{" "}
                                            {formatDate(profile.updatedAt)}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            </Paper>
                        </div>
                    )}
                </Transition>

                <Transition
                    mounted={isEditing}
                    transition="fade"
                    duration={400}
                    timingFunction="ease"
                >
                    {(styles) => (
                        <div style={styles}>
                            <Stack gap="lg">
                                {/* Current Avatar Preview */}
                                <Paper
                                    p="lg"
                                    radius="lg"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(31, 58, 95, 0.05) 0%, rgba(31, 58, 95, 0.1) 100%)",
                                    }}
                                >
                                    <Group>
                                        <Avatar
                                            src={profile.avatarUrl}
                                            size={80}
                                            radius="md"
                                            style={{
                                                border: "3px solid white",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            {getInitials(profile.fullname)}
                                        </Avatar>
                                        <div>
                                            <Text fw={600} style={{ color: "#1F3A5F" }}>
                                                Joriy avatar
                                            </Text>
                                            <Text size="sm" c="dimmed">
                                                Yangi avatar yuklash uchun quyidagi formadan foydalaning
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>

                                {/* Edit Form */}
                                <Grid gutter="lg">
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            label="To'liq ism"
                                            placeholder="To'liq ismingizni kiriting"
                                            size="md"
                                            radius="md"
                                            value={formData.fullname}
                                            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                            error={errors.fullname}
                                            styles={{
                                                label: { color: "#1F3A5F", fontWeight: 600, marginBottom: "8px" },
                                            }}
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            label="Username"
                                            placeholder="Username kiriting"
                                            size="md"
                                            radius="md"
                                            leftSection={<IconUser size={16} />}
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            error={errors.username}
                                            styles={{
                                                label: { color: "#1F3A5F", fontWeight: 600, marginBottom: "8px" },
                                            }}
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={12}>
                                        <PasswordInput
                                            label="Yangi parol (ixtiyoriy)"
                                            placeholder="Yangi parol kiriting"
                                            size="md"
                                            radius="md"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            error={errors.password}
                                            styles={{
                                                label: { color: "#1F3A5F", fontWeight: 600, marginBottom: "8px" },
                                            }}
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={12}>
                                        <FileInput
                                            label="Profil rasmi"
                                            placeholder="Rasm yuklang"
                                            size="md"
                                            radius="md"
                                            accept="image/png,image/jpeg,image/jpg"
                                            leftSection={<IconUpload size={16} />}
                                            value={formData.avatarFile}
                                            //@ts-ignore
                                            onChange={(file) => setFormData({ ...formData, avatarFile: file })}
                                            description="Profil rasm fayllarni yuklang (≤10MB) (.jpg, .jpeg, .png)"
                                            styles={{
                                                label: { color: "#1F3A5F", fontWeight: 600, marginBottom: "8px" },
                                            }}
                                        />
                                    </Grid.Col>
                                </Grid>

                                {/* Action Buttons */}
                                <Group justify="flex-end" mt="xl">
                                    <Button
                                        variant="light"
                                        color="gray"
                                        size="md"
                                        radius="md"
                                        onClick={() => setIsEditing(false)}
                                        disabled={isSubmitting}
                                    >
                                        Bekor qilish
                                    </Button>
                                    <Button
                                        size="md"
                                        radius="md"
                                        loading={isSubmitting}
                                        style={{
                                            background: "#1F3A5F",
                                        }}
                                        leftSection={<IconCheck size={16} />}
                                        onClick={handleSubmit}
                                    >
                                        Saqlash
                                    </Button>
                                </Group>
                            </Stack>
                        </div>
                    )}
                </Transition>
            </Paper>
        </Box>
    );
}