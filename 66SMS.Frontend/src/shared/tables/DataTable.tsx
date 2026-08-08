import { Fragment } from "react";
import { flexRender, type Table as ReactTable, type Row } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";

type DataTableProps<TData> = {
  table: ReactTable<TData>;
  isLoading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  onRowClick?: (row: Row<TData>) => void;
  pagination?: React.ReactNode;
  renderExpandedRow?: (props: { row: Row<TData> }) => React.ReactNode;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  headerTone?: "default" | "primary";
};

export function DataTable<TData>({
  table,
  isLoading = false,
  loadingRows = 5,
  emptyMessage,
  emptyState,
  onRowClick,
  pagination,
  renderExpandedRow,
  renderSubComponent,
  striped = true,
  hover = true,
  bordered = false,
  headerTone = "primary",
}: DataTableProps<TData>) {
  const expandRenderer = renderExpandedRow ?? renderSubComponent;
  const emptyContent = emptyState ?? emptyMessage ?? "Không có dữ liệu";
  const primaryHeader = headerTone === "primary";

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div className="w-full overflow-x-auto">
        <Table
          bordered={bordered}
          hover={hover}
          striped={striped && !expandRenderer}
          style={{ width: table.getCenterTotalSize(), minWidth: "100%" }}
        >
          <TableHead
            className={
              primaryHeader
                ? "bg-kit-primary [&_th]:bg-kit-primary [&_th]:text-kit-white"
                : undefined
            }
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHeaderCell
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="relative"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() ? (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={
                          "absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none select-none " +
                          (primaryHeader
                            ? "hover:bg-kit-white/30 " +
                              (header.column.getIsResizing()
                                ? "bg-kit-white/50"
                                : "bg-transparent")
                            : "hover:bg-kit-primary/30 " +
                              (header.column.getIsResizing()
                                ? "bg-kit-primary/50"
                                : "bg-transparent"))
                        }
                      />
                    ) : null}
                  </TableHeaderCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i: number) => (
                <TableRow
                  key={"skel-" + i}
                  className={striped && i % 2 === 0 ? "bg-kit-page" : undefined}
                >
                  {table.getVisibleFlatColumns().map((col, j: number) => (
                    <TableCell key={j} style={{ width: col.getSize() }}>
                      <div className="h-4 w-3/4 max-w-28 animate-pulse rounded bg-kit-track" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex: number) => {
                const stripeBg =
                  striped && expandRenderer && rowIndex % 2 === 0
                    ? "bg-kit-page "
                    : "";

                return (
                  <Fragment key={row.id}>
                    <TableRow
                      className={
                        (onRowClick || expandRenderer ? "cursor-pointer " : "") +
                        (row.getIsExpanded()
                          ? "relative z-10 border-x-2 border-t-2 border-kit-primary soft-kit-primary"
                          : row.getIsSelected()
                            ? "soft-kit-primary"
                            : stripeBg)
                      }
                      onClick={() => {
                        if (onRowClick) {
                          onRowClick(row);
                          return;
                        }
                        if (!expandRenderer) return;
                        if (row.getIsExpanded()) {
                          row.toggleExpanded(false);
                        } else {
                          table.toggleAllRowsExpanded(false);
                          row.toggleExpanded(true);
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && expandRenderer ? (
                      <TableRow className="relative z-10 border-x-2 border-b-2 border-t-0 border-kit-primary bg-kit-page/40 shadow-sm hover:bg-kit-page/40">
                        <TableCell
                          colSpan={row.getVisibleCells().length}
                          className="border-b-0 p-0"
                        >
                          {expandRenderer({ row })}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="py-16 text-center text-kit-muted"
                >
                  {emptyContent}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination ? (
        <div className="border-t border-kit bg-kit-white px-4">{pagination}</div>
      ) : null}
    </div>
  );
}
