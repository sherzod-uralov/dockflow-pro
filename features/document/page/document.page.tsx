"use client";

import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { ModalState } from "@/types/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, FileEdit, Search, ArrowLeft, Send, Trash2 } from "lucide-react";
import { useState, useEffect, FC, ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CustomAction,
  ActionItem,
  createEditAction,
  createDeleteAction,
  createCopyAction,
  createViewAction,
} from "@/components/shared/ui/custom-action";
import { DocumentGetResponse } from "@/features/document/type/document.type";
import DocumentFormModal from "../component/document.form";
import DocumentView from "../component/document.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";
import { useDeleteDocument, useGetAllDocuments } from "@/features/document";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DocumentPage: FC<{ children: ReactElement }> = ({ children }) => {
  const router = useRouter();
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();

  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentGetResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);

  const { data, isLoading } = useGetAllDocuments({
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });
  const deleteDocumentMutation = useDeleteDocument();

  const handleEdit = (item: DocumentGetResponse) => {
    setSelectedDocument(item);
    editModal.openModal();
  };

  const handleDelete = (id: string) => {
    console.log(id);
    deleteDocumentMutation.mutate(id);
    deleteModal.closeModal();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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

  return (
    <>
      <Tabs
        defaultValue="borchasi"
        className="flex-1 flex flex-col h-[calc(100vh-120px)]"
      >
        <div className="bg-card border-b">
          <div className="flex items-center justify-between px-6">
            <TabsList className="bg-transparent border-0 h-auto p-0">
              <TabsTrigger
                value="borchasi"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
              >
                Borchasi
              </TabsTrigger>
              <TabsTrigger
                value="chiquvchi"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
              >
                Chiquvchi hujjatlar
              </TabsTrigger>
              <TabsTrigger
                value="javob"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
              >
                Javob xati
              </TabsTrigger>
              <TabsTrigger
                value="ichki"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 gap-2"
              >
                Ichki hujjatlar
                <Badge className="bg-purple-500 text-white rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
                  0
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="boshqalar"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 gap-2"
              >
                Boshqalar
                <Badge className="bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
                  0
                </Badge>
              </TabsTrigger>
            </TabsList>

            <Button onClick={createModal.openModal} className="my-2">
              + Yangi hujjat
            </Button>
          </div>
        </div>

        {/* Split Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Document List */}
          <div className="w-[500px] border-r flex flex-col bg-card">
            {/* Search Section */}
            <div className="px-4 py-3 bg-card border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="HUJJATLAR RO'YXATI"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Document Cards List */}
            <TabsContent
              value="borchasi"
              className="m-0 flex-1 overflow-y-auto"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Yuklanmoqda...</div>
                </div>
              ) : data?.data && data.data.length > 0 ? (
                <div className="p-4 space-y-3">
                  {data.data.map((doc: DocumentGetResponse) => (
                    <div
                      key={doc.id}
                      onClick={() => handleViewDocument(doc)}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-400",
                        selectedDocument?.id === doc.id
                          ? "border-blue-500 bg-blue-50"
                          : "bg-card",
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {doc.description || "Ma'lumot yo'q"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Badge
                          //@ts-ignore
                          variant={
                            doc.status === "PUBLISHED"
                              ? "success"
                              : doc.status === "DRAFT"
                                ? "warning"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {doc.status}
                        </Badge>
                        <Badge
                          //@ts-ignore
                          variant={
                            doc.priority === "HIGH"
                              ? "destructive"
                              : doc.priority === "MEDIUM"
                                ? "warning"
                                : "default"
                          }
                          className="text-xs"
                        >
                          {doc.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-8 text-muted-foreground">
                    Hujjatlar mavjud emas
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="chiquvchi"
              className="m-0 flex-1 overflow-y-auto"
            >
              <div className="flex items-center justify-center h-full text-center py-8 text-muted-foreground">
                Chiquvchi hujjatlar mavjud emas
              </div>
            </TabsContent>

            <TabsContent value="javob" className="m-0 flex-1 overflow-y-auto">
              <div className="flex items-center justify-center h-full text-center py-8 text-muted-foreground">
                Javob xatlari mavjud emas
              </div>
            </TabsContent>

            <TabsContent value="ichki" className="m-0 flex-1 overflow-y-auto">
              <div className="flex items-center justify-center h-full text-center py-8 text-muted-foreground">
                Ichki hujjatlar mavjud emas
              </div>
            </TabsContent>

            <TabsContent
              value="boshqalar"
              className="m-0 flex-1 overflow-y-auto"
            >
              <div className="flex items-center justify-center h-full text-center py-8 text-muted-foreground">
                Boshqa hujjatlar mavjud emas
              </div>
            </TabsContent>

            {/* Pagination Footer */}
            <div className="border-t p-3 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>Sahifadagi elementlar: {pageSize}</div>
                <div>
                  {data?.count || 0} / {data?.count || 0}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
                  >
                    &lt;
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={pageNumber * pageSize >= (data?.count || 0)}
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {selectedDocument ? (
              <>
                <div className="px-6 py-3 bg-card border-b flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Ortga
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Send className="h-4 w-4" />
                    Yuborish
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      deleteModal.openModal();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    O&apos;chirish
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileEdit className="h-4 w-4" />
                    Ijro qadamlari (beta)
                  </Button>

                  <div className="ml-auto flex gap-2">
                    <CustomAction
                      actions={[
                        createEditAction(() => handleEdit(selectedDocument)),
                        createCopyAction(() =>
                          handleCopyToClipboard(
                            selectedDocument.id || "",
                            "ID",
                          ),
                        ),
                      ]}
                    />
                  </div>
                </div>

                {/* Document Details */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="bg-card rounded-lg shadow-sm p-6 mx-auto">
                    {children}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <FileEdit className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Hujjat tanlanmagan</p>
                  <p className="text-sm mt-2">
                    Hujjat tafsilotlarini ko&apos;rish uchun chap tomondagi
                    ro&apos;yxatdan hujjatni tanlang
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tabs>

      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Hujjat qo'shish"
        description="Hujjat qo'shish uchun maydonlar to'ldirilishi kerak"
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
    </>
  );
};

export default DocumentPage;
