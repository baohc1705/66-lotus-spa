import { useState } from "react";
import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import type { BookingRoomDTO } from "../types/booking_room.types";

export function useBookingRoomListState() {
  const table = useTableQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BookingRoomDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingRoomDTO | null>(null);

  return {
    ...table,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
  };
}
