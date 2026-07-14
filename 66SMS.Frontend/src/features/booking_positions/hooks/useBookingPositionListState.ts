import { useState, useCallback, useMemo } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { BookingPositionDTO } from "../types/booking_position.types";

export function useBookingPositionListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BookingPositionDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingPositionDTO | null>(
    null,
  );
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const handleSelectRoom = useCallback(
    (id: number | null) => {
      setSelectedRoomId(id);
      table.resetPage();
    },
    [table],
  );

  const queryParams = useMemo(
    () => ({
      pageIndex: table.pageIndex,
      pageSize: table.pageSize,
      keyword: table.filter || undefined,
      orderBy: table.orderBy,
      isDescending: table.isDescending,
      roomId: selectedRoomId ?? undefined,
    }),
    [
      table.pageIndex,
      table.pageSize,
      table.filter,
      table.orderBy,
      table.isDescending,
      selectedRoomId,
    ],
  );

  return {
    ...table,
    queryParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    selectedRoomId,
    setSelectedRoomId,
    handleSelectRoom,
  };
}
