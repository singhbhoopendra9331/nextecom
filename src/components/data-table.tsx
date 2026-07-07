"use client";

import { Search } from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Generic data table for any list of items. Uses shadcn Table.
 *
 * @example
 * type User = { id: string; name: string; email: string };
 * const columns: DataTableColumn<User>[] = [
 *   { id: "name", header: "Name", accessorKey: "name" },
 *   { id: "email", header: "Email", accessorKey: "email" },
 *   { id: "actions", header: "", cell: (row) => <Button size="sm">Edit</Button> },
 * ];
 * <DataTable
 *   title="Users"
 *   columns={columns}
 *   data={users}
 *   getRowKey={(row) => row.id}
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   pagination={pagination}
 *   onPageChange={setPage}
 * />
 */
export interface DataTableColumn<T> {
  /** Unique column id (used as React key) */
  id: string;
  /** Header content (string or React node) */
  header: React.ReactNode;
  /** Custom cell renderer. If omitted, uses accessorKey or renders empty. */
  cell?: (row: T) => React.ReactNode;
  /** Key of T to display when cell is not provided */
  accessorKey?: keyof T;
  /** Optional class for the header cell */
  headerClassName?: string;
  /** Optional class for body cells in this column */
  cellClassName?: string;
}

export type DataTablePagination = {
  page: number;
  pages: number;
  total?: number;
  limit?: number;
};

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Message when data is empty */
  emptyMessage?: React.ReactNode;
  /** Optional table container class */
  className?: string;
  /** Optional row key getter; defaults to index */
  getRowKey?: (row: T, index: number) => string | number;
  /** Table heading */
  title?: string;
  /** Optional description below the heading */
  description?: string;
  /** Optional actions rendered beside the heading */
  actions?: React.ReactNode;
  /** Controlled search value */
  searchValue?: string;
  /** Called when the search input changes */
  onSearchChange?: (value: string) => void;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Show a loading state over the table body */
  isLoading?: boolean;
  /** Pagination state */
  pagination?: DataTablePagination;
  /** Called when a pagination control is used */
  onPageChange?: (page: number) => void;
  /** Show the header */
  showHeader?: boolean;
}

function getCellContent<T>(column: DataTableColumn<T>, row: T): React.ReactNode {
  if (column.cell) {
    return column.cell(row);
  }
  if (column.accessorKey != null) {
    const value = row[column.accessorKey];
    if (value === null || value === undefined) return null;
    if (typeof value === "object" && "toString" in value) {
      return String(value);
    }
    return value as React.ReactNode;
  }
  return null;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "No results.",
  className,
  getRowKey = (_, i) => i,
  title,
  description,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  isLoading = false,
  pagination,
  onPageChange,
  showHeader = false,
}: DataTableProps<T>) {
  const showSearch = onSearchChange != null;
  const showPagination = pagination && onPageChange;

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            {title ? (
              <h2 className="text-lg font-semibold leading-none">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      {showSearch ? (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      ) : null}

      <div className="relative w-full overflow-x-auto rounded-md border">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.id} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:nth-child(even)]:bg-muted/40">
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={getRowKey(row, index)}>
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.cellClassName}>
                      {getCellContent(col, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination ? (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
}
