"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllDocumentTypes } from "@/features/document-type";
import {
  CustomFilter,
  FilterField,
} from "@/components/shared/ui/custom-filter";

export interface DocumentTemplateFilterValues {
  documentTypeId?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

interface DocumentTemplateFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: DocumentTemplateFilterValues;
  onApplyFilters: (filters: DocumentTemplateFilterValues) => void;
}

export function DocumentTemplateFilter({
  isOpen,
  onToggle,
  filters,
  onApplyFilters,
}: DocumentTemplateFilterProps) {
  const { data: documentTypes, isLoading: isLoadingTypes } =
    useGetAllDocumentTypes({
      pageSize: 100,
      pageNumber: 1,
    });

  const [localFilters, setLocalFilters] =
    useState<DocumentTemplateFilterValues>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (
    key: keyof DocumentTemplateFilterValues,
    value: any,
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    const resetFilters: DocumentTemplateFilterValues = {
      documentTypeId: undefined,
      isActive: undefined,
      isPublic: undefined,
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const hasActiveFilters = Boolean(
    localFilters.documentTypeId ||
    localFilters.isActive !== undefined ||
    localFilters.isPublic !== undefined
  );

  return (
    <CustomFilter
      isOpen={isOpen}
      onToggle={onToggle}
      onReset={handleReset}
      onApply={handleApply}
      hasActiveFilters={hasActiveFilters}
    >
      {/* Document Type Filter */}
      <FilterField label="Hujjat turi">
        <Select
          value={localFilters.documentTypeId || "all"}
          onValueChange={(value) => handleFilterChange("documentTypeId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Barchasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            {isLoadingTypes ? (
              <SelectItem value="loading" disabled>
                Yuklanmoqda...
              </SelectItem>
            ) : (
              documentTypes?.data?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </FilterField>

      {/* Is Active Filter */}
      <FilterField label="Holat">
        <Select
          value={
            localFilters.isActive === undefined
              ? "all"
              : localFilters.isActive
                ? "true"
                : "false"
          }
          onValueChange={(value) =>
            handleFilterChange(
              "isActive",
              value === "all" ? undefined : value === "true",
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Barchasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="true">Faol</SelectItem>
            <SelectItem value="false">Nofaol</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>

      {/* Is Public Filter */}
      <FilterField label="Ommaviy">
        <Select
          value={
            localFilters.isPublic === undefined
              ? "all"
              : localFilters.isPublic
                ? "true"
                : "false"
          }
          onValueChange={(value) =>
            handleFilterChange(
              "isPublic",
              value === "all" ? undefined : value === "true",
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Barchasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="true">Ha</SelectItem>
            <SelectItem value="false">Yo'q</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
    </CustomFilter>
  );
}
