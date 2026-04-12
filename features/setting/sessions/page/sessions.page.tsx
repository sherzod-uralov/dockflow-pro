"use client";

import { useState } from "react";
import {
  Paper,
  Text,
  Group,
  Button,
  Badge,
  Stack,
  Box,
  Container,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconBrandChrome,
  IconBrandFirefox,
  IconBrandSafari,
  IconBrandEdge,
  IconBrandOpera,
  IconBrandWindows,
  IconBrandApple,
  IconBrandUbuntu,
  IconBrandAndroid,
  IconWorld,
  IconLogout,
  IconShield,
  IconClock,
  IconX,
} from "@tabler/icons-react";
import {
  useGetAllSessions,
  useDeleteSession,
  useRevokeAllSessions,
} from "@/features/sessions/hook/sessions.hook";
import { ConfirmationModal, useModal } from "@/components/shared/ui/custom-modal";
import { SessionGetResponse } from "@/features/sessions/type/sessions.type";
import { formatDate } from "@/lib/date-utils";

const getDeviceIcon = (device?: string) => {
  switch (device) {
    case "Mobile":
      return IconDeviceMobile;
    case "Tablet":
      return IconDeviceTablet;
    default:
      return IconDeviceDesktop;
  }
};

const getBrowserIcon = (browser?: string) => {
  switch (browser) {
    case "Chrome":
      return IconBrandChrome;
    case "Firefox":
      return IconBrandFirefox;
    case "Safari":
      return IconBrandSafari;
    case "Edge":
      return IconBrandEdge;
    case "Opera":
      return IconBrandOpera;
    default:
      return IconWorld;
  }
};

const getOSIcon = (os?: string) => {
  switch (os) {
    case "Windows":
      return IconBrandWindows;
    case "macOS":
    case "iOS":
      return IconBrandApple;
    case "Linux":
      return IconBrandUbuntu;
    case "Android":
      return IconBrandAndroid;
    default:
      return IconWorld;
  }
};


