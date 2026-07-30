import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";

export type ReportColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  title: string;
  columns: ReportColumn<T>[];
  rows: T[];
  pageSize?: number;
};

export function ReportDataTable<T>({
  title,
  columns,
  rows,
  pageSize: defaultPageSize = 10,
}: Props<T>) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(pageIndex, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  const columnDefs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col: ReportColumn<T>) => ({
        id: col.key,
        header: col.header,
        cell: ({ row }) => col.render(row.original),
      })),
    [columns],
  );

  const table = useReactTable({
    data: pageRows,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="bg-white border rounded-lg flex flex-col min-h-[360px] overflow-hidden">
      <div className="text-sm font-bold px-4 pt-4 pb-3">{title}</div>
      <DataTable
        table={table}
        emptyState={<span className="text-slate-400">Không có dữ liệu</span>}
        pagination={
          <DataTablePagination
            pageIndex={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            hasPreviousPage={currentPage > 1}
            hasNextPage={currentPage < totalPages}
            onPageChange={setPageIndex}
            onPageSizeChange={(size: number) => {
              setPageSize(size);
              setPageIndex(1);
            }}
          />
        }
      />
    </div>
  );
}
