import { useState, useCallback, useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
} from 'lucide-react'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { DataTableViewOptions } from '@/shared/components/DataTable/DataTableViewOptions'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { StatusBadge, type StatusMap } from '@/shared/components/StatusBadge'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataTablePagination } from '@/shared/components/DataTable/DataTablePagination'
import { DataTableToolbar } from '@/shared/components/DataTable/DataTableToolbar'
import { PromotionFormDialog } from '../components/PromotionFormDialog'
import { usePromotions, useDeletePromotion } from '../hooks/usePromotions'
import type { PromotionDto } from '../types/promotion.types'

const PROMOTION_STATUS_MAP: StatusMap = {
  '1': { label: 'Hoạt động', variant: 'success', dot: true },
  '0': { label: 'Không HĐ', variant: 'error' },
}

const DISCOUNT_TYPE_MAP: Record<string, { label: string; color: string }> = {
  '1': { label: 'Giảm %', color: 'bg-blue-100 text-blue-700' },
  '2': { label: 'Giảm tiền', color: 'bg-amber-100 text-amber-700' },
  '3': { label: 'Mua X tặng Y', color: 'bg-purple-100 text-purple-700' },
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export function PromotionListPage() {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filter, setFilter] = useState('')
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined)
  const [isDescending, setIsDescending] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editPromotion, setEditPromotion] = useState<PromotionDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PromotionDto | null>(null)

  const { data: promotionsResult, isLoading, isFetching } = usePromotions({
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
  })
  const deleteMutation = useDeletePromotion()

  const paged = promotionsResult?.data
  const promotions = useMemo(() => paged?.items ?? [], [paged?.items])
  const totalCount = paged?.totalCount ?? 0

  const handleSort = useCallback((column: string) => {
    if (orderBy === column) {
      setIsDescending((prev) => !prev)
    } else {
      setOrderBy(column)
      setIsDescending(false)
    }
  }, [orderBy])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPageIndex(1)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setFilter(value)
    setPageIndex(1)
  }, [])

  const handleDelete = useCallback(() => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => { if (result.isSuccess) setDeleteTarget(null) },
      })
    }
  }, [deleteTarget, deleteMutation])

  const SortIcon = useCallback(({ column }: { column: string }) => {
    if (orderBy !== column) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return isDescending
      ? <ArrowDown className="w-3 h-3 text-lotus-leaf" />
      : <ArrowUp className="w-3 h-3 text-lotus-leaf" />
  }, [orderBy, isDescending])

  const columns = useMemo<ColumnDef<PromotionDto>[]>(() => [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => (
        <span className="text-lotus-stone">{(pageIndex - 1) * pageSize + row.index + 1}</span>
      ),
      size: 50,
      enableResizing: false,
    },
    {
      accessorKey: 'code',
      header: () => (
        <button
          onClick={() => handleSort('code')}
          className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
        >
          Mã KM <SortIcon column="code" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-[12px] font-semibold text-lotus-deep">
          {row.original.code ?? '—'}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'name',
      header: () => (
        <button
          onClick={() => handleSort('name')}
          className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
        >
          Tên chương trình <SortIcon column="name" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-[13px] font-semibold text-lotus-deep truncate max-w-[200px] block">
          {row.original.name ?? '—'}
        </span>
      ),
      size: 220,
    },
    {
      accessorKey: 'discountType',
      header: 'Kiểu giảm',
      cell: ({ row }) => {
        const type = row.original.discountType?.toString() ?? ''
        const info = DISCOUNT_TYPE_MAP[type]
        if (!info) return <span className="text-lotus-stone">—</span>
        return (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${info.color}`}>
            {info.label}
          </span>
        )
      },
      size: 120,
    },
    {
      id: 'discountValue',
      header: 'Giá trị',
      cell: ({ row }) => {
        const p = row.original
        if (p.discountType === 1) return <span className="text-lotus-deep">{p.discountValue ?? 0}%</span>
        if (p.discountType === 2) return <span className="text-lotus-deep">{(p.discountValue ?? 0).toLocaleString('vi-VN')} ₫</span>
        if (p.discountType === 3) return <span className="text-lotus-deep">Mua {p.buyQuantity} tặng {p.getQuantity}</span>
        return <span>—</span>
      },
      size: 140,
    },
    {
      id: 'period',
      header: () => (
        <button
          onClick={() => handleSort('startdate')}
          className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
        >
          Hiệu lực <SortIcon column="startdate" />
        </button>
      ),
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="text-[12px] text-lotus-deep/70 leading-5">
            <div>{p.startDate ?? '—'}</div>
            <div>→ {p.endDate ?? '—'}</div>
          </div>
        )
      },
      size: 170,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status?.toString() ?? null}
          statusMap={PROMOTION_STATUS_MAP}
        />
      ),
      size: 110,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <PermissionGate resource="promotions" action="update">
                  <DropdownMenuItem onClick={() => setEditPromotion(p)}>
                    <Pencil className="w-4 h-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                </PermissionGate>
                <PermissionGate resource="promotions" action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p)}>
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 50,
      enableResizing: false,
    },
  ], [pageIndex, pageSize, handleSort, SortIcon])

  const table = useReactTable({
    data: promotions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
  })

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <motion.div
        variants={itemVariants}
        className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden"
      >
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo mã, tên khuyến mãi..."
          >
            <DataTableViewOptions
              table={table}
              columnLabels={{
                code: 'Mã KM',
                name: 'Tên chương trình',
                discountType: 'Kiểu giảm',
                status: 'Trạng thái',
              }}
            />
            <PermissionGate resource="promotions" action="create">
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="text-[12px] gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm khuyến mãi
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Tag className="w-7 h-7 text-lotus-stone" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">Chưa có khuyến mãi</p>
                <p className="text-[12px] text-lotus-stone mt-0.5">Thêm chương trình khuyến mãi để bắt đầu.</p>
              </div>
              <PermissionGate resource="promotions" action="create">
                <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="mt-1 text-[12px]">
                  <Plus className="w-3.5 h-3.5" />
                  Thêm khuyến mãi
                </Button>
              </PermissionGate>
            </div>
          }
          pagination={
            paged && totalCount > 0 ? (
              <DataTablePagination
                pageIndex={paged.pageIndex}
                pageSize={paged.pageSize}
                totalCount={paged.totalCount}
                totalPages={paged.totalPages}
                hasPreviousPage={paged.hasPreviousPage}
                hasNextPage={paged.hasNextPage}
                onPageChange={setPageIndex}
                onPageSizeChange={handlePageSizeChange}
              />
            ) : null
          }
        />

        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-lotus-leaf/30 overflow-hidden">
            <div className="h-full w-1/3 bg-lotus-leaf animate-[slide_1s_ease-in-out_infinite]" />
          </div>
        )}
      </motion.div>

      {/* Create Dialog */}
      <PromotionFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit Dialog */}
      <PromotionFormDialog
        open={!!editPromotion}
        onOpenChange={(open) => { if (!open) setEditPromotion(null) }}
        promotion={editPromotion}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Xóa khuyến mãi"
        description={`Bạn có chắc muốn xóa chương trình "${deleteTarget?.name ?? ''}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  )
}
