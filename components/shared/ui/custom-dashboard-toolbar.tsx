"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, PlusIcon, Search, Filter } from "lucide-react";

interface UserToolbarProps {
  selectedCount?: number;
  searchQuery: string;
  onSearch: (value: string) => void;
  onCreate?: () => void;
  onFilter?: () => void;
  onBulkAction?: () => void;
  searchPlaceholder?: string;

  // Text props
  createLabel?: string;
  filterLabel?: string;
  bulkLabel?: string;
}

export function UserToolbar({
  selectedCount = 0,
  searchQuery,
  onSearch,
  onCreate,
  onFilter,
  onBulkAction,
  searchPlaceholder = "Qidirish...",

  createLabel = "Yangi element qo‘shish",
  filterLabel = "Filtrlash",
  bulkLabel = "Tanlangan",
}: UserToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between gap-4">
      {/* Actions */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkAction}
            className="hover:bg-transparent text-muted-foreground"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            {bulkLabel} ({selectedCount})
          </Button>
        )}
        {onCreate && (
          <Button
            onClick={onCreate}
            className="bg-primary hover:bg-primary-hover text-text-on-dark"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {createLabel}
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 pr-3 bg-transparent border-border focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {onFilter && (
          <Button
            variant="ghost"
            onClick={onFilter}
            className="hover:bg-transparent border border-border text-muted-foreground"
          >
            <Filter className="w-4 h-4 mr-2" />
            {filterLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
