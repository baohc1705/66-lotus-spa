import { BookingPositionForm } from "@/features/booking_positions/components/BookingPositionForm";
import { BookingPositionTable } from "@/features/booking_positions/components/BookingPositionTable";
import type { BookingPositionDto } from "@/features/booking_positions/types/bookingPosition.types";
import { useState } from "react";

export function BookingPositionListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BookingPositionDto | null>(null);
  const [createRoomId, setCreateRoomId] = useState<number | null>(null);

  return (
    <>
      <BookingPositionTable
        onEdit={setEditTarget}
        onCreate={(roomId) => {
          setCreateRoomId(roomId);
          setCreateOpen(true);
        }}
      />

      <BookingPositionForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultRoomId={createRoomId}
      />

      <BookingPositionForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        bookingPosition={editTarget}
      />
    </>
  );
}
