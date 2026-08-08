import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo } from "react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { BookingRoomDetailExpanded } from "../components/BookingRoomDetailExpanded";
import { BookingRoomFormDialog } from "../components/BookingRoomFormDialog";
import { BookingRoomStatCards } from "../components/BookingRoomStatCards";
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
import type { BookingRoomDTO } from "../types/booking_room.types";

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

  const {
    data: roomResult,
    isLoading,
    isFetching,
  } = useAdminBookingRooms(queryParams);

  const { data: allRoomsResult } = useAdminBookingRooms({
    pageIndex: 1,
    pageSize: 10000,
  });

  const deleteMutation = useDeleteBookingRoom();
  const updateMutation = useUpdateBookingRoom();

  const paged = roomResult?.data;
  const rooms = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const allRooms = useMemo(
    () => allRoomsResult?.data?.items ?? [],
    [allRoomsResult],
  );

  const availablePositions = useMemo(
    () =>
      allRooms.reduce(
        (sum: number, room: BookingRoomDTO) => sum + (room.availableCount ?? 0),
        0,
      ),
    [allRooms],
  );

  const inServicePositions = useMemo(
    () =>
      allRooms.reduce(
        (sum: number, room: BookingRoomDTO) => sum + (room.inServiceCount ?? 0),
        0,
      ),
    [allRooms],
  );

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
    getRowCanExpand: () => true,
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
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <BookingRoomStatCards
        totalRooms={allRoomsResult?.data?.totalCount ?? totalCount}
        availablePositions={availablePositions}
        inServicePositions={inServicePositions}
        isLoading={isLoading && allRooms.length === 0}
      />

      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <DataTableToolbar
            searchPlaceholder="Tìm kiếm phòng..."
            searchValue={filter}
            onSearchChange={handleSearchChange}
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
            <PermissionGate resource={perm.resource} action={perm.create}>
              <Button
                variant="admin"
                size="sm"
                className="mb-0"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Thêm phòng dịch vụ
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          renderExpandedRow={({ row }) =>
            row.original.id ? (
              <BookingRoomDetailExpanded
                roomId={row.original.id}
                onEdit={setEditTarget}
              />
            ) : null
          }
          pagination={
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3 text-xs text-kit-muted">
                <span>
                  {totalCount === 0 ? "0" : `${rangeStart}-${rangeEnd}`} /{" "}
                  {totalCount}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
          }
        />
      </TablePageShell>

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
          description={CONFIRM_MSG.deleteDescription(
            ENTITY,
            deleteTarget.name ?? "",
          )}
          onConfirm={handleDelete}
          confirmLabel={COMMON_MSG.delete}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
