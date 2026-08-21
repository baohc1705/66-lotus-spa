import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { useWorkSchedules } from "@/features/schedules/hooks/useSchedules";
import type { WorkScheduleDTO } from "@/features/schedules/types/schedule.types";
import { useShifts } from "@/features/shifts/hooks/useShifts";
import type { ShiftDTO } from "@/features/shifts/types/shift.types";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody } from "@/shared/elements/Card";
import { Checkbox } from "@/shared/forms/Checkbox";
import { Input } from "@/shared/forms/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import {
  DateUtil,
  formatDate,
  toLocalTimeOnly,
} from "@/shared/utils/date.utils";

import { useAttendances } from "../hooks/useAttendances";
import type { AttendanceDto } from "../types/attendance.types";

type CardStyle = {
  className: string;
  timeText: string;
  statusText: string;
  statusClass: string;
};

interface Props {
  onSelectSchedule: (
    schedule: WorkScheduleDTO,
    attendance: AttendanceDto | null,
  ) => void;
}

const DAY_NAMES = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

// Function này dùng để lấy style cho card của chấm công
function getCardStyle(attendance: AttendanceDto | null): CardStyle {
  if (!attendance) {
    return {
      className:
        "w-full rounded border px-2.5 py-2 text-left text-xs transition-colors hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-kit-primary/30 soft-kit-warning border",
      timeText: "--:--",
      statusText: "Chưa chấm công",
      statusClass: "font-semibold",
    };
  }

  if (attendance.status === 1 || attendance.status === 2) {
    const checkInText = toLocalTimeOnly(attendance.checkInAt) || "--:--";
    const checkOutText =
      attendance.checkOutAt != null
        ? toLocalTimeOnly(attendance.checkOutAt) || "--:--"
        : "--:--";

    return {
      className:
        "w-full rounded border px-2.5 py-2 text-left text-xs transition-colors hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-kit-primary/30 soft-kit-success border",
      timeText: checkInText + " - " + checkOutText,
      statusText: attendance.checkOutAt != null ? "Đã ra ca" : "Đang làm",
      statusClass: "font-semibold",
    };
  }

  if (attendance.status === 4 || attendance.status === 5) {
    return {
      className:
        "w-full rounded border px-2.5 py-2 text-left text-xs transition-colors hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-kit-primary/30 soft-kit-info border",
      timeText: "--:--",
      statusText: "Nghỉ có phép",
      statusClass: "font-semibold",
    };
  }

  if (attendance.status === 3 || attendance.status === 6) {
    return {
      className:
        "w-full rounded border px-2.5 py-2 text-left text-xs transition-colors hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-kit-primary/30 soft-kit-danger border",
      timeText: "--:--",
      statusText: "Nghỉ không phép",
      statusClass: "font-semibold",
    };
  }

  return {
    className:
      "w-full rounded border px-2.5 py-2 text-left text-xs transition-colors hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-kit-primary/30 border-kit bg-kit-white",
    timeText: "--:--",
    statusText: "",
    statusClass: "text-kit-muted",
  };
}

// Function này dùng để kiểm tra xem status có phải là nghỉ làm không
function isLeaveStatus(status: number | null): boolean {
  return status === 3 || status === 4 || status === 5 || status === 6;
}

// Function này dùng để kiểm tra xem status có phải là đang làm không
function isWorkingStatus(status: number | null): boolean {
  return status === 1 || status === 2;
}

