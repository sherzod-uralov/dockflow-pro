"use client";

import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { ModalState } from "@/types/modal";
import { IconArrowLeft, IconSend, IconTrash, IconDots } from "@tabler/icons-react";
import { useState, FC, ReactNode, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Group, Menu, ActionIcon, Tooltip } from "@mantine/core";
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
import { useGetAllJournals } from "@/features/journal/hook/journal.hook";
import { useGetAllDocumentTemplates } from "@/features/document-template/hook/document-template.hook";
import { useOnboarding, TourButton } from "@/hooks/use-onboarding";
import {
  PermissionGate,
  GuardedActionIcon,
  GuardedMenuItem,
} from "@/components/shared/permission";
import { colors } from "@/lib/colors";

// Status options
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Qoralama" },
  { value: "PUBLISHED", label: "Chop etilgan" },
  { value: "ARCHIVED", label: "Arxivlangan" },
];

// Priority options
const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Past" },
  { value: "MEDIUM", label: "O'rta" },
  { value: "HIGH", label: "Yuqori" },
];

const DocumentPage: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string | undefined;

  // Onboarding tour
  useOnboarding("document");

  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const workflowModal: ModalState = useModal();

  const { handlePageChange, pageNumber, pageSize } = usePagination();
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentGetResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [selectedTab, setSelectedTab] = useState<string>("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [journalFilter, setJournalFilter] = useState<string | null>(null);
  const [templateFilter, setTemplateFilter] = useState<string | null>(null);

  useEffect(() => {
    handlePageChange(1);
  }, [selectedTab, statusFilter, priorityFilter, journalFilter, templateFilter]);

  const { data, isLoading } = useGetAllDocuments({
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
    documentTypeId: selectedTab || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    journalId: journalFilter || undefined,
    templateId: templateFilter || undefined,
  });

  const { data: documentTypes } = useGetAllDocumentTypes({
    pageNumber: 1,
    pageSize: 1000,
  });

  // Get journals and templates for filters
  const { data: journalsData } = useGetAllJournals({
    pageNumber: 1,
    pageSize: 100,
  });

  const { data: templatesData } = useGetAllDocumentTemplates({
    pageNumber: 1,
    pageSize: 100,
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
        (doc: DocumentGetResponse) => doc.id === documentId
      );
      if (foundDoc) {
        setSelectedDocument(foundDoc);
      }
    }
  }, [documentId, data, selectedDocument]);

  const handleEdit = useCallback((item: DocumentGetResponse) => {
    setSelectedDocument(item);
    editModal.openModal();
  }, [editModal]);

  const handleDelete = useCallback((id: string) => {
    deleteDocumentMutation.mutate(id, {
      onSuccess: () => {
        router.push("/dashboard/document");
        setSelectedDocument(null);
      },
    });
    deleteModal.closeModal();
  }, [deleteDocumentMutation, router, deleteModal]);

  const handleEditSuccess = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setSelectedDocument(null);
    editModal.closeModal();
  }, [editModal]);

  const handleViewDocument = useCallback((item: DocumentGetResponse) => {
    setSelectedDocument(item);
    router.push(`/dashboard/document/${item.id}`, { scroll: false });
  }, [router]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/document");
    setSelectedDocument(null);
  }, [router]);

  const MAX_VISIBLE_TABS = 5;
  const allDocTypes = documentTypes?.data || [];
  const visibleTypes = allDocTypes.slice(0, MAX_VISIBLE_TABS);
  const overflowTypes = allDocTypes.slice(MAX_VISIBLE_TABS);
  const isOverflowSelected = overflowTypes.some((t) => t.id === selectedTab);

  const tabs = [
    { value: "all", label: "Barchasi" },
    ...visibleTypes.map((type) => ({ value: type.id, label: type.name })),
    // Agar overflow'dan tanlangan bo'lsa — uni ko'rinadigan tab qilamiz
    ...(isOverflowSelected
      ? [{ value: selectedTab, label: allDocTypes.find((t) => t.id === selectedTab)?.name || "" }]
      : []),
  ];

  // Workflow yaratish faqat DRAFT yoki REJECTED statusdagi hujjatlar uchun
  const canCreateWorkflow =
    selectedDocument?.status === "DRAFT" || selectedDocument?.status === "REJECTED";
  // O'chirish faqat APPROVED bo'lmaganlar uchun
  const canDelete = selectedDocument?.status !== "APPROVED";

  const actionButtons = [
    {
      label: "Ortga",
      icon: <IconArrowLeft size={16} />,
      onClick: handleBack,
    },
    ...(canCreateWorkflow
      ? [
          {
            label: "Yuborish",
            icon: <IconSend size={16} />,
            onClick: () => {
              workflowModal.openModal();
              router.push(`?documentId=${selectedDocument?.id}`);
            },
            permission: "workflow:create",
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: "O'chirish",
            icon: <IconTrash size={16} />,
            onClick: () => deleteModal.openModal(),
            permission: "document:delete",
          },
        ]
      : []),
  ];

  // Filter configuration
  const filterConfig = {
    status: {
      value: statusFilter,
      onChange: setStatusFilter,
      options: STATUS_OPTIONS,
    },
    journalId: {
      value: journalFilter,
      onChange: setJournalFilter,
      options: journalsData?.data?.map((j) => ({
        value: j.id,
        label: j.name,
      })) || [],
      label: "Jurnal",
    },
    templateId: {
      value: templateFilter,
      onChange: setTemplateFilter,
      options: templatesData?.data?.map((t) => ({
        value: t.id,
        label: t.name,
      })) || [],
      label: "Shablon",
    },
  };

  return (
    <>
      <SplitLayoutWithTabs
        tabs={tabs}
        defaultTab="all"
        createButtonLabel="+ Yangi hujjat"
        onCreateNew={createModal.openModal}
        createPermission="document:create"
        searchPlaceholder="Hujjatlarni qidirish..."
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
        activeTab={selectedTab || "all"}
        onTabChange={(tab) => setSelectedTab(tab === "all" ? "" : tab)}
        selectedItemActions={actionButtons}
        filters={filterConfig}
        showFilters={false}
        additionalActions={
          <Group gap="xs">
            {overflowTypes.length > 0 && (
              <Menu shadow="md" width={220} position="bottom-end">
                <Menu.Target>
                  <Tooltip label={`Yana ${overflowTypes.length} ta tur`}>
                    <ActionIcon variant="subtle" color="gray" radius="sm" size="md">
                      <IconDots size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Boshqa hujjat turlari</Menu.Label>
                  {overflowTypes.map((type) => (
                    <Menu.Item
                      key={type.id}
                      onClick={() => setSelectedTab(type.id)}
                      fw={selectedTab === type.id ? 600 : 400}
                      c={selectedTab === type.id ? colors.primary : undefined}
                    >
                      {type.name}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
            <TourButton tourKey="document" variant="icon" size="md" />
            {selectedDocument && (
              <CustomAction
                actions={[
                  createEditAction(
                    () => handleEdit(selectedDocument),
                    "document:update",
                  ),
                  createCopyAction(() =>
                    handleCopyToClipboard(selectedDocument.id || "", "ID"),
                  ),
                ]}
              />
            )}
          </Group>
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
