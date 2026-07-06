import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus, Building2 } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { SalonFormDialog } from "../components/SalonFormDialog";
import { SalonDetailExpanded } from "../components/SalonDetailExpanded";
import { useAdminSalons, useDeleteSalonMutation } from "../hooks/useSalons";
import { useSalonListState } from "../hooks/useSalonListState";
import { useActiveSalonColumns, SALON_COLUMN_LABELS } from "../components/useActiveSalonColumns";
import { SALON_PERM } from "../constants/salon.permissions";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";

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
    editTarget,
    setEditTarget,
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
    onEdit: setEditTarget,
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
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden relative">
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên, mã, SĐT..."
          >
            <DataTableViewOptions
              table={table}
              columnLabels={columnLabels}
            />
            <PermissionGate resource={perm.resource} action={perm.create} role={perm.role}>
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="lotus-admin-table-toolbar-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm chi nhánh
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
            row.original.id ? (
              <SalonDetailExpanded
                salonId={row.original.id}
                onEdit={setEditTarget}
              />
            ) : null
          }
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Building2 className="w-7 h-7 text-lotus-leaf" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">
                  Chưa có chi nhánh
                </p>
                <p className="text-lotus-admin-md text-lotus-stone mt-0.5">
                  Thêm chi nhánh để bắt đầu quản lý hệ thống.
                </p>
              </div>
              <PermissionGate resource={perm.resource} action={perm.create} role={perm.role}>
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="mt-1 text-lotus-admin-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm chi nhánh
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
      </div>

      <SalonFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <SalonFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        salon={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={CONFIRM_MSG.deleteTitle(ENTITY)}
        description={CONFIRM_MSG.deleteDescription(ENTITY, deleteTarget?.name ?? "")}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </TablePageShell>
  );
}
