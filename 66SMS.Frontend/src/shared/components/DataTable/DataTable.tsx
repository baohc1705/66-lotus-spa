// Bảng dữ liệu dùng chung cho các trang CRUD.
// Hỗ trợ: phân trang, tìm kiếm, sort cột, ẩn/hiện cột, chọn nhiều dòng, mở rộng dòng.
//
// Dùng cùng với DataTableToolbar (thanh tìm kiếm) và DataTablePagination (phân trang).
import { Fragment } from "react";
import { flexRender, type Table as ReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  table: ReactTable<TData>;
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: React.ReactNode;
  onRowClick?: (row: import("@tanstack/react-table").Row<TData>) => void;
  pagination?: React.ReactNode;
  renderSubComponent?: (props: {
    row: import("@tanstack/react-table").Row<TData>;
  }) => React.ReactNode;
}

export function DataTable<TData>({
  table,
  isLoading = false,
  loadingRows = 5,
  emptyState,
  onRowClick,
  pagination,
  renderSubComponent,
}: DataTableProps<TData>) {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      <div className="overflow-x-auto w-full">
        <Table style={{ width: table.getCenterTotalSize(), minWidth: "100%" }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="relative"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {/* Resizer Handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-white/30 touch-none select-none ${
                            header.column.getIsResizing()
                              ? "bg-white/40"
                              : "bg-transparent"
                          }`}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow key={`skel-${i}`}>
                  {table.getVisibleFlatColumns().map((col, j) => (
                    <TableCell key={j} style={{ width: col.getSize() }}>
                      <Skeleton className="h-4 w-3/4 max-w-[120px] rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={
                      row.getIsExpanded()
                        ? "expanded"
                        : row.getIsSelected()
                          ? "selected"
                          : undefined
                    }
                    className={cn(
                      onRowClick ? "cursor-pointer group" : "",
                      row.getIsExpanded()
                        ? "border-x-2 border-t-2 border-adminGreen-600 relative z-10 bg-adminGreen-100/50"
                        : "",
                    )}
                    onClick={() => {
                      if (row.getIsExpanded()) {
                        row.toggleExpanded(false);
                      } else {
                        table.toggleAllRowsExpanded(false);
                        row.toggleExpanded(true);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow className="bg-adminGray-50/30 hover:bg-adminGray-50/30 !border-x-2 !border-b-2 border-t-0 border-adminGreen-600 relative z-10 shadow-sm">
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="p-0 border-b-0"
                      >
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="py-16 text-center"
                >
                  {emptyState || "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="px-4 border-t border-adminGray-100 bg-white/50">
          {pagination}
        </div>
      )}
    </div>
  );
}
