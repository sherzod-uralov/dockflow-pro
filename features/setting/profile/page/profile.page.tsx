"use client";

import { useState } from "react";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import { useUpdateUserMutation } from "@/features/admin/admin-users/hook/user.hook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  X,
  Calendar,
  User,
  Shield,
  Building2,
  Clock,
} from "lucide-react";
import SimpleFormGenerator, {
  type Field,
} from "@/components/shared/ui/custom-form-generator";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  fullname: z.string().min(1, "To'liq ism kiritilishi shart"),
  username: z
    .string()
    .min(3, "Username kamida 3 ta belgidan iborat bo'lishi kerak"),
  password: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return val.length >= 8;
      },
      { message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" },
    )
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val);
      },
      {
        message:
          "Parol katta harf, kichik harf va raqam o'z ichiga olishi kerak",
      },
    ),
  avatarUrl: z.any().optional(),
  isActive: z.boolean().optional(),
});

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const { mutateAsync: updateUser, isLoading: isUpdating } =
    useUpdateUserMutation();

  const handleSubmit = async (data: any) => {
    if (!profile?.id) return;

    try {
      const updateData: any = {
        fullname: data.fullname,
        username: data.username,
        avatarUrl: data.avatarUrl.fileUrl,
        isActive: data.isActive ?? true,
      };

      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      await updateUser({
        id: profile.id,
        data: updateData,
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const fields: Field[] = [
    {
      name: "fullname",
      label: "To'liq ism",
      type: "text",
      placeholder: "To'liq ismingizni kiriting",
      colSpan: 2,
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "Username kiriting",
      colSpan: 2,
    },
    {
      name: "password",
      label: "Yangi parol (ixtiyoriy)",
      type: "password",
      placeholder: "Yangi parol kiriting",
      colSpan: 2,
    },
    {
      name: "avatarUrl",
      label: "Fayllar",
      type: "file",
      multiple: false,
      fileReturnShape: "object",
      fileUrlTarget: "fileUrl",
      accept: {
        "image/*": [".jpg", ".jpeg", ".png"],
      },
      maxFiles: 20,
      maxSize: 10 * 1024 * 1024,
      helperText: "Profil rasm fayllarni yuklang (≤10MB) (.jpg, .jpeg, .png)",
      colSpan: 2,
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Profil ma'lumotlari topilmadi
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Ma'lumot yo'q";
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardDescription className="mt-2">
                Shaxsiy ma'lumotlaringizni ko'ring va tahrirlang
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="default"
                size="sm"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Tahrirlash
              </Button>
            )}
            {isEditing && (
              <Button
                onClick={() => setIsEditing(false)}
                variant="default"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Bekor qilish
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-border">
                  <AvatarImage
                    src={profile.avatarUrl || undefined}
                    alt={profile.fullname}
                  />
                  <AvatarFallback className="text-2xl font-semibold">
                    {getInitials(profile.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{profile.fullname}</h2>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      @{profile.username}
                    </span>
                  </div>
                  <Badge variant={profile.isActive ? "default" : "secondary"}>
                    {profile.isActive ? "Faol" : "Nofaol"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Rol
                      </p>
                      <p className="text-base font-semibold">
                        {profile.role.name || "Belgilanmagan"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Bo'lim
                      </p>
                      <p className="text-base font-semibold">
                        {profile.department.name || "Belgilanmagan"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Oxirgi kirish
                      </p>
                      <p className="text-base font-semibold">
                        {formatDate(profile.lastLogin)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Ro'yxatdan o'tgan
                      </p>
                      <p className="text-base font-semibold">
                        {formatDate(profile.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Tizim ma'lumotlari
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID:</span>{" "}
                    <span className="font-mono text-xs">{profile.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Yangilangan:</span>{" "}
                    <span>{formatDate(profile.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Avatar Preview */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage
                    src={profile.avatarUrl || undefined}
                    alt={profile.fullname}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(profile.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Joriy avatar</p>
                  <p className="text-xs text-muted-foreground">
                    Yangi avatar yuklash uchun quyidagi formadan foydalaning
                  </p>
                </div>
              </div>

              {/* Edit Form */}
              <SimpleFormGenerator
                schema={profileSchema}
                fields={fields}
                defaultValues={{
                  fullname: profile.fullname,
                  username: profile.username,
                  password: "",
                  avatarUrl: profile.avatarUrl || "",
                  isActive: profile.isActive,
                }}
                onSubmit={handleSubmit}
                submitLabel="Saqlash"
                renderActions={({ isSubmitting, isValid }) => (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      Bekor qilish
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !isValid}>
                      {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                  </>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
