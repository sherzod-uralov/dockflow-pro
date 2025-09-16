"use client";

import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import PermissionCreateModal from "../component/permission.create.modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import { useGetAllPermissions } from "../hook/permission.hook";
import { DataTable } from "@/components/shared/ui/custom-table";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users } from "lucide-react";

const PermissionPage = () => {
  const createModal: ModalState = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useGetAllPermissions();

  // Flatten nested permission data for table
  const flatPermissions = useMemo(() => {
    if (!data?.data) return [];

    return data.data.flatMap(group =>
      group.permissions.map(permission => ({
        ...permission,
        module: group.module
      }))
    );
  }, [data]);

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return flatPermissions;

    const query = searchQuery.toLowerCase();
    return flatPermissions.filter(permission =>
      permission.name.toLowerCase().includes(query) ||
      permission.description.toLowerCase().includes(query) ||
      permission.key.toLowerCase().includes(query) ||
      permission.module.toLowerCase().includes(query)
    );
  }, [flatPermissions, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700">Xatolik: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserToolbar
        searchQuery={searchQuery}
        searchPlaceholder="Ruxsatlarni qidirish..."
        onSearch={handleSearch}
        createLabel="Ruxsat qo'shish"
        onCreate={createModal.openModal}
      />

      {/* Statistics Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Jami ruxsatlar</p>
                  <p className="text-2xl font-bold">{data.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Modullar</p>
                  <p className="text-2xl font-bold">{data.data.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Sahifa</p>
                <p className="text-2xl font-bold">{data.pageNumber} / {data.pageCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Sahifada</p>
                <p className="text-2xl font-bold">{data.pageSize}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Module Overview Cards */}
      {data?.data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((group, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {group.module}
                  </div>
                  <Badge variant="secondary">
                    {group.permissions.length} ta
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.permissions.slice(0, 3).map((permission) => (
                    <div key={permission.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{permission.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {permission.key.split(':')[1]}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs truncate">
                        {permission.description}
                      </p>
                    </div>
                  ))}
                  {group.permissions.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{group.permissions.length - 3} ta boshqa ruxsat
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              header: "Nom",
              accessorKey: "name",
              cell: ({ row }) => (
                <div>
                  <div className="font-medium">{row.original.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {row.original.description}
                  </div>
                </div>
              )
            },
            {
              header: "Kalit",
              accessorKey: "key",
              cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-xs">
                  {row.original.key}
                </Badge>
              )
            },
            {
              header: "Modul",
              accessorKey: "module",
              cell: ({ row }) => (
                <Badge variant="secondary">
                  {row.original.module}
                </Badge>
              )
            },
            {
              header: "Amallar",
              id: "actions",
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <button className="text-sm text-blue-600 hover:underline">
                    Tahrirlash
                  </button>
                  <button className="text-sm text-red-600 hover:underline">
                    O'chirish
                  </button>
                </div>
              )
            }
          ]}
          data={filteredPermissions}
        />
      )}

      {/* Search Results Info */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          "{searchQuery}" uchun {filteredPermissions.length} ta natija topildi
        </div>
      )}

      {/* Empty State */}
      {!isLoading && flatPermissions.length === 0 && (
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Ruxsatlar topilmadi</h3>
          <p className="text-muted-foreground mb-4">
            Hozircha ruxsatlar mavjud emas. Birinchi ruxsatni yarating.
          </p>
        </div>
      )}

      {/* Create Permission Modal */}
      <CustomModal
        closeOnOverlayClick={false}
        title="Yangi ruxsat yaratish"
        description="Ruxsat yaratish uchun quyidagi formani to'ldiring"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        size="lg"
      >
        <PermissionCreateModal modal={createModal} />
      </CustomModal>
    </div>
  );
};

export default PermissionPage;
