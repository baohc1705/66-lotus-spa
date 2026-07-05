import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table'
import { Plus, ShieldCheck } from 'lucide-react'
import { StaffCertificateDetailExpanded } from '../components/StaffCertificateDetailExpanded'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { DataTableViewOptions } from '@/shared/components/DataTable/DataTableViewOptions'
import { TablePageShell } from '@/shared/components/DataTable/TablePageShell'
import { TableEmptyState } from '@/shared/components/DataTable/TableEmptyState'
import { Button } from '@/shared/components/ui/button'
import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataTablePagination } from '@/shared/components/DataTable/DataTablePagination'
import { DataTableToolbar } from '@/shared/components/DataTable/DataTableToolbar'
import { StaffCertificateFormDialog } from '../components/StaffCertificateFormDialog'
import { useActiveStaffCertificateColumns, STAFF_CERTIFICATE_COLUMN_LABELS } from '../components/useActiveStaffCertificateColumns'
import { useStaffCertificates, useDeleteStaffCertificate } from '../hooks/useStaffCertificates'
import { useStaffCertificateListState } from '../hooks/useStaffCertificateListState'
import { CERTIFICATE_PERM } from '../constants/certificate.permissions'
import { CONFIRM_MSG } from '@/shared/constants/confirm.messages'
import { COMMON_MSG } from '@/shared/constants/common.messages'
import { DEFAULT_LOADING_ROWS } from '@/shared/constants/display.const'

interface Props {
  staffId?: number
}

const ENTITY = 'chứng chỉ'

export function StaffCertificatesPage({ staffId }: Props) {
  const perm = CERTIFICATE_PERM
  const listState = useStaffCertificateListState()
  const {
    pageIndex,
    pageSize,
    filter,
    columnVisibility,
    createOpen,
    editTarget,
    deleteTarget,
    setPageIndex,
    handlePageSizeChange,
    setCreateOpen,
    setEditTarget,
    setDeleteTarget,
    setColumnVisibility,
    handleSearchChange,
    queryParams,
  } = listState

  const mergedParams = useMemo(() => ({
    ...queryParams,
    staffId,
  }), [queryParams, staffId])

  const { data: result, isLoading, isFetching } = useStaffCertificates(mergedParams)
  const deleteMutation = useDeleteStaffCertificate()

  const paged = result?.data
  const items = useMemo(() => paged?.items ?? [], [paged?.items])

  const columns = useActiveStaffCertificateColumns({
    pageIndex,
    pageSize,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  })

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

  const handleDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (r) => {
          if (r.isSuccess) setDeleteTarget(null)
        },
      })
    }
  }

  const columnLabels = useMemo(() => ({ ...STAFF_CERTIFICATE_COLUMN_LABELS }), [])

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden">
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên chứng chỉ, tổ chức..."
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
            <PermissionGate resource={perm.resource} action={perm.create}>
              <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="text-[12px] gap-1.5">
                <Plus className="w-3.5 h-3.5" />Thêm chứng chỉ
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) => (
            <StaffCertificateDetailExpanded
              cert={row.original}
              onEdit={() => setEditTarget(row.original)}
            />
          )}
          emptyState={
            <TableEmptyState
              icon={ShieldCheck}
              title="Chưa có chứng chỉ"
              hint="Thêm chứng chỉ để quản lý bằng cấp nhân viên."
              action={
                <PermissionGate resource={perm.resource} action={perm.create}>
                  <Button variant="admin" size="sm" onClick={() => setCreateOpen(true)} className="mt-1 text-[12px]">
                    <Plus className="w-3.5 h-3.5" />Thêm chứng chỉ
                  </Button>
                </PermissionGate>
              }
            />
          }
          pagination={
            paged && paged.totalCount > 0 ? (
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
      </div>

      <StaffCertificateFormDialog open={createOpen} onOpenChange={setCreateOpen} staffId={staffId} />
      <StaffCertificateFormDialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }} item={editTarget} staffId={staffId} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title={CONFIRM_MSG.deleteTitle(ENTITY)}
        description={CONFIRM_MSG.deleteDescription(ENTITY, deleteTarget?.certificateName ?? '')}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </TablePageShell>
  )
}
