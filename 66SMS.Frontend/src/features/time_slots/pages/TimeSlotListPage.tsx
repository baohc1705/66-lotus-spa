import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
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
import { TABLE_STYLES } from "@/shared/styles/table.styles";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";

import { TimeSlotFormDialog } from "../components/TimeSlotFormDialog";
import { useTimeSlotListState } from "../hooks/useTimeSlotListState";
import {
  TIME_SLOT_COLUMN_LABELS,
  useActiveTimeSlotColumns,
} from "../components/useActiveTimeSlotColumns";
import { TIME_SLOT_PERM } from "../constants/time_slot.permissions";
import {
  useAdminTimeSlots,
  useDeleteTimeSlot,
} from "../hooks/useTimeSlots";

const ENTITY = "khung giờ";

export function TimeSlotListPage() {
  const perm = TIME_SLOT_PERM;
  const listState = useTimeSlotListState();

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

  const { data: timeSlotResult, isLoading, isFetching } = useAdminTimeSlots(queryParams);
  const deleteMutation = useDeleteTimeSlot();

  const paged = timeSlotResult?.data;
  const timeSlots = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const activeColumns = useActiveTimeSlotColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  const table = useReactTable({
    data: timeSlots,
    columns: activeColumns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...TIME_SLOT_COLUMN_LABELS }), []);

  const handleDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
    }
  };

  const formatDisplayTime = (t?: string) => {
    if (!t) return "";
    return t.substring(0, 5);
  };

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <DataTableToolbar
        searchPlaceholder="Tìm kiếm khung giờ..."
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
              className="h-8 text-[13px] gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm khung giờ
            </Button>
          </PermissionGate>
        </div>
      </DataTableToolbar>

      <div className={TABLE_STYLES.pageCard}>
        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
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

      <TimeSlotFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        timeSlot={null}
      />

      {editTarget && (
        <TimeSlotFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          timeSlot={editTarget}
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
            `${formatDisplayTime(deleteTarget.startTime)} - ${formatDisplayTime(deleteTarget.endTime)}`
          )}
          onConfirm={handleDelete}
          confirmLabel={COMMON_MSG.delete}
          loading={deleteMutation.isPending}
        />
      )}
    </TablePageShell>
  );
}
