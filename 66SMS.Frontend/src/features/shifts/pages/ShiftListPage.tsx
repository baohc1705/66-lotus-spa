import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";

import { ShiftFormDialog } from "../components/ShiftFormDialog";
import { ShiftDetailExpanded } from "../components/ShiftDetailExpanded";
import { useShiftListState } from "../hooks/useShiftListState";
import {
  SHIFT_COLUMN_LABELS,
  useActiveShiftColumns,
} from "../components/useActiveShiftColumns";
import { SHIFT_PERM } from "../constants/shift.permissions";
import { useAdminShifts, useDeleteShift } from "../hooks/useShifts";

const ENTITY = "ca làm việc";

export function ShiftListPage() {
  const perm = SHIFT_PERM;
  const listState = useShiftListState();

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
  } = listState;

  const {
    data: shiftResult,
    isLoading,
    isFetching,
  } = useAdminShifts(queryParams);
  const deleteMutation = useDeleteShift();

  const paged = shiftResult?.data;
  const shifts = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const activeColumns = useActiveShiftColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  const table = useReactTable({
    data: shifts,
    columns: activeColumns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <DataTableToolbar
        searchPlaceholder="Tìm kiếm ca..."
        searchValue={filter}
        onSearchChange={handleSearchChange}
      >
        <DataTableViewOptions table={table} columnLabels={columnLabels} />
        <div className="flex items-center gap-2 ml-auto">
          <PermissionGate resource={perm.resource} action={perm.create}>
            <Button
              variant="admin"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="lotus-admin-table-toolbar-btn"
            >
              <Plus className="w-4 h-4" />
              Thêm ca làm việc
            </Button>
          </PermissionGate>
        </div>
      </DataTableToolbar>

      <div className="lotus-admin-table-page-card">
        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          renderSubComponent={({ row }) =>
            row.original.id ? (
              <ShiftDetailExpanded shift={row.original} />
            ) : null
          }
        />
      </div>

      <DataTablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={paged?.totalPages ?? 0}
        hasPreviousPage={paged?.hasPreviousPage ?? false}
        hasNextPage={paged?.hasNextPage ?? false}
        onPageChange={listState.setPageIndex}
        onPageSizeChange={handlePageSizeChange}
      />

      <ShiftFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        shift={null}
      />

      {editTarget && (
        <ShiftFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          shift={editTarget}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title={CONFIRM_MSG.deleteTitle(ENTITY)}
          description={CONFIRM_MSG.deleteDescription(
            ENTITY,
            deleteTarget.name ?? "",
          )}
          onConfirm={handleDelete}
          confirmLabel={COMMON_MSG.delete}
          loading={deleteMutation.isPending}
        />
      )}
    </TablePageShell>
  );
}