// Component này dùng để hiển thị bảng chấm công
export function AttendanceCalendar({ onSelectSchedule }: Props) {
  // Lấy id của salon hiện tại
  const salonId = useAuthStore((state) => state.getEffectiveSalonId());
  // Lấy user hiện tại
  const { user, hasRole } = useAuthStore();
  // Kiểm tra xem user có phải là admin hoặc manager không
  const isAdminOrManager = hasRole("Admin") || hasRole("Manager");
  // Lấy id của staff hiện tại
  const currentStaffId = user?.staffInfo?.id;

  // Lấy ngày bắt đầu của tuần hiện tại
  const [weekStart, setWeekStart] = useState<DateUtil>(
    formatDate().startOf("isoWeek"),
  );
  // Lấy text tìm kiếm
  const [searchText, setSearchText] = useState("");
  // Kiểm tra xem có phải là chấm công thiếu không
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  // Kiểm tra xem có phải là chưa chấm công không
  const [showNoAttendanceOnly, setShowNoAttendanceOnly] = useState(false);
  // Kiểm tra xem có phải là nghỉ làm không
  const [showLeaveOnly, setShowLeaveOnly] = useState(false);

  // Lấy ngày bắt đầu của tuần hiện tại
  const startDate = weekStart.format("YYYY-MM-DD");
  // Lấy ngày kết thúc của tuần hiện tại
  const endDate = weekStart.endOf("isoWeek").format("YYYY-MM-DD");

  // Function này dùng để chuyển sang tuần trước
  function goToPreviousWeek() {
    setWeekStart(weekStart.subtract(1, "week"));
  }

  // Function này dùng để chuyển sang tuần sau
  function goToNextWeek() {
    setWeekStart(weekStart.add(1, "week"));
  }

  // Function này dùng để chuyển sang tuần hiện tại
  function goToThisWeek() {
    setWeekStart(formatDate().startOf("isoWeek"));
  }

  // Lấy id của staff hiện tại
  const staffFilter = isAdminOrManager ? undefined : (currentStaffId ?? -1);

  // Lấy danh sách ca làm việc
  const shiftsQuery = useShifts(
    {
      pageIndex: 1,
      pageSize: 100,
      salonId: salonId ?? undefined,
    },
    !!salonId,
  );

  // Lấy danh sách lịch làm việc
  const schedulesQuery = useWorkSchedules({
    startDate: startDate,
    endDate: endDate,
    pageIndex: 1,
    pageSize: 1000,
    salonId: salonId ?? undefined,
    staffId: staffFilter,
  });

  // Lấy danh sách chấm công
  const attendancesQuery = useAttendances({
    fromDate: startDate,
    toDate: endDate,
    pageIndex: 1,
    pageSize: 1000,
    salonId: salonId ?? undefined,
    staffId: staffFilter,
  });

  // Lấy danh sách ngày trong tuần
  const weekDays: DateUtil[] = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    weekDays.push(weekStart.add(dayOffset, "day"));
  }

  // Lấy text label của tuần hiện tại
  const weekLabel =
    "Tuần " +
    weekStart.isoWeek() +
    " (" +
    weekStart.format("DD/MM/YYYY") +
    " - " +
    weekStart.endOf("isoWeek").format("DD/MM/YYYY") +
    ")";

  // Lấy danh sách chấm công theo id của lịch làm việc
  const attendanceByScheduleId = useMemo(() => {
    const map = new Map<number, AttendanceDto>();
    const items = attendancesQuery.data?.data?.items ?? [];

    for (const attendance of items) {
      if (attendance.workScheduleId) {
        map.set(attendance.workScheduleId, attendance);
      }
    }

    return map;
  }, [attendancesQuery.data?.data?.items]);

  // Lấy danh sách lịch làm việc đã lọc
  const filteredSchedules = useMemo(() => {
    let list = schedulesQuery.data?.data?.items ?? [];

    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      list = list.filter((schedule: WorkScheduleDTO) => {
        const name = schedule.staffName?.toLowerCase() ?? "";
        return name.includes(keyword);
      });
    }

    const hasFilter = showMissingOnly || showNoAttendanceOnly || showLeaveOnly;
    if (!hasFilter) {
      return list;
    }

    return list.filter((schedule: WorkScheduleDTO) => {
      if (!schedule.id) {
        return false;
      }

      const attendance = attendanceByScheduleId.get(schedule.id) ?? null;

      if (!attendance) {
        return showNoAttendanceOnly;
      }

      if (isLeaveStatus(attendance.status)) {
        return showLeaveOnly;
      }

      if (isWorkingStatus(attendance.status)) {
        const missingCheckOut = !attendance.checkOutAt;
        return showMissingOnly && missingCheckOut;
      }

      return false;
    });
  }, [
    schedulesQuery.data?.data?.items,
    searchText,
    attendanceByScheduleId,
    showMissingOnly,
    showNoAttendanceOnly,
    showLeaveOnly,
  ]);

  // Lấy danh sách ca làm việc
  const shifts = shiftsQuery.data?.data?.items ?? [];

  // Function này dùng để lấy danh sách lịch làm việc theo ca và ngày
  const schedulesByShiftAndDay = useMemo(() => {
    const map = new Map<string, WorkScheduleDTO[]>();

    for (let index = 0; index < filteredSchedules.length; index++) {
      const schedule = filteredSchedules[index];
      if (!schedule.shiftId || !schedule.workDate) {
        continue;
      }

      const dateText = formatDate(schedule.workDate).format("YYYY-MM-DD");
      const key = schedule.shiftId + "_" + dateText;
      const currentList = map.get(key) ?? [];
      currentList.push(schedule);
      map.set(key, currentList);
    }

    return map;
  }, [filteredSchedules]);

  // Function này dùng để chọn lịch làm việc
  function handleSelectSchedule(schedule: WorkScheduleDTO) {
    let scheduleWithShift = schedule;
    // Kiểm tra xem ca có phải là ca làm việc không
    if (schedule.shiftId) {
      // Lấy ca làm việc tương ứng
      let matched: ShiftDTO | null = null;
      // Lấy ca làm việc tương ứng
      for (let index = 0; index < shifts.length; index++) {
        if (shifts[index].id === schedule.shiftId) {
          matched = shifts[index];
          break;
        }
      }

      if (matched) {
        scheduleWithShift = {
          ...schedule,
          shift: matched,
          shiftStart: schedule.shiftStart ?? matched.shiftStart,
          shiftEnd: schedule.shiftEnd ?? matched.shiftEnd,
        };
      }
    }

    let attendance: AttendanceDto | null = null;
    if (schedule.id) {
      attendance = attendanceByScheduleId.get(schedule.id) ?? null;
    }

    // Gọi hàm onSelectSchedule để chọn lịch làm việc
    onSelectSchedule(scheduleWithShift, attendance);
  }

  // Kiểm tra xem có phải là đang tải không
  const isPageLoading =
    shiftsQuery.isLoading ||
    schedulesQuery.isLoading ||
    attendancesQuery.isLoading;

  // Kiểm tra xem có phải là đang fetch không
  const isPageFetching =
    shiftsQuery.isFetching ||
    schedulesQuery.isFetching ||
    attendancesQuery.isFetching;

  // Function này dùng để hiển thị bảng chấm công
  return (
    <div className="space-y-3">
      <Card className="main-card mb-0">
        <CardBody className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto">
            {/* Kiểm tra xem user có phải là admin hoặc manager không */}
            {isAdminOrManager ? (
              // Nếu là admin hoặc manager thì hiển thị input tìm kiếm
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-kit-muted" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Tìm kiếm nhân viên..."
                  className="pl-9"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              {/* Hiển thị checkbox lọc chấm công thiếu */}
              <Checkbox
                id="filter-missing"
                label="Chấm công thiếu"
                tone="danger"
                inline
                checked={showMissingOnly}
                onChange={setShowMissingOnly}
              />
              {/* Hiển thị checkbox lọc chưa chấm công */}
              <Checkbox
                id="filter-no-attendance"
                label="Chưa chấm công"
                tone="warning"
                inline
                checked={showNoAttendanceOnly}
                onChange={setShowNoAttendanceOnly}
              />
              {/* Hiển thị checkbox lọc nghỉ làm */}
              <Checkbox
                id="filter-leave"
                label="Nghỉ làm"
                tone="info"
                inline
                checked={showLeaveOnly}
                onChange={setShowLeaveOnly}
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 xl:w-auto">
            {/* Hiển thị button chuyển tuần trước */}
            <div className="inline-flex overflow-hidden rounded border border-kit bg-kit-white">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mb-0 mr-0 rounded-none"
                onClick={goToPreviousWeek}
                aria-label="Tuần trước"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="min-w-52 border-x border-kit px-3 py-1.5 text-center text-sm font-semibold text-kit-heading">
                {weekLabel}
              </div>
              {/* Hiển thị button chuyển tuần sau */}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mb-0 mr-0 rounded-none"
                onClick={goToNextWeek}
                aria-label="Tuần sau"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Hiển thị button chuyển tuần hiện tại */}
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="mb-0"
              onClick={goToThisWeek}
            >
              Tuần này
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Hiển thị bảng chấm công */}
      <TablePageShell isLoading={isPageLoading} isFetching={isPageFetching}>
        {/* Kiểm tra xem có phải là đang tải không */}
        {isPageLoading ? (
          <div className="flex min-h-100 flex-col items-center justify-center gap-3 py-24">
            <div className="size-8 animate-spin rounded-full border-4 border-kit border-t-kit-primary" />
            <p className="text-sm font-medium text-kit-muted">
              Đang tải bảng chấm công tuần...
            </p>
          </div>
        ) : (
          // Nếu không đang tải thì hiển thị bảng chấm công
          <TableResponsive>
            <Table
              bordered
              hover
              className="min-w-250 table-fixed [&_th]:align-top [&_td]:align-top"
            >
              {/* Hiển thị header của bảng chấm công */}
              <TableHead>
                <TableRow>
                  {/* Hiển thị header của cột ca làm việc */}
                  <TableHeaderCell className="text-center">
                    Ca làm việc
                  </TableHeaderCell>
                  {/* Hiển thị header của cột ngày */}
                  {weekDays.map((day: DateUtil, dayIndex: number) => {
                    const isWeekend = day.day() === 0 || day.day() === 6;
                    const dayColor = isWeekend
                      ? "text-kit-danger"
                      : "text-kit-heading";

                    return (
                      // Hiển thị header của cột ngày
                      <TableHeaderCell key={dayIndex} className="text-center">
                        <div
                          className={
                            "flex flex-col items-center gap-0.5 " + dayColor
                          }
                        >
                          {/* Hiển thị tên ngày */}
                          <span className="text-xs font-medium uppercase opacity-80">
                            {DAY_NAMES[day.day()]}
                          </span>
                          {/* Hiển thị ngày */}
                          <span className="text-sm font-bold">
                            {day.format("DD/MM")}
                          </span>
                        </div>
                      </TableHeaderCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {/* Kiểm tra xem có phải là không có ca làm việc không */}
                {shifts.length === 0 ? (
                  // Nếu không có ca làm việc thì hiển thị bảng không có dữ liệu
                  <TableRow>
                    <TableCell colSpan={8}>
                      <TableEmptyState
                        // Hiển thị icon không có dữ liệu
                        icon={Clock}
                        title="Không có ca làm việc"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  // Nếu có ca làm việc thì hiển thị bảng ca làm việc
                  shifts.map((shift: ShiftDTO, rowIndex: number) => {
                    if (!shift.id) return null;

                    // Lấy key của hàng
                    const rowKey = String(shift.id) + "_" + String(rowIndex);

                    return (
                      // Hiển thị hàng ca làm việc
                      <TableRow key={rowKey}>
                        <TableCell className="bg-kit-page/40">
                          {/* Hiển thị tên ca làm việc */}
                          <div className="font-semibold text-kit-heading">
                            {shift.name}
                          </div>
                          {/* Hiển thị thời gian ca làm việc */}
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-kit-muted">
                            <Clock className="size-3 text-kit-muted" />
                            <span className="rounded bg-kit-page px-1.5 py-0.5 font-semibold text-kit-heading">
                              {/* Hiển thị thời gian bắt đầu ca làm việc */}
                              {shift.shiftStart?.substring(0, 5)}
                            </span>
                            <span>-</span>
                            <span className="rounded bg-kit-page px-1.5 py-0.5 font-semibold text-kit-heading">
                              {/* Hiển thị thời gian kết thúc ca làm việc */}
                              {shift.shiftEnd?.substring(0, 5)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Hiển thị các cột ngày */}
                        {weekDays.map((day: DateUtil, dayIndex: number) => {
                          // Lấy text ngày
                          const dateText = day.format("YYYY-MM-DD");
                          const cellKey = shift.id + "_" + dateText;
                          // Lấy danh sách lịch làm việc theo ca và ngày
                          const cellSchedules =
                            schedulesByShiftAndDay.get(cellKey) ?? [];

                          return (
                            // Hiển thị cột ngày
                            <TableCell key={dayIndex} className="text-start">
                              <div className="flex min-h-27.5 flex-col items-start gap-2 p-0.5">
                                {/* Kiểm tra xem có phải là không có lịch không */}
                                {cellSchedules.length === 0 ? (
                                  // Nếu không có lịch thì hiển thị bảng không có dữ liệu
                                  <div className="py-10 text-start text-xs italic text-kit-muted">
                                    Không có lịch
                                  </div>
                                ) : (
                                  cellSchedules.map(
                                    (schedule: WorkScheduleDTO) => {
                                      let attendance: AttendanceDto | null =
                                        null;
                                      if (schedule.id) {
                                        attendance =
                                          attendanceByScheduleId.get(
                                            schedule.id,
                                          ) ?? null;
                                      }

                                      const card = getCardStyle(attendance);

                                      return (
                                        <button
                                          type="button"
                                          key={schedule.id}
                                          onClick={() =>
                                            handleSelectSchedule(schedule)
                                          }
                                          className={card.className}
                                        >
                                          <div className="truncate text-start font-semibold text-kit-heading">
                                            {schedule.staffName}
                                          </div>
                                          <div className="mt-1 text-kit-muted">
                                            {card.timeText}
                                          </div>
                                          <div
                                            className={
                                              "mt-1 " + card.statusClass
                                            }
                                          >
                                            {card.statusText}
                                          </div>
                                        </button>
                                      );
                                    },
                                  )
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableResponsive>
        )}
      </TablePageShell>
    </div>
  );
}
