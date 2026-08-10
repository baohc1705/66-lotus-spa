import { useMemo, useState, type ReactNode } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardBody, CardHeader } from "@/shared/elements/Card";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTablePagination } from "@/shared/tables/DataTablePagination";

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
    <Card className="main-card mb-0 min-h-96 overflow-hidden">
      <CardHeader>
        <span className="text-sm font-bold text-kit-heading/70">{title}</span>
      </CardHeader>
      <CardBody className="p-0">
        <DataTable
          table={table}
          emptyMessage="Không có dữ liệu"
          pagination={
            <div className="border-t border-kit px-3">
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
            </div>
          }
        />
      </CardBody>
    </Card>
  );
}
