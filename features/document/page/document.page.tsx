"use client";

import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { ModalState } from "@/types/modal";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { useState, FC, ReactElement, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CustomAction,
  createEditAction,
  createCopyAction,
} from "@/components/shared/ui/custom-action";
import { DocumentGetResponse } from "@/features/document/type/document.type";
import DocumentFormModal from "../component/document.form";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";
import {
  useDeleteDocument,
  useGetAllDocuments,
  useGetDocumentById,
} from "@/features/document";
import { SplitLayoutWithTabs } from "@/components/shared/layout/document.management.layout";
import WorkflowForm from "@/features/workflow/component/workflow.form";
import { useGetAllDocumentTypes } from "@/features/document-type";
const DocumentPage: FC<{ children: ReactElement }> = ({ children }) => {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string | undefined;

  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const workflowModal: ModalState = useModal();

  const { handlePageChange, pageNumber, pageSize } = usePagination();
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentGetResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [selectedTab, setSelectedTab] = useState<string>("");
  useEffect(() => {
    handlePageChange(1);
  }, [selectedTab]);

  const { data, isLoading } = useGetAllDocuments({
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
    documentTypeId: selectedTab || undefined,
  });

  const { data: documentTypes } = useGetAllDocumentTypes({
    pageNumber: 1,
    pageSize: 1000,
  });

  const { data: documentData, isLoading: isDocumentLoading } =
    useGetDocumentById(documentId || "", {
      enabled: !!documentId,
    });
  const deleteDocumentMutation = useDeleteDocument();

  useEffect(() => {
    if (documentId && documentData && !isDocumentLoading) {
      setSelectedDocument(documentData);
    } else if (!documentId) {
      setSelectedDocument(null);
    }
  }, [documentId, documentData, isDocumentLoading]);

  useEffect(() => {
    if (documentId && data?.data && !selectedDocument) {
      const foundDoc = data.data.find(
        (doc: DocumentGetResponse) => doc.id === documentId,
      );
      if (foundDoc) {
        setSelectedDocument(foundDoc);
      }
    }
  }, [documentId, data, selectedDocument]);

  const handleEdit = (item: DocumentGetResponse) => {
    setSelectedDocument(item);
    editModal.openModal();
  };

  const handleDelete = (id: string) => {
    deleteDocumentMutation.mutate(id, {
      onSuccess: () => {
        router.push("/dashboard/document");
        setSelectedDocument(null);
      },
    });
    deleteModal.closeModal();
  };

  const handleEditSuccess = () => {
    setSelectedDocument(null);
  };

  const handleEditModalClose = () => {
    setSelectedDocument(null);
    editModal.closeModal();
  };

  const handleViewDocument = (item: DocumentGetResponse) => {
    setSelectedDocument(item);
    router.push(`/dashboard/document/${item.id}`, { scroll: false });
  };

  const handleBack = () => {
    router.push("/dashboard/document");
    setSelectedDocument(null);
  };

  const tabs = [
    { value: "", label: "Barchasi" },
    ...(documentTypes?.data.map((type) => ({
      value: type.id,
      label: type.name,
    })) || []),
  ];

  const actionButtons = [
    {
      label: "Ortga",
      icon: <ArrowLeft className="h-4 w-4" />,
      onClick: handleBack,
    },
    {
      label: "Yuborish",
      icon: <Send className="h-4 w-4" />,
      onClick: () => {
        workflowModal.openModal();
        router.push(`?documentId=${selectedDocument?.id}`);
      },
    },
    {
      label: "O'chirish",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => deleteModal.openModal(),
    },
    // {
    //   label: "Ijro qadamlari (beta)",
    //   icon: <FileEdit className="h-4 w-4" />,
    //   onClick: () => {},
    // },
  ];

  return (
    <>
      <SplitLayoutWithTabs
        tabs={tabs}
        defaultTab=""
        createButtonLabel="+ Yangi hujjat"
        onCreateNew={createModal.openModal}
        searchPlaceholder="HUJJATLAR RO'YXATI"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        // @ts-ignore
        data={data?.data || []}
        isLoading={isLoading}
        // @ts-ignore
        selectedItem={selectedDocument}
        // @ts-ignore
        onItemClick={handleViewDocument}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={data?.count || 0}
        onPageChange={handlePageChange}
        rightPanelContent={children}
        onTabChange={(tab) => setSelectedTab(tab)}
        selectedItemActions={actionButtons}
        additionalActions={
          selectedDocument && (
            <CustomAction
              actions={[
                createEditAction(() => handleEdit(selectedDocument)),
                createCopyAction(() =>
                  handleCopyToClipboard(selectedDocument.id || "", "ID"),
                ),
              ]}
            />
          )
        }
      />

      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Hujjat qo'shish"
        description="Hujjat qo'shish uchun maydonlarni to'ldiring"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <DocumentFormModal modal={createModal} mode="create" />
      </CustomModal>

      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Hujjatni yangilash"
        description="Hujjat ma'lumotlarini yangilang"
        isOpen={editModal.isOpen}
        onClose={handleEditModalClose}
      >
        <DocumentFormModal
          modal={editModal}
          mode="update"
          document={selectedDocument as any}
          onSuccess={handleEditSuccess}
        />
      </CustomModal>

      <ConfirmationModal
        closeOnOverlayClick={false}
        title="Hujjatni o'chirish"
        description="Ushbu ma'lumotni o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        onClose={deleteModal.closeModal}
        isOpen={deleteModal.isOpen}
        onConfirm={() => {
          handleDelete(selectedDocument?.id as string);
        }}
      />
      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Ish jarayoni yaratish"
        description=""
        isOpen={workflowModal.isOpen}
        onClose={workflowModal.closeModal}
      >
        <WorkflowForm modal={workflowModal} mode="create" />
      </CustomModal>
    </>
  );
};

export default DocumentPage;
