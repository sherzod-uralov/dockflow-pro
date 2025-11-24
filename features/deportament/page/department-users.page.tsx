"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/ui/custom-table";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { useDebounce } from "@/hooks/use-debaunce";
import { usePagination } from "@/hooks/use-pagination";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetDeportamentById } from "@/features/deportament/hook/deportament.hook";
import { User } from "@/features/admin/admin-users/type/user.types";
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
import { Building, User as UserIcon, ArrowLeft, MapPin, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";

const DepartmentUsersPage = () => {
  const params = useParams();
  const router = useRouter();
  const departmentId = params?.id as string;

  const { pageNumber, pageSize, handlePageSizeChange, handlePageChange } =
    usePagination();
  const [search, debouncedSearch, setSearch] = useDebounce("", 500);

  const { data: department, isLoading: isDepartmentLoading } =
    useGetDeportamentById(departmentId);

  const { data: usersData, isLoading: isUsersLoading } = useGetUserQuery({
    departmentId: departmentId,
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });

  const handleViewUser = (user: User) => {
    router.push(`/dashboard/admin/users?userId=${user.id}`);
  };

  const handleBack = () => {
    router.push("/dashboard/department");
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullname",
      header: "Foydalanuvchi",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={row.original.avatarUrl}
              alt={row.original.username}
            />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
              {row.original.fullname
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {row.original.fullname}
            </span>
            <span className="text-sm text-muted-foreground">
              @{row.original.username}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {row.original.role?.name || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Holat",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.isActive
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          }
        >
          {row.original.isActive ? "Faol" : "Nofaol"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Oxirgi kirish",
      cell: ({ row }) =>
        row.original.lastLogin
          ? new Date(row.original.lastLogin).toLocaleDateString("uz-UZ")
          : "Hali kirmagan",
    },
    {
      accessorKey: "createdAt",
      header: "Ro'yxatdan o'tgan",
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString("uz-UZ")
          : "-",
    },
    {
      header: "Harakatlar",
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const actions: ActionItem[] = [
          createViewAction(() => handleViewUser(user)),
          createCopyAction(() => handleCopyToClipboard(user.id || "", "ID")),
        ];
        return <CustomAction actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Department Info Card */}
      <SkeletonWrapper isLoading={isDepartmentLoading}>
        {department && (
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
                      <Building className="h-5 w-5 text-primary" />
                      {department.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Departamentga tegishli foydalanuvchilar ro'yxati
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {department.director && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={department.director.avatarUrl}
                            alt={department.director.username}
                          />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {department.director.fullname
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <Badge
                          variant="outline"
                          className="bg-indigo-50 text-indigo-700 border-indigo-200"
                        >
                          {department.director.fullname}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {department.code && (
                  <span className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    Kod: <code className="font-mono text-primary">{department.code}</code>
                  </span>
                )}
                {department.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {department.location}
                  </span>
                )}
                <span>
                  Jami foydalanuvchilar: <strong>{usersData?.count || 0}</strong>
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </SkeletonWrapper>

      {/* Users Table */}
      <div>
        <UserToolbar
          filterLabel="Filtrlash"
          searchPlaceholder="Foydalanuvchilarni qidirish"
          searchQuery={search}
          onSearch={setSearch}
        />
        <DataTable
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalCount={usersData?.count || 0}
          currentPage={pageNumber}
          columns={columns}
          data={usersData?.data || []}
          loading={isUsersLoading}
        />
      </div>
    </div>
  );
};

export default DepartmentUsersPage;
