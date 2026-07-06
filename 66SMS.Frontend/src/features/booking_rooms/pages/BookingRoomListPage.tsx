import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo } from "react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/components/ui/button";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { BookingRoomDetailExpanded } from "../components/BookingRoomDetailExpanded";
import { BookingRoomFormDialog } from "../components/BookingRoomFormDialog";
import {
  BOOKING_ROOM_COLUMN_LABELS,
  useActiveBookingRoomColumns,
} from "../components/useActiveBookingRoomColumns";
import { BOOKING_ROOM_PERM } from "../constants/booking_room.permissions";
import { useBookingRoomListState } from "../hooks/useBookingRoomListState";
import {
  useAdminBookingRooms,
  useDeleteBookingRoom,
  useUpdateBookingRoom,
} from "../hooks/useBookingRooms";

const ENTITY = "phòng dịch vụ";

export function BookingRoomListPage() {
  const perm = BOOKING_ROOM_PERM;
  const listState = useBookingRoomListState();

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

  const { data: roomResult, isLoading, isFetching } = useAdminBookingRooms(queryParams);

  const deleteMutation = useDeleteBookingRoom();
  const updateMutation = useUpdateBookingRoom();

  const paged = roomResult?.data;
  const rooms = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const activeColumns = useActiveBookingRoomColumns({
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
    data: rooms,
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

  const columnLabels = useMemo(() => ({ ...BOOKING_ROOM_COLUMN_LABELS }), []);

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
        searchPlaceholder="Tìm kiếm phòng..."
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
              Thêm phòng dịch vụ
            </Button>
          </PermissionGate>
        </div>
      </DataTableToolbar>

      <div className="lotus-admin-table-page-card">
        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          renderSubComponent={({ row }) => (
            row.original.id ? (
              <BookingRoomDetailExpanded
                roomId={row.original.id}
                onEdit={setEditTarget}
              />
            ) : null
          )}
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

      <BookingRoomFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        bookingRoom={null}
      />

      {editTarget && (
        <BookingRoomFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          bookingRoom={editTarget}
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
