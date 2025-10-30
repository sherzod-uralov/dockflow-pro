"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { useSearchParams } from "next/navigation";
import { useGetJournalById } from "../hook/journal.hook";
import SkeletonWrapper from "@/components/wrappers/skleton-wrapper";
import { Copy, FileText, Building, User, Type } from "lucide-react";

const JournalView = () => {
  const params = useSearchParams();
  const journalId = params.get("journalId") || "";

  const { data: journal, isLoading, isFetching } = useGetJournalById(journalId);

  return (
    <SkeletonWrapper isLoading={isLoading || isFetching}>
      {journal && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                {/* 4. Меняем иконку и данные */}
                <FileText className="h-5 w-5 text-primary" />
                {journal.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Jurnal haqida batafsil ma'lumotlar
              </CardDescription>
            </div>
            {journal.id && (
              <Badge
                variant="outline"
                className="font-mono cursor-pointer hover:bg-muted transition-colors"
                onClick={() =>
                  handleCopyToClipboard(journal.id, "ID nusxalandi")
                }
              >
                ID: {journal.id.slice(0, 8)}...
                <Copy className="ml-1 h-3 w-3" />
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* --- 5. Основная информация о журнале --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Префикс */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Prefiks</span>
              </div>
              <div
                className="p-3 bg-blue-50 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
                onClick={() =>
                  handleCopyToClipboard(journal.prefix, "Prefiks nusxalandi")
                }
              >
                <code className="text-sm font-mono text-blue-700">
                  {journal.prefix}
                </code>
                <Copy className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            {/* Формат */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Format</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-md">
                <code className="text-sm font-mono">{journal.format}</code>
              </div>
            </div>
          </div>

          <Separator />

          {/* --- 6. Связанные данные (Департамент и Пользователь) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  Departament / Bo'lim
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
              >
                {journal.department.name}
              </Badge>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Mas'ul shaxs</span>
              </div>
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1"
              >
                {journal.responsibleUser.username}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* --- 7. Даты создания и обновления --- */}
        </CardContent>
      </Card>
    </div>
      )}
    </SkeletonWrapper>
  );
};

export default JournalView;
