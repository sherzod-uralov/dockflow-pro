"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Text,
  Badge,
  Paper,
  Group,
  Stack,
  SimpleGrid,
  Skeleton,
  Button,
  ThemeIcon,
} from "@mantine/core";
import {
  IconFileText,
  IconDownload,
  IconUser,
  IconCalendar,
  IconCheck,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useGetDocumentById } from "@/features/document";
import { useGetAllWorkflows, useDownloadDocument } from "@/features/workflow";
import DocumentStepper from "@/features/document/component/document.stepper";

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Ma'lumot yo'q";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Ma'lumot yo'q";
    }

    return new Intl.DateTimeFormat("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return "Ma'lumot yo'q";
  }
};

// Status Badge - memo bilan optimizatsiya
export const StatusBadge = memo(({ status }: { status: string }) => {
  const config: Record<string, { label: string; bg: string; color: string; icon: typeof IconClock }> = {
    DRAFT: {
      label: "Tayyorlanmoqda",
      bg: "#f1f3f5",
      color: "#495057",
      icon: IconClock
    },
    PENDING: {
      label: "Jarayonda",
      bg: "#fff3bf",
      color: "#e67700",
      icon: IconClock
    },
    IN_REVIEW: {
      label: "Tekshiruvda",
      bg: "#d0ebff",
      color: "#1971c2",
      icon: IconClock
    },
    APPROVED: {
      label: "Tasdiqlangan",
      bg: "#d3f9d8",
      color: "#2b8a3e",
      icon: IconCheck
    },
    REJECTED: {
      label: "Bekor qilingan",
      bg: "#ffe3e3",
      color: "#c92a2a",
      icon: IconAlertCircle
    },
    ARCHIVED: {
      label: "Arxiv",
      bg: "#e9ecef",
      color: "#868e96",
      icon: IconAlertCircle
    },
    PUBLISHED: {
      label: "Chop etilgan",
      bg: "#d3f9d8",
      color: "#2b8a3e",
      icon: IconCheck
    },
  };

  const cfg = config[status] || { label: status, bg: "#f1f3f5", color: "#495057", icon: IconAlertCircle };
  const Icon = cfg.icon;

  return (
    <Badge
      size="md"
      radius="sm"
      variant="filled"
      leftSection={<Icon size={12} />}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        textTransform: "none",
      }}
    >
      {cfg.label}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";



// Info Field komponenti
const InfoField = ({ label, value, style = {} }: { label: string; value: any; style?: any }) => (
  <Box style={{ minWidth: 0, ...style }}>
    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
      {label}
    </Text>
    <Text
      size="sm"
      fw={500}
      style={{
        color: "#1F3A5F",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "normal"
      }}
    >
      {value}
    </Text>
  </Box>
);

InfoField.displayName = "InfoField";

// Info Card komponenti
const InfoCard = memo(({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Group
    gap="sm"
    p="sm"
    style={{
      backgroundColor: "#f8f9fa",
      borderRadius: 4,
    }}
  >
    <ThemeIcon
      size="md"
      radius="xl"
      variant="light"
      style={{ backgroundColor: "#e9ecef", color: "#495057" }}
    >
      {icon}
    </ThemeIcon>
    <Box style={{ flex: 1, minWidth: 0 }}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} c="#212529" lineClamp={1}>
        {value || "—"}
      </Text>
    </Box>
  </Group>
));

InfoCard.displayName = "InfoCard";

// Loading skeleton
const DocumentViewSkeleton = () => (
  <Stack gap="lg">
    <Skeleton height={60} radius="sm" />
    <SimpleGrid cols={{ base: 2, md: 3 }} spacing="md">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={50} radius="sm" />
      ))}
    </SimpleGrid>
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height={60} radius="sm" />
      ))}
    </SimpleGrid>
  </Stack>
);

