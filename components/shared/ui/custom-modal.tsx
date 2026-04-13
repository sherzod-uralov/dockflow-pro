"use client";

import * as React from "react";
import { Modal, Button, Text, Group, Box, Stack } from "@mantine/core";
import { colors } from "@/lib/colors";

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full" | "2xl" | "3xl";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  footer?: React.ReactNode;
  trigger?: React.ReactNode;
}

const sizeMap: Record<string, string> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  "2xl": "70rem",
  "3xl": "85rem",
  full: "95vw",
};

export function CustomModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
}: CustomModalProps) {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        title && (
          <Box>
            <Text size="lg" fw={600} c={colors.textPrimary}>
              {title}
            </Text>
            {description && (
              <Text size="sm" c="dimmed" mt={4}>
                {description}
              </Text>
            )}
          </Box>
        )
      }
      size={sizeMap[size] || size}
      radius="sm"
      closeOnClickOutside={closeOnOverlayClick}
      withCloseButton={showCloseButton}
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        header: {
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: 12,
        },
        title: {
          flex: 1,
        },
        close: {
          color: colors.textSecondary,
          "&:hover": {
            backgroundColor: colors.bg,
          },
        },
        body: {
          padding: 16,
          overflowX: "hidden",
          wordBreak: "break-word",
        },
        content: {
          maxHeight: "90vh",
          overflowX: "hidden",
        },
      }}
    >
      {children}
    </Modal>
  );
}

export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Tasdiqlash",
  description = "Bu amalni bajarishni xohlaysizmi?",
  confirmText = "Ha",
  cancelText = "Bekor qilish",
  variant = "default",
  closeOnOverlayClick = true,
  loading = false,
}: Omit<CustomModalProps, "children"> & {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}) {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Text size="lg" fw={600} c={colors.textPrimary}>
          {title}
        </Text>
      }
      size="sm"
      radius="sm"
      closeOnClickOutside={closeOnOverlayClick}
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        header: {
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: 12,
        },
        close: {
          color: colors.textSecondary,
          "&:hover": {
            backgroundColor: colors.bg,
          },
        },
        body: {
          padding: 16,
        },
      }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {description}
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button
            variant="outline"
            size="sm"
            radius="sm"
            onClick={onClose}
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
            {cancelText}
          </Button>
          <Button
            size="sm"
            radius="sm"
            loading={loading}
            onClick={() => {
              onConfirm();
              if (!loading) onClose();
            }}
            style={{
              backgroundColor: variant === "destructive" ? colors.errorDark : colors.primary,
            }}
          >
            {confirmText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function InfoModal({
  isOpen,
  onClose,
  title = "Ma'lumot",
  children,
  okText = "OK",
  closeOnOverlayClick = true,
}: Omit<CustomModalProps, "footer"> & {
  okText?: string;
}) {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Text size="lg" fw={600} c={colors.textPrimary}>
          {title}
        </Text>
      }
      size="md"
      radius="sm"
      closeOnClickOutside={closeOnOverlayClick}
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        header: {
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: 12,
        },
        close: {
          color: colors.textSecondary,
          "&:hover": {
            backgroundColor: colors.bg,
          },
        },
        body: {
          padding: 16,
        },
      }}
    >
      <Stack gap="md">
        {children}
        <Group justify="flex-end">
          <Button
            size="sm"
            radius="sm"
            onClick={onClose}
            style={{ backgroundColor: colors.primary }}
          >
            {okText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
