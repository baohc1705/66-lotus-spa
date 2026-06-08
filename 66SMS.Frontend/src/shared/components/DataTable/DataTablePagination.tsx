import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface DataTablePaginationProps {
  pageIndex: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

/**
 * DataTablePagination - Phân trang reusable cho mọi data table
 *
 * @example
 * <DataTablePagination
 *   pageIndex={1} pageSize={10} totalCount={50} totalPages={5}
 *   hasPreviousPage={false} hasNextPage={true}
 *   onPageChange={setPage} onPageSizeChange={setPageSize}
 * />
 */
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
  const startRecord = totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1
  const endRecord = Math.min(pageIndex * pageSize, totalCount)

  return (
    <div className="flex items-center justify-between gap-4 py-3 px-1">
      {/* Left: Record count & page size */}
      <div className="flex items-center gap-3 text-[12px] text-lotus-stone">
        <span className="hidden sm:inline">
          Hiển thị <strong className="text-lotus-deep">{startRecord}-{endRecord}</strong> / <strong className="text-lotus-deep">{totalCount}</strong>
        </span>
        <span className="sm:hidden text-[11px]">
          <strong className="text-lotus-deep">{totalCount}</strong> kết quả
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-7 rounded-lg border border-stone-200/50 bg-white text-[11px] text-lotus-deep px-1.5 outline-none focus:border-lotus-gold cursor-pointer"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size} / trang</option>
          ))}
        </select>
      </div>

      {/* Right: Page controls */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-lotus-stone mr-2 hidden sm:inline">
          Trang <strong className="text-lotus-deep">{pageIndex}</strong> / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage}
          className="text-lotus-stone hover:text-lotus-deep"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!hasPreviousPage}
          className="text-lotus-stone hover:text-lotus-deep"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!hasNextPage}
          className="text-lotus-stone hover:text-lotus-deep"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="text-lotus-stone hover:text-lotus-deep"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
