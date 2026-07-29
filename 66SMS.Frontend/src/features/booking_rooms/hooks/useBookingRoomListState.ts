import { useState, useEffect, useMemo } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { BookingRoomDTO } from "../types/booking_room.types";

export function useBookingRoomListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BookingRoomDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingRoomDTO | null>(null);

  const salonId = useAuthStore((s) => s.getEffectiveSalonId());

  useEffect(() => {
    table.resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [salonId]);

  const queryParams = useMemo(
    () => ({
      pageIndex: table.pageIndex,
      pageSize: table.pageSize,
      keyword: table.filter || undefined,
      orderBy: table.orderBy,
      isDescending: table.isDescending,
      salonId: salonId ?? undefined,
    }),
    [
      table.pageIndex,
      table.pageSize,
      table.filter,
      table.orderBy,
      table.isDescending,
      salonId,
    ],
  );

  return {
    ...table,
    queryParams,
    salonId,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
  };
}
