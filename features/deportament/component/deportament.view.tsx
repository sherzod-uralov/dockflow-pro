"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { useSearchParams } from "next/navigation";
import { useGetDeportamentById } from "../hook/deportament.hook";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";
import {
  Copy,
  Building,
  User,
  Info,
  Hash,
  MapPin,
  LucideRadioTower,
} from "lucide-react";

const DeportamentView = () => {
  const params = useSearchParams();
  const deportamentId = params.get("deportamentId") || "";

  const {
    data: departament,
    isLoading,
    isFetching,
  } = useGetDeportamentById(deportamentId);
  return (
    <SkeletonWrapper isLoading={isLoading || isFetching}>
      {departament && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building className="h-5 w-5 text-primary" />
                    {departament.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Departament haqida batafsil ma'lumotlar
                  </CardDescription>
                </div>
                {departament.id && (
                  <Badge
                    variant="outline"
                    className="font-mono cursor-pointer hover:bg-muted transition-colors"
                    onClick={() =>
                      handleCopyToClipboard(departament.id, "ID nusxalandi")
                    }
                  >
                    ID: {departament.id.slice(0, 8)}...
                    <Copy className="ml-1 h-3 w-3" />
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 4. НОВЫЙ БЛОК: Описание департамента */}
              {departament.description && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Tavsif</span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                      {departament.description}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* 5. НОВЫЙ БЛОК: Код и Местоположение */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Kod</span>
                  </div>
                  <code className="text-sm font-mono bg-muted/50 p-2 rounded-md">
                    {departament.code || "Kiritilmagan"}
                  </code>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Joylashuv</span>
                  </div>
                  <p className="text-sm text-foreground">
                    {departament.location || "Kiritilmagan"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* 6. Блок для связанных данных */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Родительский департамент */}
                {departament.parent && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <LucideRadioTower className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        Bosh departament
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
                    >
                      {departament.parent.name}
                    </Badge>
                  </div>
                )}

                {/* Директор */}
                {departament.director && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        Bo'lim boshlig'i
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={departament.director.avatarUrl ?? ""}
                          alt={departament.director.username}
                        />
                        <AvatarFallback>
                          {departament.director.fullname
                            .split(" ")
                            .map((n: any[]) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {departament.director.fullname}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SkeletonWrapper>
  );
};

export default DeportamentView;
