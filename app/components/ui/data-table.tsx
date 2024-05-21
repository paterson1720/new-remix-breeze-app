import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  VisibilityState,
  useReactTable,
  TableState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Form } from "@remix-run/react";
import { DataTableColumnVisibilityToggle } from "@/components/ui/data-table-column-visibility-toggle";
import { DataTableManualPagination } from "./data-table-manual-pagination";
import { Input } from "./input";
import Render from "./render";
import TableSearch from "./data-table-search-form";

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search?: {
    enabled?: boolean;
    searchInputPlaceholder?: string;
  };
  pagination?: {
    pageSize?: number;
    pageIndex?: number;
    pageCount?: number;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
  pagination,
}: Props<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const tableState: Partial<TableState> = {
    sorting,
    columnFilters,
    columnVisibility,
  };

  if (pagination) {
    const { pageCount, pageIndex } = pagination;
    if (pageCount == null || pageIndex == null) {
      throw new Error(
        "Both pageCount and pageIndex must be provided when using manual pagination."
      );
    }
    tableState.pagination = {
      pageIndex,
      pageSize: pagination.pageSize ?? 20,
    };
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    pageCount: pagination?.pageCount,
    state: tableState,
  });

  return (
    <div>
      <div className="flex items-center pb-4">
        <TableSearch />
        <DataTableColumnVisibilityToggle table={table} />
      </div>
      <div className="rounded-md border border-secondary">
        <Table>
          <TableHeader className="bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border border-secondary">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border border-secondary"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="my-4" />
      <Render when={pagination}>
        <DataTableManualPagination table={table} />
      </Render>
    </div>
  );
}
