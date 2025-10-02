"use client";
import React from "react";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { ModalState } from "@/types/modal";
import JournalForm from "@/features/journal/component/journal-form";
import { DataTable } from "@/components/shared/ui/custom-table";
import {
  useDeleteJournal,
  useGetAllJournals,
} from "@/features/journal/hook/journal.hook";
import {
  ActionItem,
  createCopyAction,
  createDeleteAction,
  createEditAction,
  createViewAction,
  CustomAction,
} from "@/components/shared/ui/custom-action";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { SingleJournalApiResponse } from "@/features/journal/types/journal.types";
import { ColumnDef } from "@tanstack/react-table";
import JournalView from "@/features/journal/component/journal-view";
import { usePagination } from "@/hooks/use-pagination";

const JournalPage = () => {
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const viewModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const { pageNumber, pageSize, handlePageSizeChange, handlePageChange } =
    usePagination();
  const [selectedJournal, setSelectedJournal] =
    React.useState<SingleJournalApiResponse | null>(null);

  const [search, debouncedSearch, setSearch] = useDebounce("", 500);

  const { data } = useGetAllJournals({
    search: debouncedSearch,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });
  console.log(data);
  const deleteMutation = useDeleteJournal();
  const confirmDelete = () => {
    if (selectedJournal) {
      deleteMutation.mutate(selectedJournal.id, {
        onSuccess: () => {
          deleteModal.closeModal();
        },
      });
    }
  };
  const columns: ColumnDef<SingleJournalApiResponse>[] = [
    { accessorKey: "name", header: "Jurnal Nomi" },
    { accessorKey: "prefix", header: "Prefix Kodi" },
    { accessorKey: "format", header: "Format" },
    {
      accessorKey: "department",
      header: "Bo'lim",
      cell: ({ row }) => row.original.department.name,
    },
    {
      accessorKey: "responsibleUser",
      header: "Mas'ul",
      cell: ({ row }) => row.original.responsibleUser.username,
    },
    {
      header: "Harakatlar",
      id: "actions",
      cell: ({ row }) => {
        const journal = row.original;
        const actions: ActionItem[] = [
          createViewAction(() => {
            setSelectedJournal(journal);
            viewModal.openModal();
          }),
          createEditAction(() => {
            setSelectedJournal(journal);
            editModal.openModal();
          }),
          createCopyAction(() => handleCopyToClipboard(journal.id, "ID")),
          createDeleteAction(() => {
            setSelectedJournal(journal);
            deleteModal.openModal();
          }),
        ];

        return <CustomAction actions={actions} />;
      },
    },
  ];
  console.log(selectedJournal);
  return (
    <>
      <UserToolbar
        createLabel="Jurnal qo'shish"
        onCreate={() => createModal.openModal()}
        filterLabel="Filtrlash"
        searchPlaceholder="Jurnallarni qidirish"
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
        <JournalForm modal={createModal} mode={"create"} />
      </CustomModal>

      {selectedJournal && (
        <>
          <CustomModal
            closeOnOverlayClick={false}
            title="Jurnalni tahrirlash"
            description="Jurnal ma'lumotlarini o'zgartirishingiz mumkin"
            isOpen={editModal.isOpen}
            onClose={editModal.closeModal}
          >
            <JournalForm
              modal={editModal}
              mode={"edit"}
              journal={selectedJournal}
            />
          </CustomModal>
          <CustomModal
            title="Jurnal haqida ma'lumot"
            description="Jurnalning to'liq ma'lumotlarini ko'rish"
            isOpen={viewModal.isOpen}
            onClose={viewModal.closeModal}
          >
            <JournalView
              journal={selectedJournal}
              onClose={viewModal.closeModal}
            />
          </CustomModal>
        </>
      )}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
      />
      <DataTable
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={data?.count || 0}
        currentPage={pageNumber}
        columns={columns}
        data={data ? data.data : []}
      />
    </>
  );
};

export default JournalPage;
