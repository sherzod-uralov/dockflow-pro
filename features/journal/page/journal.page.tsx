"use client";
import React from "react";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { ModalState } from "@/types/modal";
import RoleForm from "@/features/admin/roles/component/role.form";
import JournalForm from "@/features/journal/component/journal-form";
const JournalPage = () => {
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const viewModal: ModalState = useModal();
  const [search, debouncedSearch, setSearch] = useDebounce("", 500);

  return (
    <>
      <UserToolbar
        createLabel="Ro'l qo'shish"
        onCreate={() => createModal.openModal()}
        filterLabel="Filtrlash"
        searchPlaceholder="Ro'llarni qidirish"
        searchQuery={search}
        onSearch={setSearch}
      />
      <CustomModal
        closeOnOverlayClick={false}
        title="Jurnal qo'shish"
        description="Jurnal qo'shish uchun maydonlar to'ldirilishi kerak"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <JournalForm />
      </CustomModal>
    </>
  );
};

export default JournalPage;
