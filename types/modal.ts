
export interface ModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalContextValue {
  openModal: (id: string, props?: any) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
  getModalProps: (id: string) => any;
}