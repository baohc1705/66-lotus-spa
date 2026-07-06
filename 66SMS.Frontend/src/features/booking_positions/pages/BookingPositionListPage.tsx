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

import { BookingPositionFormDialog } from "../components/BookingPositionFormDialog";
import { BookingRoomSidebar } from "../components/BookingRoomSidebar";
import { BookingPositionStatCards } from "../components/BookingPositionStatCards";
import { useBookingPositionListState } from "../hooks/useBookingPositionListState";
import {
  BOOKING_POSITION_COLUMN_LABELS,
  useActiveBookingPositionColumns,
} from "../components/useActiveBookingPositionColumns";
import { BOOKING_POSITION_PERM } from "../constants/booking_position.permissions";
import {
  useAdminBookingPositions,
  useDeleteBookingPosition,
  useUpdateBookingPosition,
} from "../hooks/useBookingPositions";

const ENTITY = "vị trí dịch vụ";

export function BookingPositionListPage() {
  const perm = BOOKING_POSITION_PERM;
  const listState = useBookingPositionListState();

  const {
    queryParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    selectedRoomId,
    handleSelectRoom,
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

  // Active paginated query
  const { data: positionResult, isLoading, isFetching } = useAdminBookingPositions(queryParams);

  // Global query for stat cards calculations
  const { data: allPositionsResult } = useAdminBookingPositions({
    pageIndex: 1,
    pageSize: 10000,
  });

  const deleteMutation = useDeleteBookingPosition();
  const updateMutation = useUpdateBookingPosition();

  const paged = positionResult?.data;
  const positions = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const allPositions = useMemo(() => allPositionsResult?.data?.items ?? [], [allPositionsResult]);

  const totalPositionsCount = allPositions.length;
  const activePositionsCount = useMemo(
    () => allPositions.filter((p) => p.status === 1).length,
    [allPositions],
  );
  const maintenancePositionsCount = useMemo(
    () => allPositions.filter((p) => p.status === 0).length,
    [allPositions],
  );

  const activeColumns = useActiveBookingPositionColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
    updateMutation,
  });

  const table = useReactTable({
    data: positions,
    columns: activeColumns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...BOOKING_POSITION_COLUMN_LABELS }), []);

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
      <BookingPositionStatCards
        totalPositions={totalPositionsCount}
        activePositions={activePositionsCount}
        maintenancePositions={maintenancePositionsCount}
        isLoading={isLoading}
      />

      <div className="flex flex-col md:flex-row gap-6 mt-6 items-start">
        <BookingRoomSidebar
          selectedRoomId={selectedRoomId}
          onSelectRoom={handleSelectRoom}
        />

        <div className="flex-1 w-full space-y-4">
          <DataTableToolbar
            searchPlaceholder="Tìm kiếm vị trí..."
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
                  Thêm vị trí
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
        </div>
      </div>

      <BookingPositionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        bookingPosition={null}
      />

      {editTarget && (
        <BookingPositionFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          bookingPosition={editTarget}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title={CONFIRM_MSG.deleteTitle(ENTITY)}
          description={CONFIRM_MSG.deleteDescription(ENTITY, deleteTarget.name ?? "")}
          onConfirm={handleDelete}
          confirmLabel={COMMON_MSG.delete}
          loading={deleteMutation.isPending}
        />
      )}
    </TablePageShell>
  );
}
