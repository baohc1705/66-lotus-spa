import { useState, useCallback, useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel, type ColumnDef,
  type VisibilityState
} from '@tanstack/react-table'
import {
  Plus, MoreHorizontal, Eye, Pencil, Trash2,
  ArrowUpDown, Crown, ArrowUp, ArrowDown
} from 'lucide-react'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { DataTableViewOptions } from '@/shared/components/DataTable/DataTableViewOptions'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { StatusBadge, type StatusMap } from '@/shared/components/StatusBadge'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataTablePagination } from '@/shared/components/DataTable/DataTablePagination'
import { DataTableToolbar } from '@/shared/components/DataTable/DataTableToolbar'
import { MembershipTierFormDialog } from '../components/MembershipTierFormDialog'
import { MembershipTierDetailExpanded } from '../components/MembershipTierDetailExpanded'
import { useMembershipTiers, useDeleteMembershipTier } from '../hooks/useMembershipTiers'
import type { MembershipTierDto } from '../types/membershipTier.types'
import { formatCurrency } from '@/shared/utils/currency'

const TIER_STATUS_MAP: StatusMap = {
  '0': { label: 'Ngưng hoạt động', variant: 'error' },
  '1': { label: 'Hoạt động', variant: 'success', dot: true },
  '2': { label: 'Tạm khóa', variant: 'warning' },
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export function MembershipTierListPage() {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filter, setFilter] = useState('')
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined)
  const [isDescending, setIsDescending] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const [createOpen, setCreateOpen] = useState(false)
  const [editTier, setEditTier] = useState<MembershipTierDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MembershipTierDto | null>(null)

  const { data: tiersResult, isLoading, isFetching } = useMembershipTiers({
    pageIndex,
    pageSize,
    keyword: filter || undefined,
    orderBy,
    isDescending,
  })
  
  const deleteMutation = useDeleteMembershipTier()

  const paged = tiersResult?.data
  const tiers = useMemo(() => paged?.items ?? [], [paged?.items])
  const totalCount = paged?.totalCount ?? 0

  const handleSort = useCallback((column: string) => {
    if (orderBy === column) {
      setIsDescending(prev => !prev)
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
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null)
        },
      })
    }
  }, [deleteTarget, deleteMutation])

  const SortIcon = useCallback(({ column }: { column: string }) => {
    if (orderBy !== column) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return isDescending
      ? <ArrowDown className="w-3 h-3 text-lotus-leaf" />
      : <ArrowUp className="w-3 h-3 text-lotus-leaf" />
  }, [orderBy, isDescending])

  const columns = useMemo<ColumnDef<MembershipTierDto>[]>(() => [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => <span className="text-lotus-stone">{(pageIndex - 1) * pageSize + row.index + 1}</span>,
      size: 50,
      enableResizing: false,
    },
    {
      accessorKey: 'name',
      header: () => (
        <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors">
          Loại thẻ <SortIcon column="name" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-lotus-deep">{row.original.name}</span>
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: 'minSpending',
      header: () => (
        <button onClick={() => handleSort('minSpending')} className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors">
          Chi tiêu tối thiểu <SortIcon column="minSpending" />
        </button>
      ),
      cell: ({ row }) => <span className="font-semibold text-lotus-deep/80">{formatCurrency(row.original.minSpending)}</span>,
      size: 150,
    },
    {
      accessorKey: 'discountPercent',
      header: 'Giảm giá',
      cell: ({ row }) => <span className="text-lotus-deep/80 font-medium">{row.original.discountPercent ?? 0}%</span>,
      size: 100,
    },
    {
      accessorKey: 'pointMultiplier',
      header: 'Hệ số điểm',
      cell: ({ row }) => <span className="text-lotus-deep/80 font-medium">x{row.original.pointMultiplier}</span>,
      size: 100,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge status={String(row.original.status)} statusMap={TIER_STATUS_MAP} />,
      size: 120,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const tier = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                  <Eye className="w-4 h-4 mr-2" />
                  {row.getIsExpanded() ? 'Đóng chi tiết' : 'Xem chi tiết'}
                </DropdownMenuItem>
                <PermissionGate resource="customers" action="update">
                  <DropdownMenuItem onClick={() => setEditTier(tier)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                </PermissionGate>
                <PermissionGate resource="customers" action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(tier)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa loại thẻ
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
    data: tiers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableMultiRowSelection: false,
    columnResizeMode: 'onChange',
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  })

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
      <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden">
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm tên loại thẻ..."
          >
            <DataTableViewOptions
              table={table}
              columnLabels={{
                name: 'Loại thẻ',
                minSpending: 'Chi tiêu tối thiểu',
                discountPercent: 'Giảm giá',
                pointMultiplier: 'Hệ số điểm',
                status: 'Trạng thái',
              }}
            />

            <PermissionGate resource="customers" action="create">
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="text-[12px] gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm loại thẻ
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) => (
            row.original.id ? <MembershipTierDetailExpanded tierId={row.original.id} onEdit={(tier) => setEditTier(tier)} /> : null
          )}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Crown className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">Chưa có loại thẻ</p>
                <p className="text-[12px] text-lotus-stone mt-0.5">Thêm loại thẻ thành viên để phân hạng khách hàng.</p>
              </div>
              <PermissionGate resource="customers" action="create">
                <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="mt-1 text-[12px]">
                  <Plus className="w-3.5 h-3.5" />
                  Thêm loại thẻ
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

      <MembershipTierFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <MembershipTierFormDialog
        open={!!editTier}
        onOpenChange={(open) => { if (!open) setEditTier(null) }}
        tier={editTier}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Xóa loại thẻ"
        description={`Bạn có chắc muốn xóa loại thẻ "${deleteTarget?.name ?? ''}"? Các khách hàng đang thuộc hạng thẻ này có thể bị ảnh hưởng. Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  )
}