const DocumentView = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data: workflow } = useGetAllWorkflows({
    documentId: id,
  });
  const { data, isLoading, isFetching } = useGetDocumentById(id);
  const downloadMutation = useDownloadDocument();

  const handleDownloadPdf = () => {
    if (data?.id) {
      downloadMutation.mutate({
        documentId: data.id,
        filename: `${data.title || "document"}.pdf`,
      });
    }
  };

  if (isLoading || isFetching) {
    return <DocumentViewSkeleton />;
  }

  return (
    <Stack gap="lg">
      {workflow?.data && workflow.data.length > 0 && (
        <DocumentStepper workflow={workflow.data} />
      )}

      {data && (
        <>
          <Box pb="md" style={{ borderBottom: "1px solid #e9ecef" }}>
            <Text size="lg" fw={600} c="#212529" mb={4}>
              {data.title}
            </Text>
            {data.description && (
              <Text size="sm" c="dimmed">
                {data.description}
              </Text>
            )}
          </Box>
          <SimpleGrid cols={{ base: 2, md: 3 }} spacing="md">
            <InfoField label="Hujjat raqami" value={data.documentNumber || "—"} />
            <InfoField label="Hujjat turi" value={data.documentType?.name || "—"} />
            <InfoField label="Jurnal" value={data.journal?.name || "—"} />
            <InfoField label="Holati" value={<StatusBadge status={data.status} />} />
            <InfoField
              label="Versiya"
              value={
                <Badge
                  size="md"
                  radius="sm"
                  variant="light"
                  style={{
                    backgroundColor: "#e9ecef",
                    color: "#1e3a5f",
                    fontFamily: "monospace",
                  }}
                >
                  v{data.versions || 0}
                </Badge>
              }
            />
          </SimpleGrid>

          {/* Yaratuvchi va sanalar */}
          <Box pt="md" style={{ borderTop: "1px solid #e9ecef" }}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
              <InfoCard
                icon={<IconUser size={14} />}
                label="Yaratuvchi"
                value={data.createdBy?.fullname || "—"}
              />
              <InfoCard
                icon={<IconCalendar size={14} />}
                label="Yaratilgan sana"
                value={formatDate(data.createdAt)}
              />
              {data.updatedAtBy && (
                <InfoCard
                  icon={<IconUser size={14} />}
                  label="Oxirgi o'zgartiruvchi"
                  value={data.updatedAtBy?.fullname || "—"}
                />
              )}
              <InfoCard
                icon={<IconCalendar size={14} />}
                label="Yangilangan sana"
                value={formatDate(data.updatedAt)}
              />
            </SimpleGrid>
          </Box>

          {/* Biriktirilgan fayllar */}
          {data.attachments && data.attachments.length > 0 && (
            <Box pt="md" style={{ borderTop: "1px solid #e9ecef" }}>
              <Group gap="xs" mb="sm">
                <IconFileText size={16} color="#868e96" />
                <Text size="sm" fw={600} c="#212529">
                  Biriktirilgan fayllar
                </Text>
                <Badge
                  size="sm"
                  radius="sm"
                  variant="light"
                  style={{ backgroundColor: "#e9ecef", color: "#495057" }}
                >
                  {data.attachments.length}
                </Badge>
              </Group>

              <Stack gap="xs">
                {data.attachments.map((file: any) => (
                  <Paper
                    key={file.id}
                    p="sm"
                    radius="sm"
                    withBorder
                    style={{ borderColor: "#e9ecef" }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                        <ThemeIcon
                          size="sm"
                          radius="sm"
                          variant="light"
                          style={{ backgroundColor: "#e9ecef", color: "#1e3a5f" }}
                        >
                          <IconFileText size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500} c="#212529" lineClamp={1}>
                          {file.fileName}
                        </Text>
                      </Group>

                      <Group gap="xs" wrap="nowrap">
                        <Button
                          size="xs"
                          radius="sm"
                          variant="filled"
                          style={{ backgroundColor: "#1e3a5f" }}
                          onClick={() =>
                            router.push(
                              `/document-edit?id=${file.id}&documentId=${data.id}`
                            )
                          }
                        >
                          Tahrirlash
                        </Button>
                        <Button
                          size="xs"
                          radius="sm"
                          variant="outline"
                          leftSection={<IconDownload size={14} />}
                          onClick={handleDownloadPdf}
                          loading={downloadMutation.isLoading}
                          styles={{
                            root: {
                              borderColor: "#e9ecef",
                              color: "#495057",
                              "&:hover": {
                                backgroundColor: "#f8f9fa",
                              },
                            },
                          }}
                        >
                          Yuklab olish
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
};

export default DocumentView;
