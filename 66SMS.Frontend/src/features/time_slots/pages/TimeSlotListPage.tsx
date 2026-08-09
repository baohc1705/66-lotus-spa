import { useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Clock, Plus } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";

import { TimeSlotFormDialog } from "../components/TimeSlotFormDialog";
import {
  TIME_SLOT_COLUMN_LABELS,
  useActiveTimeSlotColumns,
} from "../components/useActiveTimeSlotColumns";
import { TIME_SLOT_PERM } from "../constants/time_slot.permissions";
import { useTimeSlotListState } from "../hooks/useTimeSlotListState";
import { useAdminTimeSlots, useDeleteTimeSlot } from "../hooks/useTimeSlots";

const ENTITY = "khung giờ";

export function TimeSlotListPage() {
  "use no memo";

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

  const {
    data: timeSlotResult,
    isLoading,
    isFetching,
  } = useAdminTimeSlots(queryParams);
  const deleteMutation = useDeleteTimeSlot();

  const paged = timeSlotResult?.data;
  const timeSlots = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const activeColumns = useActiveTimeSlotColumns({
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
    data: timeSlots,
    columns: activeColumns,
    state: { columnVisibility },
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

  const deleteLabel = deleteTarget
    ? `${toLocalTimeOnly(deleteTarget.startTime)} - ${toLocalTimeOnly(deleteTarget.endTime)}`
    : "";

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-3 pt-3">
          <DataTableToolbar
            searchPlaceholder="Tìm kiếm khung giờ..."
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
                Thêm khung giờ
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
              icon={Clock}
              title="Chưa có khung giờ"
              hint="Thêm khung giờ để quản lý lịch đặt dịch vụ."
              action={
                <PermissionGate resource={perm.resource} action={perm.create}>
                  <Button
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm khung giờ
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

      <TimeSlotFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        timeSlot={null}
      />

      {editTarget ? (
        <TimeSlotFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          timeSlot={editTarget}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title={CONFIRM_MSG.deleteTitle(ENTITY)}
          description={CONFIRM_MSG.deleteDescription(ENTITY, deleteLabel)}
          onConfirm={handleDelete}
          confirmLabel={COMMON_MSG.delete}
          loading={deleteMutation.isPending}
          variant="danger"
        />
      ) : null}
    </div>
  );
}
