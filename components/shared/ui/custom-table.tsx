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
import {
  Table,
  Box,
  Text,
  Group,
  ActionIcon,
  Select,
  Loader,
  Paper,
  Checkbox,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconInbox,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

interface ColumnMeta {
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sticky?: "left" | "right";
  truncate?: boolean;
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
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  loading = false,
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
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
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
    getPaginationRowModel: !isServerSide && enablePagination ? getPaginationRowModel() : undefined,
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
        ? { pageIndex: isServerSide ? currentPage - 1 : 0, pageSize: pageSize }
        : undefined,
    },
    pageCount: isServerSide ? Math.ceil(totalCount / pageSize) : -1,
    initialState: {
      pagination: enablePagination ? { pageSize: pageSize } : undefined,
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
    : table.getState().pagination!.pageIndex * table.getState().pagination!.pageSize + 1;

  const endIndex = isServerSide
    ? Math.min(currentPage * pageSize, totalCount)
    : Math.min(
        (table.getState().pagination!.pageIndex + 1) * table.getState().pagination!.pageSize,
        table.getFilteredRowModel().rows.length
      );

  const totalPages = isServerSide ? Math.ceil(totalCount / pageSize) : table.getPageCount();
  const totalRecords = isServerSide ? totalCount : table.getFilteredRowModel().rows.length;

  const canPreviousPage = isServerSide ? currentPage > 1 : table.getCanPreviousPage();
  const canNextPage = isServerSide ? currentPage < totalPages : table.getCanNextPage();

  // Sort icon component
  const SortIcon = ({ column }: { column: Column<TData, unknown> }) => {
    const sorted = column.getIsSorted();
    if (sorted === "asc") return <IconChevronUp size={12} stroke={2} />;
    if (sorted === "desc") return <IconChevronDown size={12} stroke={2} />;
    return <IconSelector size={12} stroke={1.5} color="#adb5bd" />;
  };

  return (
    <Box>
      <Paper radius="sm" withBorder style={{ borderColor: "#dee2e6", overflow: "hidden" }}>
        <Table.ScrollContainer minWidth={500}>
          <Table
            highlightOnHover
            verticalSpacing="xs"
            horizontalSpacing="sm"
            style={{ tableLayout: "fixed" }}
          >
            <Table.Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                  {headerGroup.headers.map((header) => {
                    const columnMeta = header.column.columnDef.meta as ColumnMeta | undefined;
                    return (
                      <Table.Th
                        key={header.id}
                        style={{
                          width: columnMeta?.width,
                          minWidth: columnMeta?.minWidth,
                          maxWidth: columnMeta?.maxWidth || 200,
                          padding: "10px 12px",
                          backgroundColor: "#fff",
                          borderBottom: "none",
                        }}
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <UnstyledButton
                            onClick={() =>
                              header.column.toggleSorting(header.column.getIsSorted() === "asc")
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              width: "100%",
                            }}
                          >
                            <Text
                              size="xs"
                              fw={500}
                              c="#868e96"
                              tt="uppercase"
                              style={{ letterSpacing: "0.3px" }}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </Text>
                            <SortIcon column={header.column} />
                          </UnstyledButton>
                        ) : (
                          <Text
                            size="xs"
                            fw={500}
                            c="#868e96"
                            tt="uppercase"
                            style={{ letterSpacing: "0.3px" }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </Text>
                        )}
                      </Table.Th>
                    );
                  })}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} style={{ height: 150, textAlign: "center" }}>
                    <Group justify="center" gap="xs">
                      <Loader size="sm" color="#1e3a5f" />
                      <Text size="sm" c="dimmed">
                        Yuklanmoqda...
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ) : table.getRowModel().rows?.length > 0 ? (
                table.getRowModel().rows.map((row: Row<TData>) => (
                  <Table.Tr
                    key={row.id}
                    data-selected={row.getIsSelected() || undefined}
                    style={{
                      backgroundColor: row.getIsSelected() ? "#f8f9fa" : undefined,
                      borderBottom: "1px solid #f1f3f5",
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const columnMeta = cell.column.columnDef.meta as ColumnMeta | undefined;
                      const shouldTruncate = columnMeta?.truncate !== false;
                      return (
                        <Table.Td
                          key={cell.id}
                          style={{
                            width: columnMeta?.width,
                            minWidth: columnMeta?.minWidth,
                            maxWidth: columnMeta?.maxWidth || 200,
                            padding: "10px 12px",
                            fontSize: 13,
                            color: "#495057",
                            overflow: shouldTruncate ? "hidden" : undefined,
                            textOverflow: shouldTruncate ? "ellipsis" : undefined,
                            whiteSpace: shouldTruncate ? "nowrap" : undefined,
                          }}
                          title={
                            shouldTruncate && typeof cell.getValue() === "string"
                              ? (cell.getValue() as string)
                              : undefined
                          }
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Td>
                      );
                    })}
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} style={{ height: 150, textAlign: "center" }}>
                    <Box py="md">
                      <IconInbox size={28} color="#ced4da" style={{ margin: "0 auto" }} />
                      <Text size="sm" c="dimmed" mt={8}>
                        {emptyMessage}
                      </Text>
                    </Box>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {/* Pagination inside paper */}
        {enablePagination && totalRecords > 0 && (
          <Group
            justify="space-between"
            px="sm"
            py="xs"
            style={{ borderTop: "1px solid #f1f3f5", backgroundColor: "#fff" }}
          >
            <Text size="xs" c="dimmed">
              {startIndex}-{endIndex} / {totalRecords}
              {selectedRowsCount > 0 && (
                <Text span c="#1e3a5f" fw={500} ml={8}>
                  ({selectedRowsCount} tanlangan)
                </Text>
              )}
            </Text>

            <Group gap="sm">
              {isServerSide && onPageSizeChange && (
                <Select
                  value={pageSize.toString()}
                  onChange={(value) => onPageSizeChange(Number(value))}
                  data={pageSizeOptions.map((size) => ({
                    value: size.toString(),
                    label: size.toString(),
                  }))}
                  size="xs"
                  w={60}
                  variant="unstyled"
                  styles={{
                    input: {
                      fontSize: 12,
                      color: "#868e96",
                      textAlign: "center",
                      minHeight: 24,
                      height: 24,
                    },
                  }}
                />
              )}

              <Group gap={2}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="gray"
                  onClick={() => {
                    if (isServerSide && onPageChange) {
                      onPageChange(currentPage - 1);
                    } else {
                      table.previousPage();
                    }
                  }}
                  disabled={!canPreviousPage}
                >
                  <IconChevronLeft size={14} />
                </ActionIcon>

                <Text size="xs" c="#495057" px={8} style={{ minWidth: 50, textAlign: "center" }}>
                  {isServerSide ? currentPage : table.getState().pagination!.pageIndex + 1} /{" "}
                  {totalPages || 1}
                </Text>

                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="gray"
                  onClick={() => {
                    if (isServerSide && onPageChange) {
                      onPageChange(currentPage + 1);
                    } else {
                      table.nextPage();
                    }
                  }}
                  disabled={!canNextPage}
                >
                  <IconChevronRight size={14} />
                </ActionIcon>
              </Group>
            </Group>
          </Group>
        )}
      </Paper>
    </Box>
  );
}

export function createSortableHeader(title: string) {
  return ({ column }: { column: Column<any> }) => (
    <UnstyledButton
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Text size="xs" fw={500} c="#868e96" tt="uppercase" style={{ letterSpacing: "0.3px" }}>
        {title}
      </Text>
      <IconSelector size={12} stroke={1.5} color="#adb5bd" />
    </UnstyledButton>
  );
}

export function createSelectColumn<TData>(): DataTableColumn<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        size="xs"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        size="xs"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      width: 40,
      truncate: false,
    },
  } as DisplayColumnDef<TData> & { meta?: ColumnMeta };
}
