import { useState, useMemo } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { StaffScheduleToolbar } from "../components/StaffScheduleToolbar";
import { StaffDayGrid } from "../components/StaffDayGrid";
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
import { formatDisplayDate, formatDate } from "@/shared/utils/date.utils";

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
      ? schedule.data.bookings
      : [];

  const handleBookingClick = (booking: StaffScheduleBooking, date?: string) => {
    const dateLabel = date
      ? formatDisplayDate(date)
      : formatDate(anchorDate).format("DD/MM/YYYY");
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
              ? { ...prev, booking: { ...prev.booking, status: BookingStatus.InService } }
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
              ? { ...prev, booking: { ...prev.booking, status: BookingStatus.Completed } }
              : prev,
          );
        },
      },
    );
  };

  if (!canView) {
    return (
      <div className="p-8 text-center text-adminGray-600">
        Bạn không có quyền xem lịch hẹn.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StaffScheduleToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        anchorDate={anchorDate}
        onAnchorDateChange={setAnchorDate}
        weekLabel={weekLabel}
      />

      <div className="flex-1 flex flex-col min-h-[500px] bg-white/70 backdrop-blur-md rounded-admin border border-adminGray-100/30 overflow-hidden">
        {isLoadingStaff || schedule.isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20 min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-adminGray-100 border-t-primary" />
              <p className="text-sm text-adminGray-600 font-medium">
                Đang tải lịch hẹn...
              </p>
            </div>
          </div>
        ) : schedule.isError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[400px] text-center gap-3 bg-white">
            <p className="text-state-danger-text font-semibold text-sm">
              {schedule.error}
            </p>
            <button
              type="button"
              onClick={() => schedule.refetch()}
              className="px-4 py-1.5 rounded-lg border border-adminGray-100 text-xs text-primary font-bold hover:bg-adminGray-50 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : viewMode === "day" ? (
          <div className="flex-1 min-h-[400px] flex flex-col overflow-hidden p-2">
            <StaffDayGrid
              date={anchorDate}
              bookings={dayBookings}
              staffName={staffName}
              onBookingClick={handleBookingClick}
            />
          </div>
        ) : schedule.data && "days" in schedule.data ? (
          <div className="flex-1 min-h-[400px] flex flex-col overflow-hidden p-2">
            <StaffWeekGrid
              days={schedule.data.days}
              highlightDate={anchorDate}
              onBookingClick={handleBookingClick}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-adminGray-600 font-medium min-h-[400px] bg-white">
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
