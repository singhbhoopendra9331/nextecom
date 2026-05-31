"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
 * <DataTable columns={columns} data={users} getRowKey={(row) => row.id} />
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
}: DataTableProps<T>) {
  return (
    <div className={cn("relative w-full overflow-x-auto rounded-md border", className)}>
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
  );
}
