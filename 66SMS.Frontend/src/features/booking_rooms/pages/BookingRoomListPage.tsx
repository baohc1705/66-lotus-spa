import { BookingRoomForm } from "@/features/booking_rooms/components/BookingRoomForm";
import { BookingRoomTable } from "@/features/booking_rooms/components/BookingRoomTable";
import type { BookingRoomDto } from "@/features/booking_rooms/types/bookingRoom.types";
import { useState } from "react";

export function BookingRoomListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BookingRoomDto | null>(null);

  return (
    <>
      <BookingRoomTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <BookingRoomForm open={createOpen} onOpenChange={setCreateOpen} />

      <BookingRoomForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        bookingRoom={editTarget}
      />
    </>
  );
}
