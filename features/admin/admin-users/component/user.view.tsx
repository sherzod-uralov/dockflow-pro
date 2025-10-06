"use client";

import { useGetUserByIdQuery } from "../hook/user.hook";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";

const UserView = () => {
  const params = useSearchParams();
  const userId = params.get("userId") || "";

  const { data, isLoading, isFetching } = useGetUserByIdQuery(userId);

  const initials = data?.fullname
    ? data.fullname
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    : data?.username?.[0]?.toUpperCase() || "?";

  return (
    <SkeletonWrapper isLoading={isLoading || isFetching}>
      {data && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={data.avatarUrl} alt={data.username} />
              <AvatarFallback className="bg-primary/20 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{data.fullname}</h3>
              <p className="text-sm text-muted-foreground">@{data.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="font-medium">{data.role?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bo‘lim</p>
              <p className="font-medium">{data.department?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Holati</p>
              <p
                className={`font-medium ${
                  data.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {data.isActive ? "Aktiv" : "Bloklangan"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Qo‘shilgan sana</p>
              <p className="font-medium">
                {new Date(data.createdAt).toLocaleDateString("uz-UZ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Oxirgi kirish</p>
              <p className="font-medium">
                {data.lastLogin
                  ? new Date(data.lastLogin).toLocaleDateString("uz-UZ")
                  : "Hech qachon"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yangilangan sana</p>
              <p className="font-medium">
                {new Date(data.updatedAt).toLocaleDateString("uz-UZ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </SkeletonWrapper>
  );
};

export default UserView;
