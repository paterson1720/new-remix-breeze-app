import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";

interface Props<TData> {
  table: Table<TData>;
  visible?: boolean;
}

export function DataTableManualPagination<TData>({ table }: Props<TData>) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    navigate(`${location.pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-end px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const params = new URLSearchParams(searchParams);
              params.set("per_page", String(value));
              navigate(`${location.pathname}?${params.toString()}`);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[2, 10, 20, 30, 40, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!table.getCanPreviousPage()}
            onClick={() => handlePageChange(0)}
          >
            <span className="sr-only">Go to first page</span>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={!table.getCanPreviousPage()}
            onClick={() => handlePageChange(Math.max(0, table.getState().pagination.pageIndex - 1))}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={!table.getCanNextPage()}
            onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!table.getCanNextPage()}
            onClick={() => handlePageChange(table.getPageCount())}
          >
            <span className="sr-only">Go to last page</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
