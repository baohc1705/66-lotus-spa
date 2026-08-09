import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarHeart, RefreshCw, UserRound } from "lucide-react";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { Button } from "@/shared/elements/Button";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";

import { PayrollStatCards } from "../components/PayrollStatCards";
import { PayrollStatsToolbar } from "../components/PayrollStatsToolbar";
import { PayrollStatsDayGrid } from "../components/PayrollStatsDayGrid";
import { PayrollStatsWeekGrid } from "../components/PayrollStatsWeekGrid";
import { PayrollStatsMonthTable } from "../components/PayrollStatsMonthTable";
import { PayrollCommissionDetailDialog } from "../components/PayrollCommissionDetailDialog";
import {
  usePayrollCommissionStats,
  usePayrollCommissionDailyStats,
} from "../hooks/usePayrolls";
import type {
  PayrollCommissionAppointmentDto,
  PayrollStatsViewMode,
} from "../types/payroll.types";
import {
  getIsoWeekStart,
  getRangeForView,
  toDateKey,
} from "../utils/payrollStats.utils";

export function PayrollStatsPage() {
  "use no memo";
  const hasRole = useAuthStore((s) => s.hasRole);
  const user = useAuthStore((s) => s.user);
  const isAdmin = hasRole("Admin");
  const myStaffId = user?.staffInfo?.id ?? null;

  const [searchParams, setSearchParams] = useSearchParams();
  const queryStaffId = Number(searchParams.get("staffId") || 0) || null;

  const [viewMode, setViewMode] = useState<PayrollStatsViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selected, setSelected] =
    useState<PayrollCommissionAppointmentDto | null>(null);

  const [adminStaffId, setAdminStaffId] = useState<number | null>(
    isAdmin ? queryStaffId : null,
  );

  const staffsQuery = useAdminStaffs({ pageIndex: 1, pageSize: 200 }, isAdmin);
  const staffOptions = staffsQuery.data?.data?.items ?? [];

  const effectiveStaffId = isAdmin ? adminStaffId : myStaffId;

  const range = useMemo(
    () => getRangeForView(viewMode, anchorDate),
    [viewMode, anchorDate],
  );

  const statsParams =
    effectiveStaffId && effectiveStaffId > 0
      ? {
          staffId: isAdmin ? effectiveStaffId : undefined,
          fromDate: range.fromDate,
          toDate: range.toDate,
        }
      : null;

  const statsQuery = usePayrollCommissionStats(
    statsParams,
    !!effectiveStaffId && viewMode !== "month",
  );

  const dailyQuery = usePayrollCommissionDailyStats(
    statsParams,
    !!effectiveStaffId && viewMode === "month",
  );

  const appointments = statsQuery.data?.data?.appointments ?? [];
  const dailyStats = dailyQuery.data?.data?.items ?? [];
  const summary =
    viewMode === "month"
      ? dailyQuery.data?.data?.summary
      : statsQuery.data?.data?.summary;
  const staffName =
    (viewMode === "month"
      ? dailyQuery.data?.data?.staffName
      : statsQuery.data?.data?.staffName) ??
    user?.fullName ??
    "Nhân viên";
  const isLoading =
    viewMode === "month" ? dailyQuery.isLoading : statsQuery.isLoading;
  const isFetching =
    viewMode === "month" ? dailyQuery.isFetching : statsQuery.isFetching;
  const isError =
    viewMode === "month" ? dailyQuery.isError : statsQuery.isError;

  function refetch() {
    if (viewMode === "month") {
      dailyQuery.refetch();
      return;
    }
    statsQuery.refetch();
  }

  const weekDays = useMemo(() => {
    const start = getIsoWeekStart(anchorDate);
    return Array.from({ length: 7 }, (_: unknown, dayIndex: number) => {
      const day = new Date(start);
      day.setDate(day.getDate() + dayIndex);
      const key = toDateKey(day);
      return {
        date: key,
        appointments: appointments.filter(
          (appointment: PayrollCommissionAppointmentDto) =>
            (appointment.issuedLocalDate ?? appointment.appointmentDate) ===
            key,
        ),
      };
    });
  }, [anchorDate, appointments]);

  const periodLabel = useMemo(() => {
    if (viewMode === "day") {
      const weekday = anchorDate.toLocaleDateString("vi-VN", { weekday: "long" });
      const datePart = anchorDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${weekday}, ${datePart}`;
    }
    if (viewMode === "week") {
      const start = getIsoWeekStart(anchorDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const startText = start.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      const endText = end.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${startText} – ${endText}`;
    }
    return `Tháng ${anchorDate.getMonth() + 1}, ${anchorDate.getFullYear()}`;
  }, [viewMode, anchorDate]);

  const staffSelectOptions = useMemo(
    () =>
      (staffOptions as StaffDto[])
        .filter((staff: StaffDto) => staff.id != null)
        .map((staff: StaffDto) => ({
          value: String(staff.id),
          label: staff.fullName ?? `Nhân viên #${staff.id}`,
        })),
    [staffOptions],
  );

  function handleAdminStaffChange(value: string) {
    const id = value ? Number(value) || null : null;
    setAdminStaffId(id);
    if (id) setSearchParams({ staffId: String(id) });
    else setSearchParams({});
  }

  if (!isAdmin && !myStaffId) {
    return (
      <div className="flex h-full items-center justify-center font-sans text-sm text-kit-body">
        <TableEmptyState
          icon={UserRound}
          title="Chưa gắn hồ sơ nhân viên"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-hidden font-sans text-sm text-kit-body">
      <div className="shrink-0">
        <PayrollStatCards
          summary={effectiveStaffId ? summary : undefined}
          viewMode={viewMode}
          isLoading={!!effectiveStaffId && isLoading}
        />
      </div>

      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <PayrollStatsToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          anchorDate={anchorDate}
          onAnchorDateChange={setAnchorDate}
          periodLabel={periodLabel}
          staffEditable={isAdmin}
          staffOptions={staffSelectOptions}
          staffValue={adminStaffId ? String(adminStaffId) : ""}
          staffName={staffName}
          onStaffChange={handleAdminStaffChange}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {!effectiveStaffId ? (
            <div className="py-10">
              <TableEmptyState
                icon={UserRound}
                title="Chưa chọn nhân viên"
              />
            </div>
          ) : isLoading ? (
            <div className="flex flex-1 items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-kit-track border-t-kit-primary" />
            </div>
          ) : isError ? (
            <div className="py-10">
              <TableEmptyState
                icon={RefreshCw}
                title="Không tải được thống kê"
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    className="mb-0 mt-1"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Thử lại
                  </Button>
                }
              />
            </div>
          ) : viewMode === "month" && dailyStats.length === 0 ? (
            <div className="py-10">
              <TableEmptyState
                icon={CalendarHeart}
                title="Chưa có lịch hẹn đã thanh toán"
              />
            </div>
          ) : viewMode !== "month" && appointments.length === 0 ? (
            <div className="py-10">
              <TableEmptyState
                icon={CalendarHeart}
                title="Chưa có lịch hẹn đã thanh toán"
              />
            </div>
          ) : viewMode === "day" ? (
            <div className="min-h-0 flex-1 overflow-hidden p-2">
              <PayrollStatsDayGrid
                date={anchorDate}
                appointments={appointments}
                staffName={staffName}
                onAppointmentClick={setSelected}
                onDateChange={setAnchorDate}
              />
            </div>
          ) : viewMode === "week" ? (
            <div className="min-h-0 flex-1 overflow-hidden p-2">
              <PayrollStatsWeekGrid
                days={weekDays}
                highlightDate={anchorDate}
                onAppointmentClick={setSelected}
                onDateChange={setAnchorDate}
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto p-2">
              <PayrollStatsMonthTable
                dailyStats={dailyStats}
                summary={dailyQuery.data?.data?.summary}
                onDayClick={(workDate: string) => {
                  setAnchorDate(new Date(`${workDate}T12:00:00`));
                  setViewMode("day");
                }}
              />
            </div>
          )}
        </div>
      </TablePageShell>

      <PayrollCommissionDetailDialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        appointment={selected}
      />
    </div>
  );
}
