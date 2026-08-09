import { Pagination } from "@/shared/components/Pagination";

type DataTablePaginationProps = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps) {
  const startRecord = totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endRecord = Math.min(pageIndex * pageSize, totalCount);
  const pageCount = Math.max(totalPages, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
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

      {totalPages > 0 ? (
        <Pagination
          page={pageIndex}
          pageCount={pageCount}
          onPageChange={onPageChange}
          size="sm"
        />
      ) : null}
    </div>
  );
}
