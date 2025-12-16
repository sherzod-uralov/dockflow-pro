import { useState } from "react";
import {
    Box,
    Button,
    Group,
    Stack,
    Text,
    Textarea,
    FileButton,
    ThemeIcon,
    ActionIcon,
    Paper,
    SimpleGrid,
    Image,
    Center,
} from "@mantine/core";
import {
    IconUpload,
    IconX,
    IconCheck,
    IconFile,
    IconPhoto,
} from "@tabler/icons-react";
import { useVerifyWorkflowStep } from "../hook/workflow.hook";
import { notifications } from "@mantine/notifications";

interface VerificationStepProps {
    stepId: string;
    onSuccess?: () => void;
}

export const VerificationStep = ({ stepId, onSuccess }: VerificationStepProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [comment, setComment] = useState("");
    const verifyMutation = useVerifyWorkflowStep();

    const handleFileChange = (payload: File | File[] | null) => {
        if (!payload) return;

        // Convert to array
        const newFiles = Array.isArray(payload) ? payload : [payload];

        // Validate count
        if (files.length + newFiles.length > 10) {
            notifications.show({
                message: "Eng ko'pi bilan 10 ta fayl yuklashingiz mumkin",
                color: "red",
            });
            return;
        }

        setFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (files.length === 0) {
            notifications.show({
                message: "Kamida bitta fayl yuklashingiz kerak",
                color: "red",
            });
            return;
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        if (comment) {
            formData.append("comment", comment);
        }

        verifyMutation.mutate(
            { id: stepId, formData },
            {
                onSuccess: () => {
                    setFiles([]);
                    setComment("");
                    onSuccess?.();
                },
            }
        );
    };

    const isImage = (file: File) => file.type.startsWith("image/");

    return (
        <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Stack gap="md">
                <Box>
                    <Text size="lg" fw={600} c="#212529" mb={4}>
                        Ishni tasdiqlash
                    </Text>
                    <Text size="sm" c="dimmed">
                        Ish bajarilganligini tasdiqlovchi fayllar (rasm yoki hujjat) va izoh qoldiring
                    </Text>
                </Box>

                {/* File Upload Area */}
                <Box>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>Fayllar ({files.length}/10)</Text>
                        <FileButton onChange={handleFileChange} accept="image/*,application/pdf" multiple>
                            {(props) => (
                                <Button
                                    {...props}
                                    variant="light"
                                    size="xs"
                                    leftSection={<IconUpload size={14} />}
                                >
                                    Fayl yuklash
                                </Button>
                            )}
                        </FileButton>
                    </Group>

                    {files.length > 0 ? (
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                            {files.map((file, index) => (
                                <Paper
                                    key={index}
                                    p="xs"
                                    withBorder
                                    style={{ position: 'relative', overflow: 'hidden' }}
                                >
                                    <Group wrap="nowrap" align="flex-start">
                                        <ThemeIcon
                                            size="lg"
                                            variant="light"
                                            color={isImage(file) ? "blue" : "red"}
                                        >
                                            {isImage(file) ? <IconPhoto size={20} /> : <IconFile size={20} />}
                                        </ThemeIcon>

                                        <Box style={{ flex: 1, overflow: "hidden" }}>
                                            <Text size="sm" truncate>{file.name}</Text>
                                            <Text size="xs" c="dimmed">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </Text>
                                        </Box>

                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                        >
                                            <IconX size={14} />
                                        </ActionIcon>
                                    </Group>

                                    {isImage(file) && (
                                        <Box mt="xs" h={100} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden' }}>
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                h={100}
                                                w="100%"
                                                fit="cover"
                                                alt="preview"
                                            />
                                        </Box>
                                    )}
                                </Paper>
                            ))}
                        </SimpleGrid>
                    ) : (
                        <Paper
                            p="xl"
                            withBorder
                            style={{ borderStyle: 'dashed', backgroundColor: '#f8f9fa' }}
                        >
                            <Center>
                                <Stack align="center" gap="xs">
                                    <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                                        <IconUpload size={24} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed">
                                        Hali hech qanday fayl yuklanmadi
                                    </Text>
                                </Stack>
                            </Center>
                        </Paper>
                    )}
                </Box>

                <Textarea
                    label="Izoh (ixtiyoriy)"
                    placeholder="Ish bo'yicha qo'shimcha ma'lumot..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    minRows={3}
                />

                <Button
                    onClick={handleSubmit}
                    loading={verifyMutation.isLoading}
                    disabled={files.length === 0}
                    fullWidth
                    size="md"
                    leftSection={<IconCheck size={18} />}
                    style={{ backgroundColor: "#1e3a5f" }}
                >
                    Tasdiqlash va yuborish
                </Button>
            </Stack>
        </Paper>
    );
};
