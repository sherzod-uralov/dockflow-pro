"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/ui/custom-table";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { useDebounce } from "@/hooks/use-debaunce";
import { usePagination } from "@/hooks/use-pagination";
import { useGetAllDocuments } from "@/features/document";
import { useGetJournalById } from "@/features/journal/hook/journal.hook";
import { DocumentGetResponse } from "@/features/document/type/document.type";
import { ColumnDef } from "@tanstack/react-table";
import {
  ActionItem,
  createCopyAction,
  createViewAction,
  CustomAction,
} from "@/components/shared/ui/custom-action";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Building, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-800 border-green-200",
  DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ARCHIVED: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800 border-red-200",
  MEDIUM: "bg-orange-100 text-orange-800 border-orange-200",
  LOW: "bg-blue-100 text-blue-800 border-blue-200",
};

const JournalDocumentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const journalId = params?.id as string;

  const { pageNumber, pageSize, handlePageSizeChange, handlePageChange } =
    usePagination();
  const [search, debouncedSearch, setSearch] = useDebounce("", 500);

  const { data: journal, isLoading: isJournalLoading } =
    useGetJournalById(journalId);

  const { data: documentsData, isLoading: isDocumentsLoading } =
    useGetAllDocuments({
      journalId: journalId,
      search: debouncedSearch || undefined,
      pageSize: pageSize,
      pageNumber: pageNumber,
    });

  const handleViewDocument = (document: DocumentGetResponse) => {
    router.push(`/dashboard/document/${document.id}`);
  };

  const handleBack = () => {
    router.push("/dashboard/journal");
  };

  const columns: ColumnDef<DocumentGetResponse>[] = [
    {
      accessorKey: "documentNumber",
      header: "Hujjat raqami",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.documentNumber}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "Sarlavha",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={statusColors[row.original.status] || ""}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Muhimlik",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={priorityColors[row.original.priority] || ""}
        >
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: "documentType",
      header: "Hujjat turi",
      cell: ({ row }) => row.original.documentType?.name || "-",
    },
    {
      accessorKey: "createdBy",
      header: "Yaratuvchi",
      cell: ({ row }) => row.original.createdBy?.fullname || "-",
    },
    {
      accessorKey: "createdAt",
      header: "Yaratilgan sana",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("uz-UZ"),
    },
    {
      header: "Harakatlar",
      id: "actions",
      cell: ({ row }) => {
        const document = row.original;
        const actions: ActionItem[] = [
          createViewAction(() => handleViewDocument(document)),
          createCopyAction(() =>
            handleCopyToClipboard(document.id || "", "ID")
          ),
        ];
        return <CustomAction actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Journal Info Card */}
      <SkeletonWrapper isLoading={isJournalLoading}>
        {journal && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleBack}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      {journal.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Jurnalga tegishli hujjatlar ro'yxati
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {journal.department?.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      {journal.responsibleUser?.username}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Prefiks: <code className="font-mono text-primary">{journal.prefix}</code></span>
                <span>Format: <code className="font-mono">{journal.format}</code></span>
                <span>Jami hujjatlar: <strong>{documentsData?.count || 0}</strong></span>
              </div>
            </CardContent>
          </Card>
        )}
      </SkeletonWrapper>

      {/* Documents Table */}
      <div>
        <UserToolbar
          filterLabel="Filtrlash"
          searchPlaceholder="Hujjatlarni qidirish"
          searchQuery={search}
          onSearch={setSearch}
        />
        <DataTable
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalCount={documentsData?.count || 0}
          currentPage={pageNumber}
          columns={columns}
          data={documentsData?.data || []}
          loading={isDocumentsLoading}
        />
      </div>
    </div>
  );
};

export default JournalDocumentsPage;
