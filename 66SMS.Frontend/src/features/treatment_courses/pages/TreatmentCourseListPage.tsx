import { useState, useCallback, useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  useReactTable, getCoreRowModel, getExpandedRowModel,
  type ColumnDef, type VisibilityState,
} from '@tanstack/react-table'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, History } from 'lucide-react'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { DataTableViewOptions } from '@/shared/components/DataTable/DataTableViewOptions'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { StatusBadge, type StatusMap } from '@/shared/components/StatusBadge'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataTablePagination } from '@/shared/components/DataTable/DataTablePagination'
import { DataTableToolbar } from '@/shared/components/DataTable/DataTableToolbar'
import { TreatmentCourseFormDialog } from '../components/TreatmentCourseFormDialog'
import { TreatmentCourseDetailExpanded } from '../components/TreatmentCourseDetailExpanded'
import { useTreatmentCourses, useDeleteTreatmentCourse } from '../hooks/useTreatmentCourses'
import type { TreatmentCourseDto } from '../types/treatmentCourse.types'

const STATUS_MAP: StatusMap = {
  '0': { label: 'Ngưng HĐ', variant: 'error' },
  '1': { label: 'Hoạt động', variant: 'success', dot: true },
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export function TreatmentCourseListPage() {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filter, setFilter] = useState('')
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined)
  const [isDescending, setIsDescending] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const [createOpen, setCreateOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<TreatmentCourseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TreatmentCourseDto | null>(null)

  const { data: result, isLoading, isFetching } = useTreatmentCourses({
    pageIndex, pageSize, filter: filter || undefined, orderBy, isDescending,
  })
  const deleteMutation = useDeleteTreatmentCourse()

  const paged = result?.data
  const courses = useMemo(() => paged?.items ?? [], [paged?.items])
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
        onSuccess: (res) => { if (res.isSuccess) setDeleteTarget(null) },
      })
    }
  }, [deleteTarget, deleteMutation])

  const SortIcon = useCallback(({ column }: { column: string }) => {
    if (orderBy !== column) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return isDescending
      ? <ArrowDown className="w-3 h-3 text-lotus-leaf" />
      : <ArrowUp className="w-3 h-3 text-lotus-leaf" />
  }, [orderBy, isDescending])

  const columns = useMemo<ColumnDef<TreatmentCourseDto>[]>(() => [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => <span className="text-lotus-stone">{(pageIndex - 1) * pageSize + row.index + 1}</span>,
      size: 50, enableResizing: false,
    },
    {
      accessorKey: 'code',
      header: () => (
        <button onClick={() => handleSort('code')} className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors">
          Mã <SortIcon column="code" />
        </button>
      ),
      cell: ({ row }) => <span className="font-mono text-[12px] text-lotus-stone">{row.original.code ?? '—'}</span>,
      size: 100,
    },
    {
      accessorKey: 'name',
      header: () => (
        <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors">
          Tên liệu trình <SortIcon column="name" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-[13px] font-semibold text-lotus-deep truncate max-w-[200px]">{row.original.name ?? '—'}</p>
          {row.original.categoryName && (
            <p className="text-[11px] text-lotus-stone">{row.original.categoryName}</p>
          )}
        </div>
      ),
      size: 240,
    },
    {
      accessorKey: 'totalSessions',
      header: 'Số buổi',
      cell: ({ row }) => <span className="font-semibold text-lotus-deep">{row.original.totalSessions ?? 0}</span>,
      size: 80,
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Giá bán',
      cell: ({ row }) => (
        <span className="text-lotus-deep font-semibold">
          {(row.original.sellingPrice ?? 0).toLocaleString('vi-VN')}đ
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'originalPrice',
      header: 'Giá gốc',
      cell: ({ row }) => (
        <span className="text-lotus-stone line-through text-[12px]">
          {(row.original.originalPrice ?? 0).toLocaleString('vi-VN')}đ
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge status={String(row.original.status ?? 1)} statusMap={STATUS_MAP} />,
      size: 120,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const c = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                  <Eye className="w-4 h-4" />
                  {row.getIsExpanded() ? 'Đóng chi tiết' : 'Xem chi tiết'}
                </DropdownMenuItem>
                <PermissionGate resource="treatment-courses" action="update">
                  <DropdownMenuItem onClick={() => setEditCourse(c)}>
                    <Pencil className="w-4 h-4" /> Chỉnh sửa
                  </DropdownMenuItem>
                </PermissionGate>
                <PermissionGate resource="treatment-courses" action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(c)}>
                    <Trash2 className="w-4 h-4" /> Xóa liệu trình
                  </DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 50, enableResizing: false,
    },
  ], [pageIndex, pageSize, handleSort, SortIcon])

  const table = useReactTable({
    data: courses, columns,
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
      <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden">
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên, mã liệu trình..."
          >
            <DataTableViewOptions
              table={table}
              columnLabels={{ code: 'Mã', name: 'Tên liệu trình', totalSessions: 'Số buổi', sellingPrice: 'Giá bán', originalPrice: 'Giá gốc', status: 'Trạng thái' }}
            />
            <PermissionGate resource="treatment-courses" action="create">
              <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="text-[12px] gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Thêm liệu trình
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>
        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) =>
            row.original.id
              ? <TreatmentCourseDetailExpanded courseId={row.original.id} onEdit={(c) => setEditCourse(c)} />
              : null
          }
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <History className="w-7 h-7 text-lotus-stone" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">Chưa có liệu trình</p>
                <p className="text-[12px] text-lotus-stone mt-0.5">Thêm liệu trình mới để bắt đầu quản lý.</p>
              </div>
              <PermissionGate resource="treatment-courses" action="create">
                <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="mt-1 text-[12px]">
                  <Plus className="w-3.5 h-3.5" /> Thêm liệu trình
                </Button>
              </PermissionGate>
            </div>
          }
          pagination={
            paged && totalCount > 0
              ? <DataTablePagination
                  pageIndex={paged.pageIndex}
                  pageSize={paged.pageSize}
                  totalCount={paged.totalCount}
                  totalPages={paged.totalPages}
                  hasPreviousPage={paged.hasPreviousPage}
                  hasNextPage={paged.hasNextPage}
                  onPageChange={setPageIndex}
                  onPageSizeChange={handlePageSizeChange}
                />
              : null
          }
        />
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-lotus-leaf/30 overflow-hidden">
            <div className="h-full w-1/3 bg-lotus-leaf animate-[slide_1s_ease-in-out_infinite]" />
          </div>
        )}
      </motion.div>

      <TreatmentCourseFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <TreatmentCourseFormDialog
        open={!!editCourse}
        onOpenChange={(open) => { if (!open) setEditCourse(null) }}
        course={editCourse}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Xóa liệu trình"
        description={`Bạn có chắc muốn xóa liệu trình "${deleteTarget?.name ?? ''}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  )
}
