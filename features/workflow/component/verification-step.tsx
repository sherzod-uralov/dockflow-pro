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
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import { colors } from "@/lib/colors";

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
        <Paper p="lg" radius="sm" withBorder style={{ borderColor: colors.border }}>
            <Stack gap="md">
                <Box>
                    <Text size="lg" fw={600} c={colors.textPrimary} mb={4}>
                        Ishni tasdiqlash
                    </Text>
                    <Text size="sm" c="dimmed">
                        Ish bajarilganligini tasdiqlovchi fayllar (rasm yoki hujjat) va izoh qoldiring
                    </Text>
                </Box>

                {/* File Upload Area */}
                {/* File Upload Area */}
                <Box>
                    <Text size="sm" fw={500} mb="xs">Fayllar ({files.length}/10)</Text>

                    <Dropzone
                        onDrop={handleFileChange}
                        onReject={(files) => notifications.show({
                            message: "Fayl yuklashda xatolik yuz berdi. Hajmi 50MB dan oshmasligi va ruxsat etilgan formatda bo'lishi kerak.",
                            color: "red"
                        })}
                        maxSize={50 * 1024 ** 2}
                        accept={[
                            ...IMAGE_MIME_TYPE,
                            ...PDF_MIME_TYPE,
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'video/webm',
                            'application/vnd.apple.mpegurl',
                            'application/x-mpegURL'
                        ]}
                        maxFiles={10}
                        disabled={files.length >= 10}
                        styles={(theme) => ({
                            root: {
                                borderColor: theme.colors.gray[4],
                                borderStyle: 'dashed',
                                borderWidth: 1,
                                backgroundColor: files.length >= 10 ? theme.colors.gray[0] : 'transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: theme.colors.blue[4],
                                    backgroundColor: theme.colors.blue[0],
                                }
                            },
                            inner: {
                                pointerEvents: 'none',
                            }
                        })}
                    >
                        <Group justify="center" gap="md" mih={100} style={{ pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <IconUpload
                                    style={{ width: 40, height: 40, color: 'var(--mantine-color-blue-6)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{ width: 40, height: 40, color: 'var(--mantine-color-red-6)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <ThemeIcon size={46} radius="md" variant="light" color="gray.5">
                                    <IconUpload size={26} stroke={1.5} />
                                </ThemeIcon>
                            </Dropzone.Idle>

                            <Box>
                                <Text size="sm" fw={500} inline ta="center" c="dark.3">
                                    Fayllarni yuklash uchun bosing yoki tashlang
                                </Text>
                                <Text size="xs" c="dimmed" inline mt={4} ta="center">
                                    PDF, Word, Rasm, WebM va HLS (maks 50MB)
                                </Text>
                            </Box>
                        </Group>
                    </Dropzone>

                    {files.length > 0 && (
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs" mt="md">
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
                                            color={
                                                file.type.startsWith("image/") ? "blue" :
                                                    file.type === "application/pdf" ? "red" :
                                                        file.type.includes("word") ? "blue" :
                                                            file.type.includes("video") ? "grape" : "gray"
                                            }
                                        >
                                            {file.type.startsWith("image/") ? <IconPhoto size={20} /> : <IconFile size={20} />}
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
                    style={{ backgroundColor: colors.primary }}
                >
                    Tasdiqlash va yuborish
                </Button>
            </Stack>
        </Paper>
    );
};
