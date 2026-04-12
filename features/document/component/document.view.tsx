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
  IconHistory,
} from "@tabler/icons-react";
import { useGetDocumentById } from "@/features/document";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import DocumentHistoryView from "./document-history.view";
import { useGetAllWorkflows, useDownloadDocument } from "@/features/workflow";
import DocumentStepper from "@/features/document/component/document.stepper";
import { formatDate } from "@/lib/date-utils";
import { DOCUMENT_STATUS, getStatusConfig, colors } from "@/lib/colors";


// Status Badge - memo bilan optimizatsiya
export const StatusBadge = memo(({ status }: { status: string }) => {
  const iconMap: Record<string, typeof IconClock> = {
    DRAFT: IconClock,
    PENDING: IconClock,
    IN_REVIEW: IconClock,
    APPROVED: IconCheck,
    REJECTED: IconAlertCircle,
    ARCHIVED: IconAlertCircle,
    PUBLISHED: IconCheck,
  };

  const cfg = getStatusConfig(DOCUMENT_STATUS, status);
  const Icon = iconMap[status] || IconAlertCircle;

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
        color: colors.primary,
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
      backgroundColor: colors.bg,
      borderRadius: 4,
    }}
  >
    <ThemeIcon
      size="md"
      radius="xl"
      variant="light"
      style={{ backgroundColor: colors.border, color: colors.textSecondary }}
    >
      {icon}
    </ThemeIcon>
    <Box style={{ flex: 1, minWidth: 0 }}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} c={colors.textPrimary} lineClamp={1}>
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
  const historyModal = useModal();

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
          <Box pb="md" style={{ borderBottom: "1px solid ${colors.border}" }}>
            <Text size="lg" fw={600} c={colors.textPrimary} mb={4}>
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
          </SimpleGrid>

          {/* Yaratuvchi va sanalar */}
          <Box pt="md" style={{ borderTop: "1px solid ${colors.border}" }}>
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
            <Box pt="md" style={{ borderTop: "1px solid ${colors.border}" }}>
              <Group justify="space-between" mb="sm">
                <Group gap="xs">
                  <IconFileText size={16} color="#868e96" />
                  <Text size="sm" fw={600} c={colors.textPrimary}>
                    Biriktirilgan fayllar
                  </Text>
                </Group>
                <Button
                  size="xs"
                  radius="sm"
                  variant="light"
                  leftSection={<IconHistory size={14} />}
                  onClick={historyModal.openModal}
                  styles={{
                    root: {
                      backgroundColor: "#f0f4ff",
                      color: colors.primary,
                      "&:hover": { backgroundColor: "#dbe4ff" },
                    },
                  }}
                >
                  Tarix va versiyalar
                </Button>
              </Group>

              <Stack gap="xs">
                {data.attachments.map((file: any) => (
                  <Paper
                    key={file.id}
                    p="sm"
                    radius="sm"
                    withBorder
                    style={{ borderColor: colors.border }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                        <ThemeIcon
                          size="sm"
                          radius="sm"
                          variant="light"
                          style={{ backgroundColor: colors.border, color: colors.primary }}
                        >
                          <IconFileText size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500} c={colors.textPrimary} lineClamp={1}>
                          {file.fileName}
                        </Text>
                      </Group>

                      <Group gap="xs" wrap="nowrap">
                        {(data.status === "DRAFT" || data.status === "REJECTED") && (
                          <Button
                            size="xs"
                            radius="sm"
                            variant="filled"
                            style={{ backgroundColor: colors.primary }}
                            onClick={() =>
                              router.push(
                                `/document-edit?id=${data.primaryAttachment?.id || file.id}&documentId=${data.id}`
                              )
                            }
                          >
                            Tahrirlash
                          </Button>
                        )}
                        {data.status !== "DRAFT" && data.status !== "REJECTED" && (
                          <Button
                            size="xs"
                            radius="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/pdf/${data.id}?action=read`)
                            }
                            styles={{
                              root: {
                                borderColor: colors.border,
                                color: colors.textSecondary,
                                "&:hover": { backgroundColor: colors.bg },
                              },
                            }}
                          >
                            Ko'rish
                          </Button>
                        )}
                        <Button
                          size="xs"
                          radius="sm"
                          variant="outline"
                          leftSection={<IconDownload size={14} />}
                          onClick={handleDownloadPdf}
                          loading={downloadMutation.isLoading}
                          styles={{
                            root: {
                              borderColor: colors.border,
                              color: colors.textSecondary,
                              "&:hover": {
                                backgroundColor: colors.bg,
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

      <CustomModal
        size="3xl"
        title="Hujjat tarixi"
        description="Versiyalar va vaqt chizig'i"
        isOpen={historyModal.isOpen}
        onClose={historyModal.closeModal}
      >
        <DocumentHistoryView documentId={id} />
      </CustomModal>
    </Stack>
  );
};

export default DocumentView;
