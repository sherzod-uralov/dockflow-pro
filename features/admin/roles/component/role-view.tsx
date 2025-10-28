"use client";

import { useSearchParams } from "next/navigation";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";
import { useGetRoleByIdQuery } from "@/features/admin/roles/hook/role.hook";

const RoleView = () => {
  const params = useSearchParams();
  const roleId = params.get("roleId") || "";

  const { data, isLoading, isFetching } = useGetRoleByIdQuery(roleId);

  return (
    <SkeletonWrapper isLoading={isFetching}>
      {data && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{data.name}</h3>
            <p className="text-sm text-muted-foreground">{data.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Foydalanuvchilar soni
              </p>
              <p className="font-medium">{data.users || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ruxsatlar soni</p>
              <p className="font-medium">{data.permissions.length}</p>
            </div>
          </div>

          {data.permissions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Ruxsatlar</p>
              <div className="flex flex-wrap gap-1">
                {data.permissions.map((permission) => (
                  <span
                    key={permission.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {permission.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SkeletonWrapper>
  );
};

export default RoleView;
