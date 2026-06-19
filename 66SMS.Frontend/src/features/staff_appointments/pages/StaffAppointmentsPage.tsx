import { useState, useMemo } from "react";
import { Loader2, CalendarDays } from "lucide-react";
import { CashierGrid } from "@/features/cashier/components/CashierGrid";
import type { CashierBooking } from "@/features/cashier/types";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { StaffScheduleToolbar } from "../components/StaffScheduleToolbar";
import { StaffWeekGrid } from "../components/StaffWeekGrid";
import { BookingDetailPanel } from "../components/BookingDetailPanel";
import { getIsoWeekStart } from "../api";
import { useStaffSchedule } from "../hooks/useStaffSchedule";
import { useUpdateMyBookingStatus } from "../hooks/useUpdateMyBookingStatus";
import {
  BookingStatus,
  type ScheduleViewMode,
  type StaffScheduleBooking,
} from "../types";

const STAFF_COLUMN_ID = "me";

function toCashierBooking(
  booking: StaffScheduleBooking,
  staffName: string,
): CashierBooking {
  return {
    id: booking.id,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    serviceName: booking.serviceName,
    staffId: STAFF_COLUMN_ID,
    staffName,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status as CashierBooking["status"],
    totalAmount: booking.totalAmount,
    paidAmount: 0,
    depositAmount: 0,
    remainingAmount: booking.totalAmount,
    depositPaid: false,
  };
}

function formatWeekLabel(weekStart: Date, weekEnd: string) {
  const end = new Date(weekEnd + "T12:00:00");
  const startLabel = weekStart.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  });
  const endLabel = end.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function StaffAppointmentsPage() {
  const user = useAuthStore((state) => state.user);
  const hasRole = useAuthStore((state) => state.hasRole);
  const isAdmin = hasRole("Admin");
  const isEmployee = hasRole("Staff");
  const isReceptionist = hasRole("Receptionist");
  const canView = isAdmin || isEmployee || isReceptionist;

  const [viewMode, setViewMode] = useState<ScheduleViewMode>("day");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedBooking, setSelectedBooking] = useState<{
    booking: StaffScheduleBooking;
    dateLabel?: string;
  } | null>(null);

  const staff = user ? { id: user.id, fullName: user.fullName } : null;
  const isLoadingStaff = false;
  const schedule = useStaffSchedule(viewMode, anchorDate, canView && !!staff);
  const updateStatus = useUpdateMyBookingStatus();

  const weekStart = useMemo(() => getIsoWeekStart(anchorDate), [anchorDate]);
  const weekLabel =
    viewMode === "week" && schedule.data && "weekEnd" in schedule.data
      ? formatWeekLabel(weekStart, schedule.data.weekEnd)
      : undefined;

  const staffName = staff?.fullName ?? "Lịch của tôi";

  const dayBookings =
    viewMode === "day" && schedule.data && "bookings" in schedule.data
      ? schedule.data.bookings.map((b) => toCashierBooking(b, staffName))
      : [];

  const handleBookingClick = (booking: StaffScheduleBooking, date?: string) => {
    const dateLabel = date
      ? new Date(date + "T12:00:00").toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : anchorDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
    setSelectedBooking({ booking, dateLabel });
  };

  const handleStartService = (bookingId: string) => {
    updateStatus.mutate(
      { id: bookingId, status: BookingStatus.InService },
      {
        onSuccess: () => {
          schedule.refetch();
          setSelectedBooking((prev) =>
            prev && prev.booking.id === bookingId
              ? { ...prev, booking: { ...prev.booking, status: "in-progress" } }
              : prev,
          );
        },
      },
    );
  };

  const handleCompleteService = (bookingId: string) => {
    updateStatus.mutate(
      { id: bookingId, status: BookingStatus.Completed },
      {
        onSuccess: () => {
          schedule.refetch();
          setSelectedBooking((prev) =>
            prev && prev.booking.id === bookingId
              ? { ...prev, booking: { ...prev.booking, status: "completed" } }
              : prev,
          );
        },
      },
    );
  };

  if (!canView) {
    return (
      <div className="p-8 text-center text-gray-500">
        Bạn không có quyền xem lịch hẹn.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] min-h-[500px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1A56DB]/10 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-[#1A56DB]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#2B3674]">Lịch hẹn của tôi</h1>
          <p className="text-sm text-gray-500">
            Xem lịch hẹn khách theo ngày hoặc tuần — nhấn &quot;Hôm nay&quot; để
            về ngày hiện tại
          </p>
        </div>
      </div>

      <StaffScheduleToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        anchorDate={anchorDate}
        onAnchorDateChange={setAnchorDate}
        weekLabel={weekLabel}
      />

      <div className="flex-1 flex flex-col min-h-0 bg-[#F4F7FE] rounded-xl overflow-hidden">
        {isLoadingStaff || schedule.isLoading ? (
          <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-[var(--color-border)]">
            <Loader2 className="w-8 h-8 text-[#1A56DB] animate-spin" />
          </div>
        ) : schedule.isError ? (
          <div className="flex-1 flex items-center justify-center bg-white rounded-xl border text-red-500 text-sm gap-2">
            <span>{schedule.error}</span>
            <button
              type="button"
              onClick={() => schedule.refetch()}
              className="underline text-[#1A56DB]"
            >
              Thử lại
            </button>
          </div>
        ) : viewMode === "day" ? (
          <div className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)]">
            <CashierGrid
              date={anchorDate}
              columns={[{ id: STAFF_COLUMN_ID, name: staffName }]}
              bookings={dayBookings}
              onBookingClick={(b) => {
                const raw =
                  schedule.data && "bookings" in schedule.data
                    ? schedule.data.bookings.find((x) => x.id === b.id)
                    : null;
                if (raw) handleBookingClick(raw);
              }}
            />
          </div>
        ) : schedule.data && "days" in schedule.data ? (
          <StaffWeekGrid
            days={schedule.data.days}
            highlightDate={anchorDate}
            onBookingClick={handleBookingClick}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-white rounded-xl border">
            Không có dữ liệu lịch tuần
          </div>
        )}
      </div>

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
