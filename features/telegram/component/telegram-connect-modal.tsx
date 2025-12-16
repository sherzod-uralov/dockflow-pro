import { useEffect, useState } from "react";
import { Modal, Stack, Text, Button, ThemeIcon, Alert, CopyButton, ActionIcon, Group, Box, LoadingOverlay } from "@mantine/core";
import { IconBrandTelegram, IconInfoCircle, IconCopy, IconCheck } from "@tabler/icons-react";
import { useTelegramLinkInfo, useTelegramStatus } from "../hook/telegram.hook";
import { QRCodeSVG } from "qrcode.react";

interface TelegramConnectModalProps {
    userId: string;
}

export const TelegramConnectModal = ({ userId }: TelegramConnectModalProps) => {
    const [opened, setOpened] = useState(true);
    const { data: status, isLoading: isStatusLoading } = useTelegramStatus(userId, 3000);
    const isLinked = status?.isLinked ?? false;

    const { data: linkInfo, isLoading: isLinkLoading } = useTelegramLinkInfo(userId, { enabled: !isLinked && !isStatusLoading });

    const isLoading = isStatusLoading || isLinkLoading;

    if (isStatusLoading || isLinked) {
        return null;
    }

    return (
        <Modal
            opened={!isLinked && opened}
            onClose={() => setOpened(false)}
            withCloseButton={true}
            closeOnClickOutside={false}
            closeOnEscape={false}
            centered
            size="xl"
            title={
                <Group gap="xs">
                    <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                        <IconBrandTelegram size={20} />
                    </ThemeIcon>
                    <Text fw={600} size="lg">Telegram hisobni ulash</Text>
                </Group>
            }
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 8,
            }}
        >
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Stack gap="md">
                <Alert icon={<IconInfoCircle size={16} />} title="Diqqat!" color="blue" variant="light">
                    Tizimdan foydalanish uchun Telegram botimizga a'zo bo'lishingiz va hisobingizni tasdiqlashingiz shart.
                </Alert>

                {linkInfo && (
                    <Stack align="center" gap="lg" py="md">
                        <Box p="md" bg="white" style={{ borderRadius: 8, border: "1px solid #dee2e6" }}>
                            <QRCodeSVG
                                value={linkInfo.deepLink}
                                size={180}
                                level="M"
                                includeMargin={true}
                            />
                        </Box>

                        <Text size="sm" ta="center" c="dimmed">
                            Telefoningiz kamerasi orqali QR kodni skanerlang yoki pastdagi tugmani bosing
                        </Text>

                        <Button
                            component="a"
                            href={linkInfo.deepLink}
                            target="_blank"
                            size="lg"
                            fullWidth
                            color="blue"
                            leftSection={<IconBrandTelegram size={24} />}
                        >
                            Telegram orqali ochish
                        </Button>

                        <Box style={{ width: '100%' }}>
                            <Text size="xs" fw={500} mb={4} c="dimmed">Qo'lda ulash uchun kod:</Text>
                            <Group gap={0}>
                                <Box
                                    style={{
                                        flex: 1,
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px 0 0 4px',
                                        padding: '8px 12px',
                                        fontFamily: 'monospace',
                                        backgroundColor: '#f8f9fa',
                                        fontSize: '14px'
                                    }}
                                >
                                    /link {linkInfo.userId}
                                </Box>
                                <CopyButton value={`/link ${linkInfo.userId}`} timeout={2000}>
                                    {({ copied, copy }) => (
                                        <ActionIcon
                                            color={copied ? 'teal' : 'gray'}
                                            onClick={copy}
                                            size={38}
                                            variant="filled"
                                            style={{ borderRadius: '0 4px 4px 0' }}
                                        >
                                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                        </ActionIcon>
                                    )}
                                </CopyButton>
                            </Group>
                        </Box>
                    </Stack>
                )}

                <Text size="xs" c="dimmed" ta="center">
                    Botga a'zo bo'lganingizdan so'ng ushbu oyna avtomatik ravishda yopiladi
                </Text>
            </Stack>
        </Modal>
    );
};
