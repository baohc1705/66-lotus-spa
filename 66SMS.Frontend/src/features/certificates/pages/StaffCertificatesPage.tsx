import { useState, useCallback, useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table'
import { Plus, MoreHorizontal, Pencil, Trash2, ShieldCheck, Eye } from 'lucide-react'
import { StaffCertificateDetailExpanded } from '../components/StaffCertificateDetailExpanded'
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
import { CertificateStatusBadge, ExpiryBadge } from '../components/CertificateStatusBadge'
import { StaffCertificateFormDialog } from '../components/StaffCertificateFormDialog'
import { useStaffCertificates, useDeleteStaffCertificate } from '../hooks/useStaffCertificates'
import type { StaffCertificateDTO } from '../types/certificate.types'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

interface Props {
  staffId?: number
}

export function StaffCertificatesPage({ staffId }: Props) {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filter, setFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<StaffCertificateDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StaffCertificateDTO | null>(null)

  const { data: result, isLoading, isFetching } = useStaffCertificates({
    pageIndex,
    pageSize,
    staffId,
    filter: filter || undefined,
  })

  const deleteMutation = useDeleteStaffCertificate()

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

  const columns = useMemo<ColumnDef<StaffCertificateDTO>[]>(
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
        accessorKey: 'staffName',
        header: 'Nhân viên',
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">{row.original.staffName}</span>
        ),
        size: 160,
      },
      {
        accessorKey: 'certificateName',
        header: 'Tên chứng chỉ',
        cell: ({ row }) => (
          <div>
            <p className="text-[13px] font-medium text-lotus-deep">{row.original.certificateName}</p>
            <p className="text-[11px] text-lotus-stone">{row.original.typeName}</p>
          </div>
        ),
        size: 220,
      },
      {
        accessorKey: 'issuingOrganization',
        header: 'Tổ chức cấp',
        cell: ({ row }) => (
          <span className="text-[12px] text-lotus-deep/80">{row.original.issuingOrganization}</span>
        ),
        size: 180,
      },
      {
        accessorKey: 'issuedDate',
        header: 'Ngày cấp',
        cell: ({ row }) => (
          <span className="text-[12px] text-lotus-deep/70">{row.original.issuedDate?.slice(0, 10)}</span>
        ),
        size: 110,
      },
      {
        accessorKey: 'expiryDate',
        header: 'Hết hạn',
        cell: ({ row }) => <ExpiryBadge expiryDate={row.original.expiryDate ?? undefined} />,
        size: 160,
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <CertificateStatusBadge status={row.original.status} />,
        size: 130,
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
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4 mr-2" />{row.getIsExpanded() ? 'Đóng chi tiết' : 'Xem chi tiết'}
                  </DropdownMenuItem>
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
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
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
            searchPlaceholder="Tìm theo tên chứng chỉ, tổ chức..."
          >
            <DataTableViewOptions table={table} columnLabels={{
              staffName: 'Nhân viên',
              certificateName: 'Chứng chỉ',
              issuingOrganization: 'Tổ chức cấp',
              issuedDate: 'Ngày cấp',
              expiryDate: 'Hết hạn',
              status: 'Trạng thái',
            }} />
            <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="text-[12px] gap-1.5">
              <Plus className="w-3.5 h-3.5" />Thêm chứng chỉ
            </Button>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) => (
            <StaffCertificateDetailExpanded
              cert={row.original}
              onEdit={() => setEditItem(row.original)}
            />
          )}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-lotus-leaf" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">Chưa có chứng chỉ</p>
                <p className="text-[12px] text-lotus-stone mt-0.5">Thêm chứng chỉ để quản lý bằng cấp nhân viên.</p>
              </div>
              <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="mt-1 text-[12px]">
                <Plus className="w-3.5 h-3.5" />Thêm chứng chỉ
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

      <StaffCertificateFormDialog open={createOpen} onOpenChange={setCreateOpen} staffId={staffId} />
      <StaffCertificateFormDialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null) }} item={editItem} staffId={staffId} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Xóa chứng chỉ"
        description={`Bạn có chắc muốn xóa chứng chỉ "${deleteTarget?.certificateName ?? ''}"?`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  )
}
