import React from "react";

export interface ModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalVariant = "default" | "destructive";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export interface CustomModalProps extends BaseModalProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  trigger?: React.ReactNode;
}

export interface ConfirmationModalProps
  extends Omit<BaseModalProps, "children"> {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  loading?: boolean;
}

export interface InfoModalProps extends Omit<BaseModalProps, "footer"> {
  children: React.ReactNode;
  okText?: string;
}

export interface FormModalProps extends BaseModalProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  formId?: string;
}

export interface ModalConfig {
  defaultSize: ModalSize;
  defaultCloseOnOverlayClick: boolean;
  defaultShowCloseButton: boolean;
  animations: {
    enter: string;
    exit: string;
  };
}

export interface ModalContextValue {
  openModal: (id: string, props?: any) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
  getModalProps: (id: string) => any;
}

export interface AdvancedModalOptions {
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventClose?: () => boolean;
  onOpen?: () => void;
  onClose?: () => void;
  autoFocus?: boolean;
  restoreFocus?: boolean;
}

export interface AdvancedModalState extends ModalState {
  setOptions: (newOptions: Partial<AdvancedModalOptions>) => void;
  options: AdvancedModalOptions;
}

export interface ModalStackState {
  modalStack: string[];
  pushModal: (modalId: string) => void;
  popModal: () => string | undefined;
  removeModal: (modalId: string) => void;
  clearStack: () => void;
  isTopModal: (modalId: string) => boolean;
  getStackSize: () => number;
}

export interface ModalWithFormState<T extends Record<string, any>>
  extends ModalState {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  updateFormData: (field: keyof T, value: any) => void;
  errors: Partial<Record<keyof T, string>>;
  setFormError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  resetForm: () => void;
  openModalWithData: (data?: Partial<T>) => void;
  closeModalAndReset: () => void;
}

export interface ConfirmationModalState {
  isOpen: boolean;
  isLoading: boolean;
  config: {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    onConfirm?: () => Promise<void> | void;
  };
  openConfirmation: (config: {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    onConfirm: () => Promise<void> | void;
  }) => void;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
}

export interface WizardModalState<T extends string> extends ModalState {
  currentStep: T;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: T) => void;
  stepData: Record<T, any>;
  updateStepData: (step: T, data: any) => void;
  resetWizard: () => void;
  isStepCompleted: (step: T) => boolean;
  completedSteps: T[];
}
