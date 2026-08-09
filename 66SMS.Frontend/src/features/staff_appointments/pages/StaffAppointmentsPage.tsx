import { useMemo, useState } from "react";

import {
  Calendar,
  type CalendarEvent,
  type ViewType,
} from "@/shared/components/Calendar";
import { Button } from "@/shared/elements/Button";
import { formatDisplayDate, formatDate } from "@/shared/utils/date.utils";
import { useAuthStore } from "@/features/auth/stores/authStore";

import { BookingDetailPanel } from "../components/BookingDetailPanel";
import { useStaffAppointmentCalendar } from "../hooks/useStaffAppointmentCalendar";
import { useUpdateMyBookingStatus } from "../hooks/useUpdateMyBookingStatus";
import { BookingStatus, type StaffScheduleBooking } from "../types";
import {
  combineDateAndTime,
  STATUS_CALENDAR_ITEMS,
  STATUS_EVENT_COLORS,
} from "../utils/staffAppointmentCalendar.utils";

type StatusCalendarItem = {
  id: string;
  label: string;
  color?: string;
  active?: boolean;
};

export function StaffAppointmentsPage() {
  const hasRole = useAuthStore((state) => state.hasRole);
  const isAdmin = hasRole("Admin");
  const isEmployee = hasRole("Staff");
  const isReceptionist = hasRole("Receptionist");
  const canView = isAdmin || isEmployee || isReceptionist;

  const [view, setView] = useState<ViewType>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [statusCalendars, setStatusCalendars] = useState<StatusCalendarItem[]>(
    STATUS_CALENDAR_ITEMS,
  );
  const [selectedBooking, setSelectedBooking] = useState<{
    booking: StaffScheduleBooking;
    dateLabel?: string;
  } | null>(null);

  const schedule = useStaffAppointmentCalendar(view, anchorDate, canView);
  const updateStatus = useUpdateMyBookingStatus();

  const bookingById = useMemo(() => {
    const map = new Map<
      string,
      { booking: StaffScheduleBooking; dateKey: string }
    >();
    for (const item of schedule.items) {
      map.set(item.booking.id, {
        booking: item.booking,
        dateKey: item.dateKey,
      });
    }
    return map;
  }, [schedule.items]);

  const events = useMemo(() => {
    const list: CalendarEvent[] = [];

    for (const item of schedule.items) {
      const start = combineDateAndTime(item.dateKey, item.booking.startTime);
      const end = combineDateAndTime(item.dateKey, item.booking.endTime);
      const customerName = item.booking.customerName || "Khách";
      const serviceName = item.booking.serviceName || "Dịch vụ";

      list.push({
        id: item.booking.id,
        title: serviceName,
        start,
        end,
        color:
          STATUS_EVENT_COLORS[item.booking.status] ??
          STATUS_EVENT_COLORS[BookingStatus.Pending],
        calendarId: String(item.booking.status),
        description: customerName,
      });
    }

    return list;
  }, [schedule.items]);

  function handleCalendarToggle(calendarId: string, active: boolean) {
    setStatusCalendars((prev) =>
      prev.map((item: StatusCalendarItem) =>
        item.id === calendarId ? { ...item, active } : item,
      ),
    );
  }

  function handleEventClick(event: CalendarEvent) {
    const found = bookingById.get(event.id);
    if (!found) return;
    setSelectedBooking({
      booking: found.booking,
      dateLabel: formatDisplayDate(found.dateKey),
    });
  }

  function handleStartService(bookingId: string) {
    updateStatus.mutate(
      { id: bookingId, status: BookingStatus.InService },
      {
        onSuccess: () => {
          schedule.refetch();
          setSelectedBooking((prev) =>
            prev && prev.booking.id === bookingId
              ? {
                  ...prev,
                  booking: {
                    ...prev.booking,
                    status: BookingStatus.InService,
                    timeStartService: formatDate().toISOString(),
                  },
                }
              : prev,
          );
        },
      },
    );
  }

  function handleCompleteService(bookingId: string) {
    updateStatus.mutate(
      { id: bookingId, status: BookingStatus.Completed },
      {
        onSuccess: () => {
          schedule.refetch();
          setSelectedBooking((prev) =>
            prev && prev.booking.id === bookingId
              ? {
                  ...prev,
                  booking: {
                    ...prev.booking,
                    status: BookingStatus.Completed,
                    completedAt: formatDate().toISOString(),
                  },
                }
              : prev,
          );
        },
      },
    );
  }

  if (!canView) {
    return (
      <div className="p-8 text-center text-kit-muted">
        Bạn không có quyền xem lịch hẹn.
      </div>
    );
  }

  return (
    <div className="font-sans text-sm text-kit-body">
      {schedule.isError ? (
        <div className="flex h-[calc(100dvh-3.75rem-1.5rem)] flex-col items-center justify-center gap-3 rounded-md border border-kit bg-kit-white p-8 text-center md:h-[calc(100dvh-3.75rem-2rem)]">
          <p className="text-sm font-semibold text-kit-danger">
            {schedule.error}
          </p>
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            className="mb-0"
            onClick={() => schedule.refetch()}
          >
            Thử lại
          </Button>
        </div>
      ) : (
        <div className="h-[calc(100dvh-3.75rem-1.5rem)] overflow-hidden rounded-md border border-kit bg-kit-white md:h-[calc(100dvh-3.75rem-2rem)]">
          <Calendar
            className="h-full min-h-0"
            events={events}
            view={view}
            date={anchorDate}
            onViewChange={setView}
            onDateChange={setAnchorDate}
            onEventClick={handleEventClick}
            readOnly
            isLoading={schedule.isLoading}
            calendars={statusCalendars}
            onCalendarToggle={handleCalendarToggle}
            translations={{ calendars: "Trạng thái" }}
          />
        </div>
      )}

      <BookingDetailPanel
        booking={selectedBooking?.booking ?? null}
        dateLabel={selectedBooking?.dateLabel}
        onClose={() => setSelectedBooking(null)}
        onStartService={handleStartService}
        onCompleteService={handleCompleteService}
        isUpdating={updateStatus.isPending}
      />
    </div>
  );
}
