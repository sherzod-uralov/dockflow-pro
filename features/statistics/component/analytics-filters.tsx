"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AnalyticsFilters, TimeRange } from "../type/statistics.type";

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  departments?: { id: number; name: string }[];
  users?: { id: number; name: string }[];
  showDepartmentFilter?: boolean;
  showUserFilter?: boolean;
}

export function AnalyticsFiltersComponent({
  filters,
  onFiltersChange,
  departments = [],
  users = [],
  showDepartmentFilter = true,
  showUserFilter = false,
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined,
  );

  const handleTimeRangeChange = (value: string) => {
    const timeRange = value as TimeRange;
    onFiltersChange({
      ...filters,
      timeRange,
      // Clear custom dates if not CUSTOM
      startDate: timeRange === TimeRange.CUSTOM ? filters.startDate : undefined,
      endDate: timeRange === TimeRange.CUSTOM ? filters.endDate : undefined,
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    onFiltersChange({
      ...filters,
      startDate: date ? date.toISOString() : undefined,
      timeRange: TimeRange.CUSTOM,
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onFiltersChange({
      ...filters,
      endDate: date ? date.toISOString() : undefined,
      timeRange: TimeRange.CUSTOM,
    });
  };

  const handleDepartmentChange = (value: string) => {
    onFiltersChange({
      ...filters,
      departmentId: value === "all" ? undefined : parseInt(value),
    });
  };

  const handleUserChange = (value: string) => {
    onFiltersChange({
      ...filters,
      userId: value === "all" ? undefined : parseInt(value),
    });
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange({
      timeRange: TimeRange.MONTH,
    });
  };

  const hasActiveFilters =
    filters.timeRange !== TimeRange.MONTH ||
    filters.departmentId !== undefined ||
    filters.userId !== undefined ||
    filters.startDate !== undefined ||
    filters.endDate !== undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtrlar
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Tozalash
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? "Yashirish" : "Ko'rsatish"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Time Range */}
            <div className="space-y-2">
              <Label>Vaqt oralig'i</Label>
              <Select
                value={filters.timeRange || TimeRange.MONTH}
                onValueChange={handleTimeRangeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vaqt oralig'ini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TimeRange.TODAY}>Bugun</SelectItem>
                  <SelectItem value={TimeRange.WEEK}>Bu hafta</SelectItem>
                  <SelectItem value={TimeRange.MONTH}>Bu oy</SelectItem>
                  <SelectItem value={TimeRange.QUARTER}>
                    Bu chorak
                  </SelectItem>
                  <SelectItem value={TimeRange.YEAR}>Bu yil</SelectItem>
                  <SelectItem value={TimeRange.CUSTOM}>
                    Boshqa davr
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            {showDepartmentFilter && (
              <div className="space-y-2">
                <Label>Bo'lim</Label>
                <Select
                  value={
                    filters.departmentId
                      ? filters.departmentId.toString()
                      : "all"
                  }
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bo'limni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha bo'limlar</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* User Filter */}
            {showUserFilter && (
              <div className="space-y-2">
                <Label>Foydalanuvchi</Label>
                <Select
                  value={filters.userId ? filters.userId.toString() : "all"}
                  onValueChange={handleUserChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Foydalanuvchini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Barcha foydalanuvchilar
                    </SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Custom Date Range */}
          {filters.timeRange === TimeRange.CUSTOM && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Boshlanish sanasi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Sanani tanlang</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Tugash sanasi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Sanani tanlang</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