const SessionCard = ({
  session,
  onRevoke,
}: {
  session: SessionGetResponse;
  onRevoke: (id: string) => void;
}) => {
  const DeviceIcon = getDeviceIcon(session.device);
  const BrowserIcon = getBrowserIcon(session.browser);
  const OSIcon = getOSIcon(session.os);
  const isCurrent = !!session.isCurrent;

  return (
    <Paper
      p="md"
      radius="sm"
      withBorder
      style={{
        borderColor: isCurrent ? "#2ecc71" : "#e9ecef",
        backgroundColor: isCurrent ? "#f0fdf4" : "#fff",
      }}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          {/* Device icon */}
          <ThemeIcon
            size={48}
            radius="md"
            variant="light"
            color={isCurrent ? "green" : "gray"}
            style={{ flexShrink: 0 }}
          >
            <DeviceIcon size={24} />
          </ThemeIcon>

          {/* Info */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" mb={4}>
              <Text size="md" fw={600} c="#212529">
                {session.browser || "Noma'lum brauzer"}
              </Text>
              <Text size="sm" c="dimmed">
                •
              </Text>
              <Text size="sm" c="dimmed">
                {session.os || "Noma'lum OS"}
              </Text>
              {isCurrent && (
                <Badge
                  size="sm"
                  variant="light"
                  color="green"
                  leftSection={<IconShield size={10} />}
                >
                  Hozirgi qurilma
                </Badge>
              )}
            </Group>

            <Group gap="xs" mb={2}>
              <BrowserIcon size={14} color="#868e96" />
              <OSIcon size={14} color="#868e96" />
              <Text size="xs" c="dimmed">
                {session.device || "Desktop"}
              </Text>
            </Group>

            {session.ipAddress && (
              <Group gap={6} mt={4}>
                <IconWorld size={12} color="#adb5bd" />
                <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
                  {session.ipAddress}
                </Text>
              </Group>
            )}

            <Group gap={6} mt={2}>
              <IconClock size={12} color="#adb5bd" />
              <Text size="xs" c="dimmed">
                Yaratilgan: {formatDate(session.createdAt)}
              </Text>
            </Group>

            {session.expiresAt && (
              <Group gap={6} mt={2}>
                <IconClock size={12} color="#adb5bd" />
                <Text size="xs" c="dimmed">
                  Tugaydi: {formatDate(session.expiresAt)}
                </Text>
              </Group>
            )}
          </Box>
        </Group>

        {/* Actions */}
        {!isCurrent && (
          <Tooltip label="Sessiyani bekor qilish">
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              radius="sm"
              onClick={() => onRevoke(session.id)}
            >
              <IconX size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Paper>
  );
};

export default function SessionsPage() {
  const { data: sessionsData, isLoading } = useGetAllSessions({ pageSize: 100 });
  const deleteSession = useDeleteSession();
  const revokeAll = useRevokeAllSessions();

  const revokeModal = useModal();
  const revokeAllModal = useModal();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const sessions = sessionsData?.data || [];
  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  const handleRevokeClick = (id: string) => {
    setSelectedSessionId(id);
    revokeModal.openModal();
  };

  const confirmRevoke = () => {
    if (selectedSessionId) {
      deleteSession.mutate(selectedSessionId, {
        onSuccess: () => {
          revokeModal.closeModal();
          setSelectedSessionId(null);
        },
      });
    }
  };

  const confirmRevokeAll = () => {
    revokeAll.mutate(undefined, {
      onSuccess: () => {
        revokeAllModal.closeModal();
      },
    });
  };

  return (
    <Container size="lg" py="md">
      <Stack gap="xl">
        {/* Header */}
        <Paper
          p="lg"
          radius="sm"
          withBorder
          style={{ borderColor: "#e9ecef" }}
        >
          <Group justify="space-between" wrap="wrap">
            <Group gap="md">
              <ThemeIcon
                size={48}
                radius="md"
                variant="light"
                color="blue"
              >
                <IconShield size={24} />
              </ThemeIcon>
              <Box>
                <Text size="lg" fw={600} c="#212529">
                  Faol sessiyalar
                </Text>
                <Text size="sm" c="dimmed">
                  Hisobingizga ulangan barcha qurilmalarni boshqaring
                </Text>
              </Box>
            </Group>
            {otherSessions.length > 0 && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={revokeAllModal.openModal}
                radius="sm"
                size="sm"
              >
                Boshqa sessiyalardan chiqish
              </Button>
            )}
          </Group>
        </Paper>

        {/* Loading */}
        {isLoading ? (
          <Center py="xl">
            <Loader color="#1e3a5f" />
          </Center>
        ) : sessions.length === 0 ? (
          <Paper p="xl" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Center>
              <Stack align="center" gap="xs">
                <ThemeIcon size={48} radius="md" variant="light" color="gray">
                  <IconShield size={24} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">
                  Faol sessiyalar topilmadi
                </Text>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack gap="md">
            {/* Current session — birinchi */}
            {currentSession && (
              <Box>
                <Text
                  size="xs"
                  fw={600}
                  c="#868e96"
                  tt="uppercase"
                  mb="xs"
                >
                  Hozirgi sessiya
                </Text>
                <SessionCard
                  session={currentSession}
                  onRevoke={handleRevokeClick}
                />
              </Box>
            )}

            {/* Other sessions */}
            {otherSessions.length > 0 && (
              <Box>
                <Text
                  size="xs"
                  fw={600}
                  c="#868e96"
                  tt="uppercase"
                  mb="xs"
                >
                  Boshqa sessiyalar ({otherSessions.length})
                </Text>
                <Stack gap="sm">
                  {otherSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onRevoke={handleRevokeClick}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Stack>

      {/* Revoke single confirmation */}
      <ConfirmationModal
        title="Sessiyani bekor qilish"
        description="Ushbu sessiya darhol bekor qilinadi va qurilma tizimdan chiqariladi. Davom etamizmi?"
        isOpen={revokeModal.isOpen}
        onClose={revokeModal.closeModal}
        onConfirm={confirmRevoke}
      />

      {/* Revoke all confirmation */}
      <ConfirmationModal
        title="Barcha boshqa sessiyalardan chiqish"
        description="Hozirgi qurilmadan tashqari barcha sessiyalar bekor qilinadi. Boshqa qurilmalar tizimdan chiqariladi. Davom etamizmi?"
        isOpen={revokeAllModal.isOpen}
        onClose={revokeAllModal.closeModal}
        onConfirm={confirmRevokeAll}
      />
    </Container>
  );
}
