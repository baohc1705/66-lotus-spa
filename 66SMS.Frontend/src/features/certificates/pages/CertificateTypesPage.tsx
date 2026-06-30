import { useState, useCallback, useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table'
import { Plus, MoreHorizontal, Pencil, Trash2, Award } from 'lucide-react'
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
import { Badge } from '@/shared/components/ui/badge'
import { CertificateTypeFormDialog } from '../components/CertificateTypeFormDialog'
import { useCertificateTypes, useDeleteCertificateType } from '../hooks/useCertificateTypes'
import type { CertificateTypeDTO } from '../types/certificate.types'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export function CertificateTypesPage() {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filter, setFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<CertificateTypeDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CertificateTypeDTO | null>(null)

  const { data: result, isLoading, isFetching } = useCertificateTypes({
    pageIndex,
    pageSize,
    filter: filter || undefined,
  })

  const deleteMutation = useDeleteCertificateType()

  const paged = result?.data
  const items = useMemo(() => paged?.items ?? [], [paged?.items])
  const totalCount = paged?.totalCount ?? 0

  const handleDelete = useCallback(() => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (r) => { if (r.isSuccess) setDeleteTarget(null) },
      })
    }
  }, [deleteTarget, deleteMutation])

  const columns = useMemo<ColumnDef<CertificateTypeDTO>[]>(
    () => [
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
        header: 'Mã',
        cell: ({ row }) => (
          <span className="font-mono text-[12px] bg-stone-100 px-1.5 py-0.5 rounded text-lotus-deep">
            {row.original.code}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: 'name',
        header: 'Tên loại chứng chỉ',
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">{row.original.name}</span>
        ),
        size: 250,
      },
      {
        accessorKey: 'description',
        header: 'Mô tả',
        cell: ({ row }) => (
          <span className="text-lotus-deep/70 text-[12px]">{row.original.description || '—'}</span>
        ),
        size: 280,
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const s = row.original.status
          return (
            <Badge variant="outline" className={s === 1
              ? 'bg-green-100 text-green-700 border-green-200 text-[11px]'
              : 'bg-stone-100 text-stone-500 border-stone-200 text-[11px]'
            }>
              {s === 1 ? 'Hoạt động' : 'Tạm đóng'}
            </Badge>
          )
        },
        size: 110,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const cert = row.original
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditItem(cert)}>
                    <Pencil className="w-4 h-4 mr-2" />Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(cert)}>
                    <Trash2 className="w-4 h-4 mr-2" />Xóa
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
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
            onSearchChange={(v) => { setFilter(v); setPageIndex(1) }}
            searchPlaceholder="Tìm theo tên, mã..."
          >
            <DataTableViewOptions table={table} columnLabels={{ code: 'Mã', name: 'Tên', description: 'Mô tả', status: 'Trạng thái' }} />
            <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="text-[12px] gap-1.5">
              <Plus className="w-3.5 h-3.5" />Thêm loại chứng chỉ
            </Button>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Award className="w-7 h-7 text-lotus-leaf" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">Chưa có loại chứng chỉ</p>
                <p className="text-[12px] text-lotus-stone mt-0.5">Thêm loại chứng chỉ để quản lý bằng cấp nhân viên.</p>
              </div>
              <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="mt-1 text-[12px]">
                <Plus className="w-3.5 h-3.5" />Thêm loại chứng chỉ
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
                onPageSizeChange={(size) => { setPageSize(size); setPageIndex(1) }}
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

      <CertificateTypeFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CertificateTypeFormDialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null) }} item={editItem} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Xóa loại chứng chỉ"
        description={`Bạn có chắc muốn xóa loại chứng chỉ "${deleteTarget?.name ?? ''}"?`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  )
}
