import { AdminScheduleGrid } from "@/shared/components/calendar/AdminScheduleGrid";
import { formatDate } from "@/shared/utils/date.utils";
import type { StaffScheduleBooking } from "../types";

interface StaffDayGridProps {
  date: Date;
  bookings: StaffScheduleBooking[];
  staffName: string;
  onBookingClick: (booking: StaffScheduleBooking, date: string) => void;
}

export function StaffDayGrid({
  date,
  bookings,
  staffName,
  onBookingClick,
}: StaffDayGridProps) {
  const dateKey = formatDate(date).format("YYYY-MM-DD");
  const byId = new Map<string, StaffScheduleBooking>();

  const events = bookings.map((booking) => {
    byId.set(booking.id, booking);
    return {
      id: booking.id,
      date: dateKey,
      title: booking.customerName,
      subtitle: booking.serviceName,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    };
  });

  return (
    <AdminScheduleGrid
      days={[{ date: dateKey }]}
      events={events}
      columnTitle={staffName}
      highlightDate={date}
      onEventClick={(event, day) => {
        const booking = byId.get(event.id);
        if (booking) onBookingClick(booking, day);
      }}
    />
  );
}
