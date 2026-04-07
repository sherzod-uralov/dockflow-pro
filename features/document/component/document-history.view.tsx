"use client";

import {
  Box,
  Stack,
  Group,
  Text,
  Avatar,
  Paper,
  Loader,
  Center,
  ThemeIcon,
  Badge,
  ScrollArea,
  ActionIcon,
  Tabs,
  SimpleGrid,
  Tooltip,
} from "@mantine/core";
import {
  IconFileText,
  IconUpload,
  IconCheck,
  IconX,
  IconClock,
  IconHistory,
  IconDownload,
  IconUserPlus,
  IconEdit,
  IconPlayerPlay,
  IconPackage,
  IconCircleCheck,
  IconList,
  IconActivity,
} from "@tabler/icons-react";
import { useGetDocumentHistory } from "../hook/document-history.hook";
import {
  TimelineEvent,
  HistoryFileVersion,
} from "../type/document-history.type";

interface DocumentHistoryViewProps {
  documentId: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "—";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

const TIMELINE_ICON_MAP: Record<string, { icon: any; color: string; bg: string }> = {
  DOCUMENT_CREATED: { icon: IconFileText, color: "#1971c2", bg: "#e7f5ff" },
  DOCUMENT_UPDATED: { icon: IconEdit, color: "#f59f00", bg: "#fff9db" },
  FILE_UPLOADED: { icon: IconUpload, color: "#2f9e44", bg: "#ebfbee" },
  WORKFLOW_STARTED: { icon: IconPlayerPlay, color: "#1e3a5f", bg: "#f0f4ff" },
  WORKFLOW_COMPLETED: { icon: IconCircleCheck, color: "#2f9e44", bg: "#ebfbee" },
  STEP_STARTED: { icon: IconClock, color: "#1971c2", bg: "#e7f5ff" },
  STEP_APPROVED: { icon: IconCheck, color: "#2f9e44", bg: "#ebfbee" },
  STEP_REJECTED: { icon: IconX, color: "#e03131", bg: "#fff5f5" },
  STEP_REASSIGNED: { icon: IconUserPlus, color: "#7950f2", bg: "#f3f0ff" },
  AUDIT_UPDATE: { icon: IconActivity, color: "#868e96", bg: "#f8f9fa" },
};

const getEventStyle = (type: string) => {
  return TIMELINE_ICON_MAP[type] || { icon: IconActivity, color: "#868e96", bg: "#f8f9fa" };
};

const TimelineItem = ({ event, isLast }: { event: TimelineEvent; isLast: boolean }) => {
  const style = getEventStyle(event.type);
  const Icon = style.icon;

  return (
    <Group align="flex-start" gap="md" wrap="nowrap" style={{ position: "relative" }}>
      {/* Vertical line */}
      {!isLast && (
        <Box
          style={{
            position: "absolute",
            left: 17,
            top: 36,
            bottom: -12,
            width: 2,
            backgroundColor: "#e9ecef",
          }}
        />
      )}

      {/* Icon */}
      <ThemeIcon
        size={36}
        radius="xl"
        variant="light"
        style={{
          backgroundColor: style.bg,
          color: style.color,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <Icon size={18} />
      </ThemeIcon>

      {/* Content */}
      <Box style={{ flex: 1, minWidth: 0, paddingBottom: 16 }}>
        <Group gap="xs" wrap="nowrap" mb={4}>
          {event.actor && (
            <Avatar size={20} radius="xl" src={event.actor.avatarUrl} color="blue">
              <Text style={{ fontSize: 9, fontWeight: 600 }}>
                {getInitials(event.actor.fullname)}
              </Text>
            </Avatar>
          )}
          <Text size="sm" fw={600} c="#212529" lineClamp={1}>
            {event.title}
          </Text>
        </Group>
        {event.description && (
          <Text size="sm" c="#495057" mb={4} style={{ whiteSpace: "pre-wrap" }}>
            {event.description}
          </Text>
        )}
        <Group gap="xs">
          {event.actor && (
            <Text size="xs" c="dimmed">
              {event.actor.fullname}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            • {formatDate(event.timestamp)}
          </Text>
        </Group>
      </Box>
    </Group>
  );
};

const FileVersionItem = ({ version }: { version: HistoryFileVersion }) => (
  <Paper p="sm" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
    <Group justify="space-between" wrap="nowrap">
      <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
        <ThemeIcon size="sm" radius="sm" variant="light" color="blue">
          <IconFileText size={14} />
        </ThemeIcon>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} c="#212529" lineClamp={1}>
            {version.fileName}
          </Text>
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {formatBytes(version.fileSize)}
            </Text>
            <Text size="xs" c="dimmed">
              • {formatDate(version.createdAt)}
            </Text>
            {version.uploadedBy && (
              <Text size="xs" c="dimmed">
                • {version.uploadedBy.fullname}
              </Text>
            )}
          </Group>
        </Box>
      </Group>
      <Tooltip label="Yuklab olish">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="md"
          component="a"
          href={version.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconDownload size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  </Paper>
);

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  color = "#1e3a5f",
  bg = "#f0f4ff",
}: {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
  bg?: string;
}) => (
  <Paper p="md" radius="sm" style={{ backgroundColor: bg, border: "1px solid #e9ecef" }}>
    <Group gap="xs" mb={4}>
      <Icon size={16} color={color} />
      <Text size="xs" c={color} fw={600} tt="uppercase">
        {label}
      </Text>
    </Group>
    <Text fw={700} c={color} style={{ fontSize: 24, lineHeight: 1.1 }}>
      {value}
    </Text>
  </Paper>
);

export const DocumentHistoryView = ({ documentId }: DocumentHistoryViewProps) => {
  const { data, isLoading } = useGetDocumentHistory(documentId);

  if (isLoading) {
    return (
      <Center py={60}>
        <Loader color="#1e3a5f" />
      </Center>
    );
  }

  if (!data) {
    return (
      <Center py={60}>
        <Stack align="center" gap="md">
          <ThemeIcon size={56} radius="md" variant="light" color="gray">
            <IconHistory size={28} />
          </ThemeIcon>
          <Text c="dimmed">Tarix topilmadi</Text>
        </Stack>
      </Center>
    );
  }

  const fileVersionGroups = Object.entries(data.fileVersions || {});
  const timeline = data.timeline || [];

  return (
    <Stack gap="lg">
      {/* Summary cards */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <SummaryCard
          icon={IconPackage}
          label="Versiyalar"
          value={data.summary.totalVersions}
          color="#1e3a5f"
          bg="#f0f4ff"
        />
        <SummaryCard
          icon={IconList}
          label="Bosqichlar"
          value={data.summary.totalSteps}
          color="#2f9e44"
          bg="#ebfbee"
        />
        <SummaryCard
          icon={IconActivity}
          label="Harakatlar"
          value={data.summary.totalActions}
          color="#f59f00"
          bg="#fff9db"
        />
        <SummaryCard
          icon={IconPlayerPlay}
          label="Aylanmalar"
          value={data.summary.workflowsCount}
          color="#7950f2"
          bg="#f3f0ff"
        />
      </SimpleGrid>

      {/* Tabs: Timeline / Versions */}
      <Tabs defaultValue="timeline" radius="sm">
        <Tabs.List mb="md">
          <Tabs.Tab value="timeline" leftSection={<IconHistory size={16} />}>
            Vaqt chizig'i
          </Tabs.Tab>
          <Tabs.Tab value="versions" leftSection={<IconFileText size={16} />}>
            Fayl versiyalari
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="timeline">
          <ScrollArea h={500}>
            {timeline.length === 0 ? (
              <Center py="xl">
                <Text size="sm" c="dimmed">
                  Hech qanday hodisa topilmadi
                </Text>
              </Center>
            ) : (
              <Stack gap={0} pl="xs">
                {timeline.map((event, idx) => (
                  <TimelineItem
                    key={`${event.type}-${event.timestamp}-${idx}`}
                    event={event}
                    isLast={idx === timeline.length - 1}
                  />
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="versions">
          <ScrollArea h={500}>
            {fileVersionGroups.length === 0 ? (
              <Center py="xl">
                <Text size="sm" c="dimmed">
                  Fayl versiyalari topilmadi
                </Text>
              </Center>
            ) : (
              <Stack gap="lg">
                {fileVersionGroups.map(([mimeType, versions]) => (
                  <Box key={mimeType}>
                    <Group gap="xs" mb="xs">
                      <Text size="sm" fw={600} c="#495057" tt="uppercase">
                        {mimeType.includes("pdf")
                          ? "PDF fayllar"
                          : mimeType.includes("word") || mimeType.includes("docx")
                            ? "Word fayllar"
                            : mimeType.split("/").pop()}
                      </Text>
                      <Badge size="sm" variant="light" color="gray">
                        {versions.length} ta
                      </Badge>
                    </Group>
                    <Stack gap="xs">
                      {versions.map((v) => (
                        <FileVersionItem key={v.id} version={v} />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default DocumentHistoryView;
