import { AdminScheduleGrid } from "@/shared/components/calendar/AdminScheduleGrid";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";
import type { StaffScheduleBooking, StaffScheduleDayDto } from "../types";

interface StaffWeekGridProps {
  days: StaffScheduleDayDto[];
  highlightDate?: Date;
  onBookingClick: (booking: StaffScheduleBooking, date: string) => void;
}

export function StaffWeekGrid({
  days,
  highlightDate,
  onBookingClick,
}: StaffWeekGridProps) {
  const events = days.flatMap((day) =>
    day.bookings.map((booking) => ({
      id: `${day.date}-${booking.id}`,
      date: day.date,
      title: booking.customerName || "—",
      subtitle: booking.serviceName ?? undefined,
      startTime: toLocalTimeOnly(booking.startTime),
      endTime: toLocalTimeOnly(booking.endTime),
      status: booking.status,
    })),
  );

  const bookingByKey = new Map<string, StaffScheduleBooking>();
  days.forEach((day) => {
    day.bookings.forEach((booking) => {
      bookingByKey.set(`${day.date}-${booking.id}`, booking);
    });
  });

  return (
    <AdminScheduleGrid
      days={days.map((d) => ({ date: d.date }))}
      events={events}
      highlightDate={highlightDate}
      onEventClick={(event, date) => {
        const booking = bookingByKey.get(event.id);
        if (booking) onBookingClick(booking, date);
      }}
    />
  );
}
