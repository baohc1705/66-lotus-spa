import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type DataTablePaginationProps = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps) {
  const startRecord = totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endRecord = Math.min(pageIndex * pageSize, totalCount);

  const btnClass =
    "inline-flex h-7 w-7 items-center justify-center rounded-md text-kit-muted " +
    "hover:bg-kit-page hover:text-kit-heading disabled:opacity-40";

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-3">
      <div className="flex items-center gap-3 text-xs text-kit-muted">
        <span className="hidden sm:inline">
          Hiển thị{" "}
          <strong className="text-kit-heading">
            {startRecord}-{endRecord}
          </strong>{" "}
          / <strong className="text-kit-heading">{totalCount}</strong>
        </span>
        <span className="text-xs sm:hidden">
          <strong className="text-kit-heading">{totalCount}</strong> kết quả
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-7 cursor-pointer rounded-md border border-kit bg-kit-white px-1.5 text-xs text-kit-heading outline-none focus:border-kit-primary"
        >
          {pageSizeOptions.map((size: number) => (
            <option key={size} value={size}>
              {size} / trang
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <span className="mr-2 hidden text-xs text-kit-muted sm:inline">
          Trang <strong className="text-kit-heading">{pageIndex}</strong> / {totalPages}
        </span>
        <button
          type="button"
          className={btnClass}
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!hasPreviousPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
