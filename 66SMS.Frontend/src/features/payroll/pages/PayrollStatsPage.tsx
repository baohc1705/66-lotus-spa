import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { CalendarHeart, RefreshCw, UserRound } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { containerVariants } from "@/shared/motion/pageVariants";
import { usePayrollCommissionStats } from "../hooks/usePayrolls";
import { PayrollStatCards } from "../components/PayrollStatCards";
import { PayrollStatsToolbar } from "../components/PayrollStatsToolbar";
import { PayrollStatsDayGrid } from "../components/PayrollStatsDayGrid";
import { PayrollStatsWeekGrid } from "../components/PayrollStatsWeekGrid";
import { PayrollStatsMonthTable } from "../components/PayrollStatsMonthTable";
import { PayrollCommissionDetailDialog } from "../components/PayrollCommissionDetailDialog";
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
          from: range.from,
          to: range.to,
        }
      : null;

  const statsQuery = usePayrollCommissionStats(
    statsParams,
    !!effectiveStaffId,
  );

  const appointments = statsQuery.data?.data?.appointments ?? [];
  const summary = statsQuery.data?.data?.summary;
  const staffName =
    statsQuery.data?.data?.staffName ?? user?.fullName ?? "Nhân viên";
  const isLoading = statsQuery.isLoading;
  const isFetching = statsQuery.isFetching;

  const weekDays = useMemo(() => {
    const start = getIsoWeekStart(anchorDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = toDateKey(d);
      return {
        date: key,
        appointments: appointments.filter(
          (a: PayrollCommissionAppointmentDto) =>
            (a.issuedLocalDate ?? a.appointmentDate) === key,
        ),
      };
    });
  }, [anchorDate, appointments]);

  const periodLabel = useMemo(() => {
    if (viewMode === "day") {
      return anchorDate.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (viewMode === "week") {
      const start = getIsoWeekStart(anchorDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("vi-VN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return anchorDate.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
  }, [viewMode, anchorDate]);

  const handleAdminStaffChange = (value: string) => {
    const id = value === "none" ? null : Number(value) || null;
    setAdminStaffId(id);
    if (id) setSearchParams({ staffId: String(id) });
    else setSearchParams({});
  };

  if (!isAdmin && !myStaffId) {
    return (
      <div className="flex h-full items-center justify-center">
        <TableEmptyState
          icon={UserRound}
          title="Chưa gắn hồ sơ nhân viên"
          hint="Tài khoản chưa liên kết staff nên không xem được thống kê lương."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden w-full">
      <div className="shrink-0">
        <PayrollStatCards
          summary={effectiveStaffId ? summary : undefined}
          isLoading={!!effectiveStaffId && isLoading}
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="lotus-admin-table-page-card flex-1 min-h-0 flex flex-col overflow-hidden relative"
      >
        {isFetching && !isLoading && (
          <div className="lotus-admin-table-fetch-bar">
            <div className="lotus-admin-table-fetch-bar-inner" />
          </div>
        )}

        <PayrollStatsToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          anchorDate={anchorDate}
          onAnchorDateChange={setAnchorDate}
          periodLabel={periodLabel}
          staffPicker={
            isAdmin ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-adminInk/80">
                  Nhân viên
                </label>
                <Select
                  value={adminStaffId ? String(adminStaffId) : "none"}
                  onValueChange={handleAdminStaffChange}
                >
                  <AdminSelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Chọn nhân viên" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chọn nhân viên</SelectItem>
                    {(staffOptions as StaffDto[])
                      .filter((s: StaffDto) => s.id != null)
                      .map((s: StaffDto) => (
                        <SelectItem key={s.id!} value={String(s.id)}>
                          {s.fullName ?? `NV #${s.id}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-adminInk/80">
                  Nhân viên
                </label>
                <div className="h-9 px-3 flex items-center border border-adminGray-100 bg-adminGray-50 text-sm font-medium text-adminInk min-w-[160px]">
                  {staffName}
                </div>
              </div>
            )
          }
        />

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {!effectiveStaffId ? (
            <TableEmptyState
              icon={UserRound}
              title="Chưa chọn nhân viên"
              hint="Chọn nhân viên để xem thống kê lương và hoa hồng."
            />
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-adminGray-100 border-t-primary" />
            </div>
          ) : statsQuery.isError ? (
            <TableEmptyState
              icon={RefreshCw}
              title="Không tải được thống kê"
              hint="Thử tải lại hoặc kiểm tra kết nối API."
              action={
                <Button
                  variant="admin"
                  size="sm"
                  className="lotus-admin-table-toolbar-btn mt-1"
                  onClick={() => statsQuery.refetch()}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Thử lại
                </Button>
              }
            />
          ) : appointments.length === 0 && viewMode !== "month" ? (
            <TableEmptyState
              icon={CalendarHeart}
              title="Chưa có lịch hẹn đã thanh toán"
              hint="Kỳ này chưa có hóa đơn paid gắn hoa hồng cho nhân viên."
            />
            ) : viewMode === "day" ? (
            <div className="flex-1 min-h-0 overflow-hidden p-2">
              <PayrollStatsDayGrid
                date={anchorDate}
                appointments={appointments}
                staffName={staffName}
                onAppointmentClick={setSelected}
              />
            </div>
          ) : viewMode === "week" ? (
            <div className="flex-1 min-h-0 overflow-hidden p-2">
              <PayrollStatsWeekGrid
                days={weekDays}
                highlightDate={anchorDate}
                onAppointmentClick={setSelected}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto">
              <PayrollStatsMonthTable
                appointments={appointments}
                summary={summary}
                onAppointmentClick={setSelected}
              />
            </div>
          )}
        </div>
      </motion.div>

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
