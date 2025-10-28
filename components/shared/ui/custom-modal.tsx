"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl max-h-[90vh]",
  full: "sm:max-w-[95vw] max-h-[95vh]",
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
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  footer,
  trigger,
}: CustomModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn("sm:max-w-[425px]", sizeClasses[size], className)}
        showCloseButton={false}
        onClick={handleOverlayClick}
      >
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute group right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4 group-hover:text-text-on-dark" />
            <span className="sr-only">Close</span>
          </Button>
        )}
        {(title || description) && (
          <DialogHeader className={cn("text-left", headerClassName)}>
            {title && (
              <DialogTitle className="text-xl font-semibold leading-none tracking-tight">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className={cn("flex-1 overflow-auto", contentClassName)}>
          {children}
        </div>
        {footer && (
          <DialogFooter className={cn("gap-2", footerClassName)}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
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
  ...props
}: Omit<CustomModalProps, "children"> & {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
      {...props}
    >
      <div className="py-4"></div>
    </CustomModal>
  );
}

export function InfoModal({
  isOpen,
  onClose,
  title = "Ma'lumot",
  children,
  okText = "OK",
  ...props
}: Omit<CustomModalProps, "footer"> & {
  okText?: string;
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={<Button onClick={onClose}>{okText}</Button>}
      {...props}
    >
      {children}
    </CustomModal>
  );
}
