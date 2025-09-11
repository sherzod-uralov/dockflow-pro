"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  Column,
  AccessorKeyColumnDef,
  AccessorFnColumnDef,
  DisplayColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ColumnMeta {
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sticky?: "left" | "right";
}

export type DataTableColumn<TData, TValue = unknown> =
  | (AccessorKeyColumnDef<TData, TValue> & { meta?: ColumnMeta })
  | (AccessorFnColumnDef<TData, TValue> & { meta?: ColumnMeta })
  | (DisplayColumnDef<TData, TValue> & { meta?: ColumnMeta });

interface DataTableProps<TData, TValue = unknown> {
  columns: DataTableColumn<TData, TValue>[];
  data: TData[];
  searchKey?: keyof TData;
  searchPlaceholder?: string;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
  enableColumnVisibility?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  showSelectedCount?: boolean;
  onRowSelect?: (rows: TData[]) => void;
  // New props for server-side pagination
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  loading = false,
  className,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  emptyMessage = "Ma'lumot topilmadi",
  onRowSelect,
  totalCount,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const tableColumns = columns as ColumnDef<TData, TValue>[];
  const isServerSide = totalCount !== undefined;

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel:
      !isServerSide && enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    manualPagination: isServerSide,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: enablePagination
        ? {
            pageIndex: isServerSide ? currentPage - 1 : 0,
            pageSize: pageSize,
          }
        : undefined,
    },
    pageCount: isServerSide ? Math.ceil(totalCount / pageSize) : -1,
    initialState: {
      pagination: enablePagination
        ? {
            pageSize: pageSize,
          }
        : undefined,
    },
  });

  React.useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row: Row<TData>) => row.original);
      onRowSelect(selectedRows);
    }
  }, [rowSelection, onRowSelect, table]);

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  const startIndex = isServerSide
    ? (currentPage - 1) * pageSize + 1
    : table.getState().pagination!.pageIndex *
        table.getState().pagination!.pageSize +
      1;

  const endIndex = isServerSide
    ? Math.min(currentPage * pageSize, totalCount)
    : Math.min(
        (table.getState().pagination!.pageIndex + 1) *
          table.getState().pagination!.pageSize,
        table.getFilteredRowModel().rows.length,
      );

  const totalPages = isServerSide
    ? Math.ceil(totalCount / pageSize)
    : table.getPageCount();

  const totalRecords = isServerSide
    ? totalCount
    : table.getFilteredRowModel().rows.length;

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  const canPreviousPage = isServerSide
    ? currentPage > 1
    : table.getCanPreviousPage();
  const canNextPage = isServerSide
    ? currentPage < totalPages
    : table.getCanNextPage();

  return (
    <div className={cn("w-full space-y-4", className)}>
      {" "}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="relative overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/40 backdrop-blur-sm z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnMeta = header.column.columnDef.meta as
                      | ColumnMeta
                      | undefined;

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "px-4 py-3 text-left text-sm font-semibold text-muted-foreground",
                          columnMeta?.sticky === "left" &&
                            "sticky left-0 bg-muted/40 backdrop-blur-sm z-20",
                          columnMeta?.sticky === "right" &&
                            "sticky right-0 bg-muted/40 backdrop-blur-sm z-20",
                        )}
                        style={{
                          width: columnMeta?.width,
                          minWidth: columnMeta?.minWidth,
                          maxWidth: columnMeta?.maxWidth,
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center space-x-2">
                            {header.column.getCanSort() ? (
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  header.column.toggleSorting(
                                    header.column.getIsSorted() === "asc",
                                  )
                                }
                                className="-ml-3 h-8 hover:text-text-on-dark data-[state=open]:bg-accent"
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              </Button>
                            ) : (
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Yuklanmoqda...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: Row<TData>) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const columnMeta = cell.column.columnDef.meta as
                        | ColumnMeta
                        | undefined;

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-4 py-3 text-sm text-foreground",
                            columnMeta?.sticky === "left" &&
                              "sticky left-0 bg-background z-10",
                            columnMeta?.sticky === "right" &&
                              "sticky right-0 bg-background z-10",
                          )}
                          style={{
                            width: columnMeta?.width,
                            minWidth: columnMeta?.minWidth,
                            maxWidth: columnMeta?.maxWidth,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <EyeOff className="h-8 w-8 text-muted-foreground/50" />
                      <p>{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Pagination */}
      {enablePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {totalRecords > 0 ? (
                <>
                  <span>{startIndex}</span>
                  {" - "}
                  <span>{endIndex}</span>
                  {" / "}
                  <span>{totalRecords}</span>
                  <span> yozuv</span>
                  {selectedRowsCount > 0 && (
                    <span className="ml-2">
                      ({selectedRowsCount} ta tanlangan)
                    </span>
                  )}
                </>
              ) : (
                "Ma'lumot yo'q"
              )}
            </div>

            {/* Page Size Selector */}
            {isServerSide && onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sahifada:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="h-8 px-2 text-sm border border-input rounded bg-background"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="hover:text-text-on-dark"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSide && onPageChange) {
                  onPageChange(1);
                } else {
                  table.setPageIndex(0);
                }
              }}
              disabled={!canPreviousPage}
            >
              Birinchi
            </Button>
            <Button
              className="hover:text-text-on-dark"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSide && onPageChange) {
                  onPageChange(currentPage - 1);
                } else {
                  table.previousPage();
                }
              }}
              disabled={!canPreviousPage}
            >
              Oldingi
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm font-medium">
                {isServerSide
                  ? currentPage
                  : table.getState().pagination!.pageIndex + 1}
              </span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm font-medium">{totalPages}</span>
            </div>
            <Button
              className="hover:text-text-on-dark"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSide && onPageChange) {
                  onPageChange(currentPage + 1);
                } else {
                  table.nextPage();
                }
              }}
              disabled={!canNextPage}
            >
              Keyingi
            </Button>
            <Button
              className="hover:text-text-on-dark"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSide && onPageChange) {
                  onPageChange(totalPages);
                } else {
                  table.setPageIndex(table.getPageCount() - 1);
                }
              }}
              disabled={!canNextPage}
            >
              Oxirgi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function createSortableHeader(title: string) {
  return ({ column }: { column: Column<any> }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-3 h-8 justify-start font-semibold"
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function createSelectColumn<TData>(): DataTableColumn<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="rounded border border-input"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className="rounded border border-input"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      width: 50,
      sticky: "left",
    },
  } as DisplayColumnDef<TData> & { meta?: ColumnMeta };
}
