import { useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { Briefcase, Plus } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { useAuthStore } from "@/features/auth/stores/authStore";

import { ShiftFormDialog } from "../components/ShiftFormDialog";
import {
  SHIFT_COLUMN_LABELS,
  useActiveShiftColumns,
} from "../components/useActiveShiftColumns";
import { SHIFT_PERM } from "../constants/shift.permissions";
import { useShiftListState } from "../hooks/useShiftListState";
import { useAdminShifts, useDeleteShift } from "../hooks/useShifts";

const ENTITY = "ca làm việc";

export function ShiftListPage() {
  "use no memo";

  const perm = SHIFT_PERM;
  const listState = useShiftListState();
  const isAdmin = useAuthStore((state) => state.hasRole("Admin"));
  const selectedSalonId = useAuthStore((state) => state.selectedSalonId);
  const getEffectiveSalonId = useAuthStore((state) => state.getEffectiveSalonId);

  // Admin: null = tat ca chi nhanh. Manager/staff: theo salon hieu luc.
  const branchSalonId = isAdmin ? selectedSalonId : getEffectiveSalonId();

  const {
    queryParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    pageIndex,
    pageSize,
    columnVisibility,
    setColumnVisibility,
    orderBy,
    isDescending,
    handleSort,
    handlePageSizeChange,
    handleSearchChange,
    filter,
    setPageIndex,
  } = listState;

  useEffect(() => {
    setPageIndex(1);
  }, [branchSalonId, setPageIndex]);

  const shiftQueryParams = useMemo(
    () => ({
      ...queryParams,
      salonId: branchSalonId || undefined,
    }),
    [queryParams, branchSalonId],
  );

  const {
    data: shiftResult,
    isLoading,
    isFetching,
  } = useAdminShifts(shiftQueryParams);
  const deleteMutation = useDeleteShift();

  const paged = shiftResult?.data;
  const shifts = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const activeColumns = useActiveShiftColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: shifts,
    columns: activeColumns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...SHIFT_COLUMN_LABELS }), []);

  const handleDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
    }
  };

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-3 pt-3">
          <DataTableToolbar
            searchPlaceholder="Tìm kiếm ca..."
            searchValue={filter}
            onSearchChange={handleSearchChange}
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
            <PermissionGate resource={perm.resource} action={perm.create}>
              <Button
                variant="primary"
                size="sm"
                className="mb-0"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm ca làm việc
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          emptyState={
            <TableEmptyState
              icon={Briefcase}
              title="Chưa có ca làm việc"
              action={
                <PermissionGate resource={perm.resource} action={perm.create}>
                  <Button
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm ca làm việc
                  </Button>
                </PermissionGate>
              }
            />
          }
          pagination={
            totalCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 text-xs text-kit-muted">
                  <span>
                    {rangeStart}-{rangeEnd} / {totalCount}
                  </span>
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
                </div>
                <Pagination
                  page={safePage}
                  pageCount={totalPages}
                  onPageChange={listState.setPageIndex}
                  size="sm"
                />
              </div>
            ) : null
          }
        />
      </TablePageShell>

      <ShiftFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        shift={null}
      />

      {editTarget ? (
        <ShiftFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          shift={editTarget}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title={`Xóa ${ENTITY}`}
          description={`Bạn có chắc muốn xóa ${ENTITY} "${deleteTarget.name ?? ""}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          confirmLabel="Xóa"
          loading={deleteMutation.isPending}
          variant="danger"
        />
      ) : null}
    </div>
  );
}
