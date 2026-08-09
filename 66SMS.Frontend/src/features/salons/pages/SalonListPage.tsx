import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus, Building2 } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { SalonFormDialog } from "../components/SalonFormDialog";
import { SalonDetailExpanded } from "../components/SalonDetailExpanded";
import { useAdminSalons, useDeleteSalonMutation } from "../hooks/useSalons";
import { useSalonListState } from "../hooks/useSalonListState";
import {
  useActiveSalonColumns,
  SALON_COLUMN_LABELS,
} from "../components/useActiveSalonColumns";
import { SALON_PERM } from "../constants/salon.permissions";

const ENTITY = "chi nhánh";

export function SalonListPage() {
  const perm = SALON_PERM;
  const listState = useSalonListState();
  const {
    pageIndex,
    setPageIndex,
    pageSize,
    filter,
    columnVisibility,
    setColumnVisibility,
    handlePageSizeChange,
    handleSearchChange,
    createOpen,
    setCreateOpen,
    editSalonId,
    setEditSalonId,
    deleteTarget,
    setDeleteTarget,
  } = listState;

  const {
    data: salonsResult,
    isLoading,
    isFetching,
  } = useAdminSalons({
    pageIndex,
    pageSize,
    keyword: filter || undefined,
  });

  const deleteMutation = useDeleteSalonMutation();

  const paged = salonsResult?.data;
  const salons = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);

  const handleConfirmDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
    }
  };

  const columns = useActiveSalonColumns({
    pageIndex,
    pageSize,
    onEdit: (item) => {
      if (item.id) setEditSalonId(item.id);
    },
    onDelete: setDeleteTarget,
  });

  const columnLabels = useMemo(() => ({ ...SALON_COLUMN_LABELS }), []);

  const table = useReactTable({
    data: salons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    manualPagination: true,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên, mã, Số điện thoại..."
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
            <PermissionGate
              resource={perm.resource}
              action={perm.create}
              role={perm.role}
            >
              <Button
                variant="admin"
                size="sm"
                className="mb-0"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Thêm chi nhánh
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          onRowClick={(row) => row.toggleExpanded()}
          renderExpandedRow={({ row }) =>
            row.original.id ? (
              <SalonDetailExpanded
                salonId={row.original.id}
                onEdit={(salon) => {
                  if (salon.id) setEditSalonId(salon.id);
                }}
              />
            ) : null
          }
          emptyState={
            <TableEmptyState
              icon={Building2}
              title="Chưa có chi nhánh"
              action={
                <PermissionGate
                  resource={perm.resource}
                  action={perm.create}
                  role={perm.role}
                >
                  <Button
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm chi nhánh
                  </Button>
                </PermissionGate>
              }
            />
          }
          pagination={
            totalCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <select
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(Number(e.target.value))
                  }
                  className="h-8 cursor-pointer rounded border border-kit bg-kit-white px-2 text-xs text-kit-heading outline-none focus:border-kit-primary"
                >
                  {[5, 10, 20].map((size: number) => (
                    <option key={size} value={size}>
                      {size} / trang
                    </option>
                  ))}
                </select>
                <Pagination
                  page={safePage}
                  pageCount={totalPages}
                  onPageChange={setPageIndex}
                  size="sm"
                />
              </div>
            ) : null
          }
        />
      </TablePageShell>

      <SalonFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <SalonFormDialog
        open={editSalonId != null}
        onOpenChange={(open) => {
          if (!open) setEditSalonId(null);
        }}
        salonId={editSalonId}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Xóa ${ENTITY}`}
        description={`Bạn có chắc muốn xóa ${ENTITY} "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
