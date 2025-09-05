"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ModalState, ModalSize } from "@/types/modal";

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

export function useAdvancedModal(
  options: AdvancedModalOptions = {},
): ModalState & {
  setOptions: (newOptions: Partial<AdvancedModalOptions>) => void;
  options: AdvancedModalOptions;
} {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] =
    useState<AdvancedModalOptions>(options);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const openModal = useCallback(() => {
    // Store current active element for focus restoration
    if (modalOptions.restoreFocus !== false) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    setIsOpen(true);
    modalOptions.onOpen?.();
  }, [modalOptions]);

  const closeModal = useCallback(() => {
    // Check if close is prevented
    if (modalOptions.preventClose && modalOptions.preventClose()) {
      return;
    }

    setIsOpen(false);
    modalOptions.onClose?.();

    // Restore focus to previous element
    if (modalOptions.restoreFocus !== false && previousActiveElement.current) {
      setTimeout(() => {
        previousActiveElement.current?.focus();
      }, 100);
    }
  }, [modalOptions]);

  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isOpen, openModal, closeModal]);

  const setOptions = useCallback(
    (newOptions: Partial<AdvancedModalOptions>) => {
      setModalOptions((prev) => ({ ...prev, ...newOptions }));
    },
    [],
  );

  // Handle escape key
  useEffect(() => {
    if (!isOpen || modalOptions.closeOnEscape === false) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeModal, modalOptions.closeOnEscape]);

  // Auto focus management
  useEffect(() => {
    if (isOpen && modalOptions.autoFocus !== false) {
      // Find first focusable element in modal
      setTimeout(() => {
        const modal = document.querySelector('[data-slot="dialog-content"]');
        const focusableElement = modal?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) as HTMLElement;

        focusableElement?.focus();
      }, 100);
    }
  }, [isOpen, modalOptions.autoFocus]);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setOptions,
    options: modalOptions,
  };
}

// Hook for managing multiple modals
export function useModalStack() {
  const [modalStack, setModalStack] = useState<string[]>([]);

  const pushModal = useCallback((modalId: string) => {
    setModalStack((prev) => [...prev, modalId]);
  }, []);

  const popModal = useCallback(() => {
    setModalStack((prev) => prev.slice(0, -1));
    return modalStack[modalStack.length - 1];
  }, [modalStack]);

  const removeModal = useCallback((modalId: string) => {
    setModalStack((prev) => prev.filter((id) => id !== modalId));
  }, []);

  const clearStack = useCallback(() => {
    setModalStack([]);
  }, []);

  const isTopModal = useCallback(
    (modalId: string) => {
      return modalStack[modalStack.length - 1] === modalId;
    },
    [modalStack],
  );

  const getStackSize = useCallback(() => {
    return modalStack.length;
  }, [modalStack]);

  return {
    modalStack,
    pushModal,
    popModal,
    removeModal,
    clearStack,
    isTopModal,
    getStackSize,
  };
}

// Hook for modal with form state
export function useModalWithForm<T extends Record<string, any>>(
  initialState: T,
  options: AdvancedModalOptions = {},
) {
  const modal = useAdvancedModal(options);
  const [formData, setFormData] = useState<T>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const updateFormData = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when field is updated
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const setFormError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  }, [initialState]);

  const openModalWithData = useCallback(
    (data?: Partial<T>) => {
      if (data) {
        setFormData((prev) => ({ ...prev, ...data }));
      }
      modal.openModal();
    },
    [modal],
  );

  const closeModalAndReset = useCallback(() => {
    modal.closeModal();
    resetForm();
  }, [modal, resetForm]);

  return {
    ...modal,
    formData,
    setFormData,
    updateFormData,
    errors,
    setFormError,
    clearErrors,
    isSubmitting,
    setIsSubmitting,
    resetForm,
    openModalWithData,
    closeModalAndReset,
  };
}

// Hook for confirmation modals with async actions
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<{
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    onConfirm?: () => Promise<void> | void;
  }>({});

  const openConfirmation = useCallback(
    (
      confirmConfig: typeof config & { onConfirm: () => Promise<void> | void },
    ) => {
      setConfig(confirmConfig);
      setIsOpen(true);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!config.onConfirm) return;

    try {
      setIsLoading(true);
      await config.onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const handleCancel = useCallback(() => {
    if (isLoading) return; // Prevent closing while loading
    setIsOpen(false);
    setConfig({});
  }, [isLoading]);

  return {
    isOpen,
    isLoading,
    config,
    openConfirmation,
    handleConfirm,
    handleCancel,
  };
}

// Hook for step-by-step modals (wizards)
export function useWizardModal<T extends string>(steps: T[]) {
  const modal = useAdvancedModal();
  const [currentStep, setCurrentStep] = useState<T>(steps[0]);
  const [completedSteps, setCompletedSteps] = useState<Set<T>>(new Set());
  const [stepData, setStepData] = useState<Record<T, any>>(
    {} as Record<T, any>,
  );

  const currentStepIndex = steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  }, [currentStep, currentStepIndex, isLastStep, steps]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  }, [currentStepIndex, isFirstStep, steps]);

  const goToStep = useCallback(
    (step: T) => {
      if (steps.includes(step)) {
        setCurrentStep(step);
      }
    },
    [steps],
  );

  const updateStepData = useCallback((step: T, data: any) => {
    setStepData((prev) => ({ ...prev, [step]: { ...prev[step], ...data } }));
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(steps[0]);
    setCompletedSteps(new Set());
    setStepData({} as Record<T, any>);
  }, [steps]);

  const isStepCompleted = useCallback(
    (step: T) => {
      return completedSteps.has(step);
    },
    [completedSteps],
  );

  return {
    ...modal,
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    goToStep,
    stepData,
    updateStepData,
    resetWizard,
    isStepCompleted,
    completedSteps: Array.from(completedSteps),
  };
}
