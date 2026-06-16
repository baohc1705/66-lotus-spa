import { useState, useCallback, useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table'
import { Plus, MoreHorizontal, Pencil, Trash2, Building2, Eye } from 'lucide-react'
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
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataTablePagination } from '@/shared/components/DataTable/DataTablePagination'
import { DataTableToolbar } from '@/shared/components/DataTable/DataTableToolbar'
import { SalonFormDialog } from '../components/SalonFormDialog'
import { SalonStatusBadge } from '../components/SalonStatusBadge'
import { SalonDetailExpanded } from '../components/SalonDetailExpanded'
import { useSalons, useDeleteSalon } from '../hooks/useSalons'
import type { SalonDTO } from '../types/salon.types'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export function SalonListPage() {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filter, setFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const [createOpen, setCreateOpen] = useState(false)
  const [editSalon, setEditSalon] = useState<SalonDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SalonDTO | null>(null)

  const { data: salonsResult, isLoading, isFetching } = useSalons({
    pageIndex,
    pageSize,
    keyword: filter || undefined,
  })

  const deleteMutation = useDeleteSalon()

  const paged = salonsResult?.data
  const salons = useMemo(() => paged?.items ?? [], [paged?.items])
  const totalCount = paged?.totalCount ?? 0

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

  const columns = useMemo<ColumnDef<SalonDTO>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        cell: ({ row }) => (
          <span className="text-lotus-stone">
            {(pageIndex - 1) * pageSize + row.index + 1}
          </span>
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: 'code',
        header: 'Mã',
        cell: ({ row }) => (
          <span className="font-mono text-[12px] bg-stone-100 px-1.5 py-0.5 rounded text-lotus-deep">
            {row.original.code}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: 'name',
        header: 'Tên chi nhánh',
        cell: ({ row }) => (
          <span className="font-bold text-lotus-deep">{row.original.name}</span>
        ),
        size: 200,
      },
      {
        accessorKey: 'phone',
        header: 'Số điện thoại',
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">{row.original.phone}</span>
        ),
        size: 130,
      },
      {
        accessorKey: 'fullAddress',
        header: 'Địa chỉ',
        cell: ({ row }) => (
          <span
            className="text-lotus-deep/70 text-[12px] block truncate"
            style={{ maxWidth: 250 }}
            title={row.original.fullAddress}
          >
            {row.original.fullAddress || row.original.streetAddress || '—'}
          </span>
        ),
        size: 260,
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <SalonStatusBadge status={row.original.status} />,
        size: 120,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const salon = row.original
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
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4 mr-2" />
                    {row.getIsExpanded() ? 'Đóng chi tiết' : 'Xem chi tiết'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditSalon(salon)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(salon)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa chi nhánh
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        size: 50,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data: salons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableMultiRowSelection: false,
    columnResizeMode: 'onChange',
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  })

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
      <motion.div
        variants={itemVariants}
        className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden relative"
      >
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên, mã, SĐT..."
          >
            <DataTableViewOptions
              table={table}
              columnLabels={{
                code: 'Mã',
                name: 'Tên chi nhánh',
                phone: 'Số điện thoại',
                fullAddress: 'Địa chỉ',
                status: 'Trạng thái',
              }}
            />
            <Button
              variant="admin"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="text-[12px] gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm chi nhánh
            </Button>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) =>
            row.original.id ? (
              <SalonDetailExpanded
                salonId={row.original.id}
                onEdit={(salon) => setEditSalon(salon)}
              />
            ) : null
          }
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Building2 className="w-7 h-7 text-lotus-leaf" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">Chưa có chi nhánh</p>
                <p className="text-[12px] text-lotus-stone mt-0.5">
                  Thêm chi nhánh để bắt đầu quản lý hệ thống.
                </p>
              </div>
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="mt-1 text-[12px]"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm chi nhánh
              </Button>
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

      <SalonFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <SalonFormDialog
        open={!!editSalon}
        onOpenChange={(open) => { if (!open) setEditSalon(null) }}
        salon={editSalon}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Xóa chi nhánh"
        description={`Bạn có chắc muốn xóa chi nhánh "${deleteTarget?.name ?? ''}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  )
}
