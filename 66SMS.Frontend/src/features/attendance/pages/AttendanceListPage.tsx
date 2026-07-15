import { useAuthStore } from "@/features/auth/stores/authStore";
import { useWorkSchedules } from "@/features/schedules/hooks/useSchedules";
import type { WorkScheduleDTO } from "@/features/schedules/types/schedule.types";
import { useShifts } from "@/features/shifts/hooks/useShifts";
import type {
  ShiftDTO,
  ShiftPeriodDTO,
} from "@/features/shifts/types/shift.types";
import { DateUtil, formatDate, toLocalTimeOnly } from "@/shared/utils/date.utils";
import { ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAttendances } from "../hooks/useAttendances";
import type { AttendanceDto } from "../types/attendance.types";
import { AttendanceDailyDialog } from "../components/AttendanceDailyDialog";

export function AttendanceListPage() {
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { user, hasRole } = useAuthStore();
  const isAdminOrManager = hasRole("Admin") || hasRole("Manager");
  const currentStaffId = user?.staffInfo?.id;

  // Week selection state
  const [currentDate, setCurrentDate] = useState<DateUtil>(
    formatDate().startOf("isoWeek"),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOnTime, setFilterOnTime] = useState(false);
  const [filterLate, setFilterLate] = useState(false);
  const [filterMissing, setFilterMissing] = useState(false);
  const [filterNoAttendance, setFilterNoAttendance] = useState(false);
  const [filterLeave, setFilterLeave] = useState(false);

  // Dialog state
  const [selectedSchedule, setSelectedSchedule] =
    useState<WorkScheduleDTO | null>(null);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const startDateStr = currentDate.format("YYYY-MM-DD");
  const endDateStr = currentDate.endOf("isoWeek").format("YYYY-MM-DD");

  const handlePrevWeek = () =>
    setCurrentDate((prev) => prev.subtract(1, "week"));
  const handleNextWeek = () => setCurrentDate((prev) => prev.add(1, "week"));
  const handleThisWeek = () => setCurrentDate(formatDate().startOf("isoWeek"));

  // Fetch shifts
  const { data: shiftsResult, isLoading: isLoadingShifts } = useShifts({
    pageIndex: 1,
    pageSize: 100,
  });

  // Fetch work schedules for this week
  const {
    data: schedulesResult,
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
  } = useWorkSchedules({
    startDate: startDateStr,
    endDate: endDateStr,
    pageIndex: 1,
    pageSize: 1000,
    salonId: salonId ?? undefined,
    staffId: isAdminOrManager ? undefined : (currentStaffId ?? -1),
  });

  // Fetch attendances for this week
  const {
    data: attendancesResult,
    isLoading: isLoadingAttendances,
    refetch: refetchAttendances,
  } = useAttendances({
    fromDate: startDateStr,
    toDate: endDateStr,
    pageIndex: 1,
    pageSize: 1000,
    salonId: salonId ?? undefined,
    staffId: isAdminOrManager ? undefined : (currentStaffId ?? -1),
  });

  const handleRefresh = () => {
    refetchSchedules();
    refetchAttendances();
  };

  const days = Array.from({ length: 7 }).map((_, i) =>
    currentDate.add(i, "day"),
  );
  const weekLabel = `Tuần ${currentDate.isoWeek()} (${currentDate.format("DD/MM/YYYY")} - ${currentDate.endOf("isoWeek").format("DD/MM/YYYY")})`;

  // Map attendance theo workScheduleId — mỗi ca một bản ghi riêng (không fallback staffId+ngày)
  const scheduleAttendanceMap = useMemo(() => {
    const map = new Map<number, AttendanceDto>();
    const attendances = attendancesResult?.data?.items ?? [];
    attendances.forEach((att: AttendanceDto) => {
      if (att.workScheduleId) {
        map.set(att.workScheduleId, att);
      }
    });
    return map;
  }, [attendancesResult?.data?.items]);

  // Filtered schedules by staff name and attendance state
  const filteredWorkSchedules = useMemo(() => {
    const workSchedules = schedulesResult?.data?.items ?? [];

    // 1. Filter by search query
    let list = workSchedules;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((ws) => ws.staffName?.toLowerCase().includes(query));
    }

    // Check if any filter is active
    const hasActiveFilter =
      filterOnTime ||
      filterLate ||
      filterMissing ||
      filterNoAttendance ||
      filterLeave;

    if (!hasActiveFilter) {
      return list;
    }

    // 2. Filter by checkboxes
    return list.filter((ws: WorkScheduleDTO) => {
      // Chỉ gắn attendance của đúng ca (workScheduleId)
      const att = ws.id ? scheduleAttendanceMap.get(ws.id) : null;

      // Check status
      if (!att) {
        return filterNoAttendance;
      }

      const statusVal = att.status;

      // Group leaves/absents (status 3, 4, 5, 6)
      if (
        statusVal === 3 ||
        statusVal === 4 ||
        statusVal === 5 ||
        statusVal === 6
      ) {
        return filterLeave;
      }

      if (statusVal === 1 || statusVal === 2) {
        // Chấm công thiếu: status === 1 (Checked-in but no check-out)
        if (statusVal === 1) {
          if (filterMissing) return true;
        }

        const timeToMinutes = (timeStr?: string | null) => {
          if (!timeStr) return 0;
          const parts = timeStr.substring(0, 5).split(":");
          if (parts.length < 2) return 0;
          return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        };
        const isoTimeToMinutes = (isoStr?: string | null) => {
          const hm = toLocalTimeOnly(isoStr);
          if (!hm) return null;
          const [h, m] = hm.split(":").map(Number);
          return h * 60 + m;
        };

        // Find shift period
        let period: ShiftPeriodDTO | undefined;
        const shifts = shiftsResult?.data?.items ?? [];
        for (const shift of shifts) {
          if (shift.shiftPeriodDTOs) {
            period = shift.shiftPeriodDTOs.find(
              (p) => p.id === ws.shiftPeriodId,
            );
            if (period) break;
          }
        }

        if (period) {
          const shiftStartMins = timeToMinutes(period.shiftStart);
          const shiftEndMins = timeToMinutes(period.shiftEnd);
          const actualInMins = isoTimeToMinutes(att.checkInAt);
          const actualOutMins = isoTimeToMinutes(att.checkOutAt);

          const isLate = actualInMins !== null && actualInMins > shiftStartMins;
          const isEarly =
            actualOutMins !== null && actualOutMins < shiftEndMins;

          if (isLate || isEarly) {
            return filterLate;
          }
        }
        return filterOnTime;
      }

      return false;
    });
  }, [
    schedulesResult?.data?.items,
    searchQuery,
    scheduleAttendanceMap,
    shiftsResult?.data?.items,
    filterOnTime,
    filterLate,
    filterMissing,
    filterNoAttendance,
    filterLeave,
  ]);

  // Map shift periods active this week
  const activeShiftPeriods = useMemo(() => {
    const list: { shift: ShiftDTO; period: ShiftPeriodDTO }[] = [];
    const shifts = shiftsResult?.data?.items ?? [];
    shifts.forEach((shift) => {
      if (shift.shiftPeriodDTOs) {
        shift.shiftPeriodDTOs.forEach((period) => {
          const from = period.effectiveFrom;
          const to = period.effectiveTo;
          if (from && from <= endDateStr) {
            if (!to || to >= startDateStr) {
              list.push({ shift, period });
            }
          }
        });
      }
    });
    return list;
  }, [shiftsResult?.data?.items, startDateStr, endDateStr]);

  // Map schedules into cells
  const shiftDayMap = useMemo(() => {
    const map = new Map<string, WorkScheduleDTO[]>();
    filteredWorkSchedules.forEach((ws) => {
      const dateStr = formatDate(ws.workDate).format("YYYY-MM-DD");
      if (ws.shiftPeriodId) {
        const key = `${ws.shiftPeriodId}_${dateStr}`;
        const existing = map.get(key) || [];
        map.set(key, [...existing, ws]);
      }
    });
    return map;
  }, [filteredWorkSchedules]);

  const getDayName = (day: DateUtil) => {
    const names = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    return names[day.day()];
  };

  const handleCardClick = (ws: WorkScheduleDTO) => {
    const att = (ws.id ? scheduleAttendanceMap.get(ws.id) : null) ?? null;
    setSelectedSchedule(ws);
    setSelectedAttendance(att);
    setDialogOpen(true);
  };

  const getAttendanceCardDetails = (
    ws: WorkScheduleDTO,
    period: ShiftPeriodDTO,
  ) => {
    const att = ws.id ? scheduleAttendanceMap.get(ws.id) : null;

    const defaultClass =
      "w-full text-left p-2.5 border rounded-xl transition-all focus:outline-none focus:ring-1 shadow-sm";

    if (!att) {
      // 1. Chưa chấm công -> bg-amber
      return {
        className: `${defaultClass} bg-state-warning-bg border-state-warning-border hover:border-state-warning-solid focus:ring-state-warning-solid`,
        timeText: "--:--",
        statusText: "Chưa chấm công",
        statusColorClass: "text-state-warning-text font-semibold",
      };
    }

    const parseTime = (isoStr: string | null) => {
      return toLocalTimeOnly(isoStr) || "--:--";
    };

    const timeToMinutes = (timeStr?: string | null) => {
      if (!timeStr) return 0;
      const parts = timeStr.substring(0, 5).split(":");
      if (parts.length < 2) return 0;
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };

    const isoTimeToMinutes = (isoStr?: string | null) => {
      const hm = toLocalTimeOnly(isoStr);
      if (!hm) return null;
      const [h, m] = hm.split(":").map(Number);
      return h * 60 + m;
    };

    const statusVal = att.status;

    // Check-in / Out working states
    if (statusVal === 1 || statusVal === 2) {
      const shiftStartMins = timeToMinutes(period.shiftStart);
      const shiftEndMins = timeToMinutes(period.shiftEnd);
      const actualInMins = isoTimeToMinutes(att.checkInAt);
      const actualOutMins = isoTimeToMinutes(att.checkOutAt);

      let isLate = false;
      let isEarly = false;
      let lateText = "";
      let earlyText = "";

      if (actualInMins !== null && actualInMins > shiftStartMins) {
        isLate = true;
        const diff = actualInMins - shiftStartMins;
        lateText = `Đi muộn ${diff}p`;
      }
      if (actualOutMins !== null && actualOutMins < shiftEndMins) {
        isEarly = true;
        const diff = shiftEndMins - actualOutMins;
        earlyText = `Về sớm ${diff}p`;
      }

      const checkInStr = parseTime(att.checkInAt);
      const checkOutStr = statusVal === 2 ? parseTime(att.checkOutAt) : "--:--";
      const timeText = `${checkInStr} - ${checkOutStr}`;

      if (isLate || isEarly) {
        // 2. Đi muộn/về sớm -> bg-danger (rose)
        const statusText = [lateText, earlyText].filter(Boolean).join(" & ");
        return {
          className: `${defaultClass} bg-state-danger-bg border-state-danger-border hover:border-state-danger-solid focus:ring-state-danger-solid`,
          timeText,
          statusText,
          statusColorClass: "text-state-danger-text font-bold",
        };
      } else {
        // 3. Đã chấm công bình thường -> bg-adminGreen-600 (green)
        return {
          className: `${defaultClass} bg-adminGreen-600-light border-adminGreen-600 hover:border-adminGreen-600 focus:ring-adminGreen-600`,
          timeText,
          statusText: statusVal === 2 ? "Đã ra ca" : "Đang làm",
          statusColorClass: "text-adminGreen-600 font-bold",
        };
      }
    }

    // Leave states
    if (statusVal === 4 || statusVal === 5) {
      return {
        className: `${defaultClass} bg-state-info-bg border-state-info-border hover:border-state-info-border focus:ring-state-info-solid`,
        timeText: "--:--",
        statusText: "Nghỉ có phép",
        statusColorClass: "text-state-info-text font-semibold",
      };
    }

    // Unpaid leave/Absent states -> bg-danger
    if (statusVal === 3 || statusVal === 6) {
      return {
        className: `${defaultClass} bg-state-danger-bg border-state-danger-border hover:border-state-danger-solid focus:ring-state-danger-solid`,
        timeText: "--:--",
        statusText: "Nghỉ không phép",
        statusColorClass: "text-state-danger-text font-bold",
      };
    }

    return {
      className: `${defaultClass} bg-white border-adminGray-100 hover:border-adminGray-400`,
      timeText: "--:--",
      statusText: "",
      statusColorClass: "text-adminGray-600",
    };
  };

  const isPageLoading =
    isLoadingShifts || isLoadingSchedules || isLoadingAttendances;

  return (
    <div className="space-y-2">
      {/* Search & Navigation header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-2 rounded border border-adminGray-100/30 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {isAdminOrManager && (
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-adminGray-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nhân viên..."
                className="pl-9 pr-4 py-2 bg-white border border-adminGray-100/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-adminGreen-600 w-full transition-all placeholder:text-adminGray-400"
              />
            </div>
          )}

          {/* Simple Checkbox filters */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-adminGray-600">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterOnTime}
                onChange={(e) => setFilterOnTime(e.target.checked)}
                className="rounded-full border-adminGreen-600/40 text-adminGreen-600 focus:ring-adminGreen-600 w-3.5 h-3.5"
              />
              <span className="text-adminGray-600 hover:text-adminInk">Đúng giờ</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterLate}
                onChange={(e) => setFilterLate(e.target.checked)}
                className="rounded-full border-rose-300 text-state-danger-text focus:ring-rose-450 w-3.5 h-3.5"
              />
              <span className="text-adminGray-600 hover:text-adminInk">Đi muộn / Về sớm</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterMissing}
                onChange={(e) => setFilterMissing(e.target.checked)}
                className="rounded-full border-state-danger-border text-state-danger-text focus:ring-state-danger-solid w-3.5 h-3.5"
              />
              <span className="text-adminGray-600 hover:text-adminInk">Chấm công thiếu</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterNoAttendance}
                onChange={(e) => setFilterNoAttendance(e.target.checked)}
                className="rounded-full border-state-warning-border text-adminGold-600 focus:ring-state-warning-solid w-3.5 h-3.5"
              />
              <span className="text-adminGray-600 hover:text-adminInk">Chưa chấm công</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterLeave}
                onChange={(e) => setFilterLeave(e.target.checked)}
                className="rounded-full border-state-info-border text-state-info-text focus:ring-state-info-solid w-3.5 h-3.5"
              />
              <span className="text-adminGray-600 hover:text-adminInk">Nghỉ làm</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
          <div className=""></div>
          <div className="flex items-center bg-white border border-adminGray-100/50 rounded-xl overflow-hidden shadow-sm h-9">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="px-3 h-full hover:bg-adminGray-50 flex items-center justify-center text-adminGray-400 hover:text-adminGray-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 text-sm font-bold text-adminInk select-none min-w-[200px] text-center border-x border-adminGray-100">
              {weekLabel}
            </div>
            <button
              type="button"
              onClick={handleNextWeek}
              className="px-3 h-full hover:bg-adminGray-50 flex items-center justify-center text-adminGray-400 hover:text-adminGray-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleThisWeek}
            className="text-sm font-bold text-adminGray-600 hover:text-adminInk border border-adminGray-100/60 hover:bg-adminGray-50 px-4 h-9 rounded-xl transition-all shadow-sm"
          >
            Tuần này
          </button>
        </div>
      </div>

      {/* Board Layout */}
      {isPageLoading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded border border-adminGray-100/30 shadow-sm min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-adminGray-100 border-t-lotus-leaf" />
            <p className="text-sm font-semibold text-adminGray-600">
              Đang tải bảng chấm công tuần...
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-adminGray-100/50 bg-white rounded shadow-sm">
          <table className="w-full text-sm text-left table-fixed min-w-[1000px]">
            <thead className="bg-adminGray-50 border-b border-adminGray-100/60">
              <tr>
                <th className="w-48 py-4 px-4 font-bold text-adminInk border-r border-adminGray-100/50 text-xs uppercase tracking-wider">
                  Ca làm việc
                </th>
                {days.map((day, i) => (
                  <th
                    key={i}
                    className="py-3 px-2 font-bold text-center border-r border-adminGray-100/50 last:border-0"
                  >
                    <div
                      className={`flex flex-col items-center justify-center gap-0.5 ${
                        day.day() === 0 || day.day() === 6
                          ? "text-state-danger-text"
                          : "text-adminInk"
                      }`}
                    >
                      <span className="text-xs font-medium opacity-80 uppercase">
                        {getDayName(day)}
                      </span>
                      <span className="text-sm font-extrabold">
                        {day.format("DD/MM")}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-adminGray-100/40">
              {activeShiftPeriods.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-adminGray-400 font-semibold text-sm"
                  >
                    Không có ca làm việc nào hoạt động trong tuần này.
                  </td>
                </tr>
              ) : (
                activeShiftPeriods.map(({ shift, period }, index) => (
                  <tr key={`${shift.id}_${period.id}_${index}`}>
                    {/* Shift details column */}
                    <td className="py-4 px-4 border-r border-adminGray-100/50 align-top bg-adminGray-50/20">
                      <div className="font-extrabold text-adminInk">
                        {shift.name}
                      </div>
                      <div className="text-xs text-adminGray-600 mt-1.5 flex items-center gap-1.5">
                        <Clock size={12} className="text-adminGray-400" />
                        <span className="px-1.5 py-0.5 bg-adminGray-100 rounded font-bold text-adminInk">
                          {period.shiftStart?.substring(0, 5)}
                        </span>
                        <span>-</span>
                        <span className="px-1.5 py-0.5 bg-adminGray-100 rounded font-bold text-adminInk">
                          {period.shiftEnd?.substring(0, 5)}
                        </span>
                      </div>
                    </td>

                    {/* Weekdays columns */}
                    {days.map((day, i) => {
                      const dateStr = day.format("YYYY-MM-DD");
                      const isPeriodActiveThisDay =
                        period.effectiveFrom &&
                        period.effectiveFrom <= dateStr &&
                        (!period.effectiveTo || period.effectiveTo >= dateStr);

                      if (!isPeriodActiveThisDay) {
                        return (
                          <td
                            key={i}
                            className="py-3 px-2 border-r border-adminGray-100/50 last:border-0 align-top bg-adminGray-50/40"
                          >
                            <div className="flex h-full items-center justify-center text-xs text-adminGray-400 italic">
                              Không áp dụng
                            </div>
                          </td>
                        );
                      }

                      const key = `${period.id}_${dateStr}`;
                      const cellSchedules = shiftDayMap.get(key) || [];

                      return (
                        <td
                          key={i}
                          className="py-3 px-2 border-r border-adminGray-100/50 last:border-0 align-top relative hover:bg-adminGray-50/30 transition-all"
                        >
                          <div className="flex flex-col gap-2 p-0.5 min-h-[110px]">
                            {cellSchedules.length === 0 ? (
                              <div className="text-xs text-adminGray-300 text-center py-10 italic">
                                Không có lịch
                              </div>
                            ) : (
                              cellSchedules.map((ws) => {
                                const card = getAttendanceCardDetails(
                                  ws,
                                  period,
                                );
                                return (
                                  <button
                                    type="button"
                                    key={ws.id}
                                    onClick={() => handleCardClick(ws)}
                                    className={card.className}
                                  >
                                    <div className="font-bold text-adminInk text-xs truncate">
                                      {ws.staffName}
                                    </div>
                                    <div className="text-xs font-mono text-adminGray-600 font-semibold mt-1">
                                      {card.timeText}
                                    </div>
                                    <div
                                      className={`text-2xs mt-1 ${card.statusColorClass}`}
                                    >
                                      {card.statusText}
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedSchedule && dialogOpen && (
        <AttendanceDailyDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          schedule={selectedSchedule}
          attendance={selectedAttendance}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
