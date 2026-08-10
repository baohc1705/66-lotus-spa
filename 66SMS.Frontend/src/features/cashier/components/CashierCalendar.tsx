import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { Popover } from "@/shared/components/Popover";
import { Button } from "@/shared/elements/Button";
import { Dropdown, type DropdownItem } from "@/shared/elements/Dropdown";
import { Checkbox } from "@/shared/forms/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import type { CashierBooking, StaffColumn } from "../types";
import {
  CASHIER_STATUS_CARD_CLASS,
  CASHIER_STATUS_LABELS,
  DEFAULT_SLOT_END_MINS,
  DEFAULT_SLOT_START_MINS,
  DEFAULT_SLOT_STEP_MINS,
  SLOT_ROW_HEIGHT_PX,
  buildDayTimeSlots,
  formatCalendarTitle,
  formatMonthTitle,
  getActiveStatusIds,
  getBookingContentLines,
  getBookingDurationMins,
  getBookingSlotCount,
  getBookingsForDaySlot,
  getBookingsForSlot,
  getBookingsForStaffDay,
  getDayBookings,
  getFilteredBookingsForDay,
  getMonthGridDays,
  getStatusFilterItems,
  getViewLabel,
  getWeekDays,
  isSameDay,
  shiftCalendarDate,
  toCalendarStatus,
  toDateKey,
  type CashierCalendarView,
  type CashierSlotConfig,
} from "../utils/cashierCalendar.utils";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type StatusFilterItem = {
  id: string;
  label: string;
  colorClass: string;
  active: boolean;
};

type CashierCalendarProps = {
  date: Date;
  viewMode: CashierCalendarView;
  columns: StaffColumn[];
  bookings: CashierBooking[];
  slotConfig?: CashierSlotConfig | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CashierCalendarView) => void;
  onBookingClick: (booking: CashierBooking) => void;
  onEmptySlotClick?: (staffId: number, time: string) => void;
  onRetry?: () => void;
  onAddBooking?: () => void;
  onOpenStaffAvailability?: () => void;
  onOpenPositionAvailability?: () => void;
};

function MiniMonthCalendar(props: {
  date: Date;
  onSelect: (next: Date) => void;
}) {
  const date = props.date;
  const onSelect = props.onSelect;

  const dateMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const [cursorMonth, setCursorMonth] = useState(dateMonth);
  const [syncedDateKey, setSyncedDateKey] = useState(toDateKey(date));
  const currentDateKey = toDateKey(date);

  if (currentDateKey !== syncedDateKey) {
    setSyncedDateKey(currentDateKey);
    setCursorMonth(dateMonth);
  }

  const days = getMonthGridDays(cursorMonth);
  const today = new Date();

  function goPrevMonth() {
    setCursorMonth(
      new Date(cursorMonth.getFullYear(), cursorMonth.getMonth() - 1, 1),
    );
  }

  function goNextMonth() {
    setCursorMonth(
      new Date(cursorMonth.getFullYear(), cursorMonth.getMonth() + 1, 1),
    );
  }

  function getDayClass(day: Date): string {
    const inMonth = day.getMonth() === cursorMonth.getMonth();
    const selected = isSameDay(day, date);
    const isToday = isSameDay(day, today);
    const dayClass =
      "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ";

    if (selected) {
      return dayClass + "bg-kit-primary font-semibold text-kit-white";
    }
    if (isToday) {
      return (
        dayClass + "font-semibold text-kit-primary ring-1 ring-kit-primary/40"
      );
    }
    if (inMonth) {
      return dayClass + "text-kit-heading hover:bg-kit-page";
    }
    return dayClass + "text-kit-muted/50";
  }

  return (
    <div className="px-3 pb-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-kit-heading">
          {formatMonthTitle(cursorMonth)}
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mb-0 mr-0"
            onClick={goPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mb-0 mr-0"
            onClick={goNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-y-1 text-center text-2xs font-semibold text-kit-muted">
        {WEEKDAY_LABELS.map((label: string) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day: Date) => (
          <button
            key={day.toISOString()}
            type="button"
            className={getDayClass(day)}
            onClick={() => onSelect(new Date(day))}
          >
            {day.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingCard(props: {
  booking: CashierBooking;
  onClick: () => void;
  sideIndex?: number;
  sideCount?: number;
  compact?: boolean;
  stepMins?: number;
}) {
  const booking = props.booking;
  const onClick = props.onClick;
  const sideIndex = props.sideIndex || 0;
  let sideCount = props.sideCount || 1;
  if (sideCount < 1) {
    sideCount = 1;
  }
  const compact = props.compact || false;
  const stepMins = props.stepMins || DEFAULT_SLOT_STEP_MINS;

  const calendarStatus = toCalendarStatus(booking.status);
  const cardClass = CASHIER_STATUS_CARD_CLASS[calendarStatus];
  const customerName = booking.customerName || "Khách";
  const serviceName = booking.serviceName || "Dịch vụ";
  const statusLabel = CASHIER_STATUS_LABELS[calendarStatus] || "";
  const durationMins = getBookingDurationMins(booking, stepMins);
  let lines = getBookingContentLines(durationMins);
  if (compact) {
    lines = 1;
  }
  const slotCount = getBookingSlotCount(booking, stepMins);

  let leftCss = "1px";
  let rightCss = "1px";
  let widthCss = "";
  if (sideCount > 1) {
    const widthPercent = 100 / sideCount;
    leftCss = "calc(" + sideIndex * widthPercent + "% + 1px)";
    rightCss = "";
    widthCss = "calc(" + widthPercent + "% - 2px)";
  }

  let nameClass = "font-bold leading-tight text-kit-white";
  let mutedClass = "text-2xs leading-tight text-kit-white/85";
  let timeClass = "leading-tight text-kit-white/95";
  if (calendarStatus === "waiting") {
    nameClass = "font-bold leading-tight text-kit-on-warning";
    mutedClass = "text-2xs leading-tight text-kit-on-warning/80";
    timeClass = "leading-tight text-kit-on-warning/90";
  }

  function handleClick(event: { stopPropagation(): void }) {
    event.stopPropagation();
    onClick();
  }

  function renderTimeRange() {
    return (
      <div className={"truncate " + timeClass}>
        <span>{booking.startTime}</span>
        <span> ~ </span>
        <span>{booking.endTime}</span>
      </div>
    );
  }

  // Rule noi dung theo thoi luong (compact = luon 1 hang):
  // <30p / compact: 1 hang (gio + ten KH)
  // 30-<60p: 2 hang (gio, ten KH)
  // >=60p: 3 hang (gio, ten KH, dich vu)
  function renderCardContent() {
    if (lines === 1) {
      return (
        <div className={"truncate text-2xs " + timeClass}>
          <span>
            {booking.startTime} ~ {booking.endTime}
          </span>{" "}
          <span className={nameClass}>{customerName}</span>
        </div>
      );
    }

    if (lines === 2) {
      return (
        <>
          {renderTimeRange()}
          <div className={"truncate " + nameClass}>{customerName}</div>
        </>
      );
    }

    return (
      <>
        {renderTimeRange()}
        <div className={"truncate " + nameClass}>{customerName}</div>
        <div className={"truncate " + mutedClass}>{serviceName}</div>
      </>
    );
  }

  const cardStyle: {
    top: string;
    height: string;
    left: string;
    right?: string;
    width?: string;
  } = {
    top: "1px",
    height: "calc(" + slotCount + " * 100% - 2px)",
    left: leftCss,
  };
  if (widthCss) {
    cardStyle.width = widthCss;
  } else {
    cardStyle.right = rightCss;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        "absolute z-[1] box-border flex flex-col overflow-hidden rounded-sm border-0 p-2 text-left text-2xs hover:opacity-90 " +
        cardClass
      }
      style={cardStyle}
      title={customerName + " · " + statusLabel}
    >
      {renderCardContent()}
    </button>
  );
}

export function CashierCalendar(props: CashierCalendarProps) {
  const date = props.date;
  const viewMode = props.viewMode;
  const columns = props.columns;
  const bookings = props.bookings;
  let slotConfig = props.slotConfig;
  if (!slotConfig) {
    slotConfig = {
      startMins: DEFAULT_SLOT_START_MINS,
      endMins: DEFAULT_SLOT_END_MINS,
      stepMins: DEFAULT_SLOT_STEP_MINS,
    };
  }
  const slotRows = buildDayTimeSlots(slotConfig);
  const stepMins = slotConfig.stepMins;
  const isLoading = props.isLoading || false;
  const isError = props.isError || false;
  const errorMessage = props.errorMessage;
  const onDateChange = props.onDateChange;
  const onViewChange = props.onViewChange;
  const onBookingClick = props.onBookingClick;
  const onEmptySlotClick = props.onEmptySlotClick;
  const onRetry = props.onRetry;
  const onAddBooking = props.onAddBooking;
  const onOpenStaffAvailability = props.onOpenStaffAvailability;
  const onOpenPositionAvailability = props.onOpenPositionAvailability;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilters, setStatusFilters] = useState<StatusFilterItem[]>(
    getStatusFilterItems(),
  );

  const [hiddenMenuNonce, setHiddenMenuNonce] = useState(0);
  const [weekLayout, setWeekLayout] = useState<"day" | "staff">("day");

  const activeStatusIds = getActiveStatusIds(statusFilters);
  const dayBookings = getDayBookings(bookings, date);
  const weekDays = getWeekDays(date);
  const monthDays = getMonthGridDays(date);
  const today = new Date();

  const viewItems: DropdownItem[] = [
    {
      type: "item",
      label: "Ngày",
      onClick: () => onViewChange("day"),
    },
    {
      type: "item",
      label: "Tuần",
      onClick: () => onViewChange("week"),
    },
    {
      type: "item",
      label: "Tháng",
      onClick: () => onViewChange("month"),
    },
  ];

  const weekLayoutItems: DropdownItem[] = [
    {
      type: "item",
      label: "Theo thời gian",
      onClick: () => setWeekLayout("day"),
    },
    {
      type: "item",
      label: "Theo nhân viên",
      onClick: () => setWeekLayout("staff"),
    },
  ];

  let weekLayoutLabel = "Theo thời gian";
  if (weekLayout === "staff") {
    weekLayoutLabel = "Theo nhân viên";
  }

  function handleStatusToggle(statusId: string, active: boolean) {
    const next: StatusFilterItem[] = [];
    for (let index = 0; index < statusFilters.length; index++) {
      const item = statusFilters[index];
      if (item.id === statusId) {
        next.push({
          id: item.id,
          label: item.label,
          colorClass: item.colorClass,
          active: active,
        });
      } else {
        next.push(item);
      }
    }
    setStatusFilters(next);
  }

  function goToday() {
    onDateChange(new Date());
  }

  function goPrev() {
    onDateChange(shiftCalendarDate(date, viewMode, -1));
  }

  function goNext() {
    onDateChange(shiftCalendarDate(date, viewMode, 1));
  }

  function openDayView(nextDate: Date) {
    onDateChange(nextDate);
    onViewChange("day");
  }

  function renderStaffHeaders() {
    const headers = [];
    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];
      headers.push(
        <TableHeaderCell
          key={column.id}
          className="sticky top-0 z-40 soft-kit-primary"
        >
          <div className="flex items-center justify-center gap-2 px-1 py-0.5">
            <FallbackImage
              kind="ktv"
              src={column.avatar}
              alt={column.name}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-xs font-bold text-kit-primary">
              {column.name}
            </span>
          </div>
        </TableHeaderCell>,
      );
    }
    return headers;
  }

  function renderSlotRows() {
    const rows = [];

    for (let slotIndex = 0; slotIndex < slotRows.length; slotIndex++) {
      const slotTime = slotRows[slotIndex];
      const cells = [];

      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];
        const cellBookings = getBookingsForSlot(
          dayBookings,
          String(column.id),
          slotTime,
          activeStatusIds,
          stepMins,
        );

        const cards = [];
        for (let b = 0; b < cellBookings.length; b++) {
          const booking = cellBookings[b];
          cards.push(
            <BookingCard
              key={booking.id}
              booking={booking}
              stepMins={stepMins}
              onClick={() => onBookingClick(booking)}
            />,
          );
        }

        cells.push(
          <TableCell
            key={String(column.id) + "-" + slotTime}
            className="relative overflow-visible p-0! align-top"
            style={{ height: SLOT_ROW_HEIGHT_PX + "px" }}
          >
            <div
              className="relative h-full w-full cursor-pointer hover:bg-kit-primary/5"
              onClick={() => {
                const staffId = Number(column.id);
                if (Number.isNaN(staffId)) {
                  return;
                }
                if (onEmptySlotClick) {
                  onEmptySlotClick(staffId, slotTime);
                }
              }}
            >
              {cards}
            </div>
          </TableCell>,
        );
      }

      rows.push(
        <TableRow key={slotTime}>
          <TableCell
            asHeader
            className="sticky left-0 z-30 w-16 bg-kit-page align-top! pt-1 text-center text-xs font-semibold leading-none text-kit-primary shadow-[1px_0_0_0_var(--kit-border)]"
            style={{ height: SLOT_ROW_HEIGHT_PX + "px" }}
          >
            {slotTime}
          </TableCell>
          {cells}
        </TableRow>,
      );
    }

    return rows;
  }

  function renderWeekSlotRows() {
    const rows = [];

    for (let slotIndex = 0; slotIndex < slotRows.length; slotIndex++) {
      const slotTime = slotRows[slotIndex];
      const cells = [];

      for (let dayIndex = 0; dayIndex < weekDays.length; dayIndex++) {
        const day = weekDays[dayIndex];
        const cellBookings = getBookingsForDaySlot(
          bookings,
          day,
          slotTime,
          activeStatusIds,
          stepMins,
        );
        const cellKey = toDateKey(day) + "-" + slotTime;

        const visibleBookings: CashierBooking[] = [];
        const hiddenBookings: CashierBooking[] = [];
        for (let b = 0; b < cellBookings.length; b++) {
          if (b < 2) {
            visibleBookings.push(cellBookings[b]);
          } else {
            hiddenBookings.push(cellBookings[b]);
          }
        }

        const cards = [];
        for (let b = 0; b < visibleBookings.length; b++) {
          const booking = visibleBookings[b];
          cards.push(
            <BookingCard
              key={booking.id}
              booking={booking}
              sideIndex={b}
              sideCount={visibleBookings.length}
              compact={visibleBookings.length > 1}
              stepMins={stepMins}
              onClick={() => onBookingClick(booking)}
            />,
          );
        }

        let moreButton = null;
        if (hiddenBookings.length > 0) {
          const hiddenList = [];
          for (let h = 0; h < hiddenBookings.length; h++) {
            const hidden = hiddenBookings[h];
            const hiddenName = hidden.customerName || "Khách";
            const hiddenStatus = toCalendarStatus(hidden.status);
            const hiddenCardClass = CASHIER_STATUS_CARD_CLASS[hiddenStatus];
            const statusLabel = CASHIER_STATUS_LABELS[hiddenStatus] || "";

            let textClass = "text-kit-white";
            if (hiddenStatus === "waiting") {
              textClass = "text-kit-on-warning";
            }

            hiddenList.push(
              <button
                key={hidden.id}
                type="button"
                className={
                  "mb-1 block w-full truncate rounded border px-2 py-1.5 text-left text-2xs last:mb-0 hover:opacity-90 " +
                  hiddenCardClass
                }
                title={hiddenName + " · " + statusLabel}
                onClick={(event: { stopPropagation(): void }) => {
                  event.stopPropagation();
                  setHiddenMenuNonce(hiddenMenuNonce + 1);
                  onBookingClick(hidden);
                }}
              >
                <span className={textClass}>
                  {hidden.startTime} ~ {hidden.endTime}{" "}
                  <span className="font-bold">{hiddenName}</span>
                </span>
              </button>,
            );
          }

          moreButton = (
            <div
              className="absolute bottom-1 right-1 z-10"
              onClick={(event: { stopPropagation(): void }) => {
                event.stopPropagation();
              }}
            >
              <Popover
                key={"week-slot-more-" + cellKey + "-" + hiddenMenuNonce}
                placement="top"
                align="end"
                title="Lịch ẩn"
                contentClassName="max-h-64 overflow-y-auto p-1.5"
                trigger={
                  <span className="rounded bg-kit-primary px-1.5 py-0.5 text-2xs font-bold text-kit-white shadow hover:bg-blue-700">
                    +{hiddenBookings.length}
                  </span>
                }
                content={hiddenList}
              />
            </div>
          );
        }

        cells.push(
          <TableCell
            key={cellKey}
            className="relative overflow-visible p-0! align-top"
            style={{ height: SLOT_ROW_HEIGHT_PX + "px" }}
          >
            <div
              className="relative h-full w-full cursor-pointer hover:bg-kit-primary/5"
              onClick={() => {
                openDayView(day);
              }}
            >
              {cards}
              {moreButton}
            </div>
          </TableCell>,
        );
      }

      rows.push(
        <TableRow key={slotTime}>
          <TableCell
            asHeader
            className="sticky left-0 z-30 w-16 bg-kit-page align-top! pt-1 text-center text-xs font-semibold leading-none text-kit-primary shadow-[1px_0_0_0_var(--kit-border)]"
            style={{ height: SLOT_ROW_HEIGHT_PX + "px" }}
          >
            {slotTime}
          </TableCell>
          {cells}
        </TableRow>,
      );
    }

    return rows;
  }

  function renderWeekDayHeaders() {
    const dayHeaders = [];
    for (let index = 0; index < weekDays.length; index++) {
      const day = weekDays[index];
      const selected = isSameDay(day, date);
      const isToday = isSameDay(day, today);
      let headClass =
        "sticky top-0 z-40 cursor-pointer bg-kit-page px-1 py-2 text-center ";
      if (selected) {
        headClass = headClass + "soft-kit-primary ";
      }

      dayHeaders.push(
        <TableHeaderCell key={toDateKey(day)} className={headClass}>
          <button
            type="button"
            className="w-full"
            onClick={() => openDayView(day)}
          >
            <div className="text-2xs font-semibold text-kit-muted">
              {WEEKDAY_LABELS[index]}
            </div>
            <div
              className={
                isToday
                  ? "text-sm font-bold text-kit-primary"
                  : "text-sm font-bold text-kit-heading"
              }
            >
              {day.getDate()}/{day.getMonth() + 1}
            </div>
          </button>
        </TableHeaderCell>,
      );
    }
    return dayHeaders;
  }

  function renderWeekStaffView() {
    if (columns.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-kit-muted">
          Không có nhân viên trong tuần này.
        </div>
      );
    }

    const rows = [];
    for (let staffIndex = 0; staffIndex < columns.length; staffIndex++) {
      const column = columns[staffIndex];
      const staffId = String(column.id);
      const cells = [];

      for (let dayIndex = 0; dayIndex < weekDays.length; dayIndex++) {
        const day = weekDays[dayIndex];
        const cellBookings = getBookingsForStaffDay(
          bookings,
          staffId,
          day,
          activeStatusIds,
        );
        const cellKey = staffId + "-" + toDateKey(day);

        const visibleBookings: CashierBooking[] = [];
        const hiddenBookings: CashierBooking[] = [];
        for (let b = 0; b < cellBookings.length; b++) {
          if (b < 3) {
            visibleBookings.push(cellBookings[b]);
          } else {
            hiddenBookings.push(cellBookings[b]);
          }
        }

        const cards = [];
        for (let b = 0; b < visibleBookings.length; b++) {
          const booking = visibleBookings[b];
          const status = toCalendarStatus(booking.status);
          const cardClass = CASHIER_STATUS_CARD_CLASS[status];
          const customerName = booking.customerName || "Khách";
          const statusLabel = CASHIER_STATUS_LABELS[status] || "";

          let textClass = "text-kit-white";
          if (status === "waiting") {
            textClass = "text-kit-on-warning";
          }

          cards.push(
            <button
              key={booking.id}
              type="button"
              className={
                "mb-1 block w-full truncate rounded-sm border-0 px-2 py-1.5 text-left text-2xs last:mb-0 hover:opacity-90 " +
                cardClass
              }
              title={customerName + " · " + statusLabel}
              onClick={(event: { stopPropagation(): void }) => {
                event.stopPropagation();
                onBookingClick(booking);
              }}
            >
              <span className={textClass}>
                {booking.startTime} ~ {booking.endTime}{" "}
                <span className="font-bold">{customerName}</span>
              </span>
            </button>,
          );
        }

        let moreButton = null;
        if (hiddenBookings.length > 0) {
          const hiddenList = [];
          for (let h = 0; h < hiddenBookings.length; h++) {
            const hidden = hiddenBookings[h];
            const hiddenName = hidden.customerName || "Khách";
            const hiddenStatus = toCalendarStatus(hidden.status);
            const hiddenCardClass = CASHIER_STATUS_CARD_CLASS[hiddenStatus];
            const statusLabel = CASHIER_STATUS_LABELS[hiddenStatus] || "";

            let textClass = "text-kit-white";
            if (hiddenStatus === "waiting") {
              textClass = "text-kit-on-warning";
            }

            hiddenList.push(
              <button
                key={hidden.id}
                type="button"
                className={
                  "mb-1 block w-full truncate rounded border px-2 py-1.5 text-left text-2xs last:mb-0 hover:opacity-90 " +
                  hiddenCardClass
                }
                title={hiddenName + " · " + statusLabel}
                onClick={(event: { stopPropagation(): void }) => {
                  event.stopPropagation();
                  setHiddenMenuNonce(hiddenMenuNonce + 1);
                  onBookingClick(hidden);
                }}
              >
                <span className={textClass}>
                  {hidden.startTime} ~ {hidden.endTime}{" "}
                  <span className="font-bold">{hiddenName}</span>
                </span>
              </button>,
            );
          }

          moreButton = (
            <div
              className="relative mt-1"
              onClick={(event: { stopPropagation(): void }) => {
                event.stopPropagation();
              }}
            >
              <Popover
                key={"week-staff-more-" + cellKey + "-" + hiddenMenuNonce}
                placement="bottom"
                align="start"
                title="Lịch ẩn"
                contentClassName="max-h-64 overflow-y-auto p-1.5"
                trigger={
                  <span className="rounded bg-kit-primary px-1.5 py-0.5 text-2xs font-bold text-kit-white shadow hover:bg-blue-700">
                    +{hiddenBookings.length}
                  </span>
                }
                content={hiddenList}
              />
            </div>
          );
        }

        cells.push(
          <TableCell
            key={cellKey}
            className="relative overflow-visible p-1! align-top"
          >
            <div
              className="min-h-20 w-full cursor-pointer rounded-sm p-0.5 hover:bg-kit-primary/5"
              onClick={() => {
                openDayView(day);
              }}
            >
              {cards}
              {moreButton}
            </div>
          </TableCell>,
        );
      }

      rows.push(
        <TableRow key={staffId}>
          <TableCell
            asHeader
            className="sticky left-0 z-30 w-40 bg-kit-page align-middle! px-2 py-2 shadow-[1px_0_0_0_var(--kit-border)]"
          >
            <div className="flex items-center gap-2">
              <FallbackImage
                kind="ktv"
                src={column.avatar}
                alt={column.name}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
              <span className="truncate text-xs font-bold text-kit-heading">
                {column.name}
              </span>
            </div>
          </TableCell>
          {cells}
        </TableRow>,
      );
    }

    return (
      <div className="relative z-0 isolate min-h-0 w-full flex-1 overflow-auto">
        <Table
          bordered
          size="sm"
          className="w-full table-fixed overflow-visible [&_th]:p-0! [&_td]:p-0!"
          style={{ minWidth: "1000px" }}
        >
          <TableHead>
            <TableRow>
              <TableHeaderCell className="sticky left-0 top-0 z-50 w-40 soft-kit-primary px-2 py-2 text-left text-xs font-bold text-kit-primary shadow-[1px_0_0_0_var(--kit-border)]">
                Nhân viên
              </TableHeaderCell>
              {renderWeekDayHeaders()}
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </div>
    );
  }

  function renderWeekView() {
    return (
      <div className="relative z-0 isolate min-h-0 w-full flex-1 overflow-auto">
        <Table
          bordered
          size="sm"
          className="w-full table-fixed overflow-visible [&_th]:p-0! [&_td]:p-0!"
          style={{ minWidth: "900px" }}
        >
          <TableHead>
            <TableRow>
              <TableHeaderCell className="sticky left-0 top-0 z-50 w-16 soft-kit-primary pt-2 text-center text-xs font-bold text-kit-primary shadow-[1px_0_0_0_var(--kit-border)]">
                Giờ
              </TableHeaderCell>
              {renderWeekDayHeaders()}
            </TableRow>
          </TableHead>
          <TableBody>{renderWeekSlotRows()}</TableBody>
        </Table>
      </div>
    );
  }

  function renderMonthView() {
    const cells = [];
    for (let index = 0; index < monthDays.length; index++) {
      const day = monthDays[index];
      const inMonth = day.getMonth() === date.getMonth();
      const selected = isSameDay(day, date);
      const isToday = isSameDay(day, today);
      const cellKey = "month-" + toDateKey(day);
      const cellBookings = getFilteredBookingsForDay(
        bookings,
        day,
        activeStatusIds,
      );

      const visibleBookings: CashierBooking[] = [];
      const hiddenBookings: CashierBooking[] = [];
      for (let b = 0; b < cellBookings.length; b++) {
        if (b < 3) {
          visibleBookings.push(cellBookings[b]);
        } else {
          hiddenBookings.push(cellBookings[b]);
        }
      }

      let cellClass =
        "relative flex h-full min-h-0 w-full min-w-0 cursor-pointer flex-col overflow-visible border border-kit/40 p-1.5 ";
      if (!inMonth) {
        cellClass = cellClass + "bg-kit-page/60 text-kit-muted ";
      } else if (selected) {
        cellClass = cellClass + "soft-kit-primary ";
      } else {
        cellClass = cellClass + "bg-kit-white ";
      }

      const cards = [];
      for (let b = 0; b < visibleBookings.length; b++) {
        const booking = visibleBookings[b];
        const status = toCalendarStatus(booking.status);
        const cardClass = CASHIER_STATUS_CARD_CLASS[status];
        const customerName = booking.customerName || "Khách";
        const statusLabel = CASHIER_STATUS_LABELS[status] || "";

        let textClass = "text-kit-white";
        if (status === "waiting") {
          textClass = "text-kit-on-warning";
        }

        cards.push(
          <button
            key={booking.id}
            type="button"
            className={
              "mb-1 box-border block w-full max-w-full truncate rounded-sm border-0 px-1.5 py-1 text-left text-2xs last:mb-0 hover:opacity-90 " +
              cardClass
            }
            title={customerName + " · " + statusLabel}
            onClick={(event: { stopPropagation(): void }) => {
              event.stopPropagation();
              onBookingClick(booking);
            }}
          >
            <span className={textClass}>
              {booking.startTime} ~ {booking.endTime}{" "}
              <span className="font-bold">{customerName}</span>
            </span>
          </button>,
        );
      }

      let moreButton = null;
      if (hiddenBookings.length > 0) {
        const hiddenList = [];
        for (let h = 0; h < hiddenBookings.length; h++) {
          const hidden = hiddenBookings[h];
          const hiddenName = hidden.customerName || "Khách";
          const hiddenStatus = toCalendarStatus(hidden.status);
          const hiddenCardClass = CASHIER_STATUS_CARD_CLASS[hiddenStatus];
          const statusLabel = CASHIER_STATUS_LABELS[hiddenStatus] || "";

          let textClass = "text-kit-white";
          if (hiddenStatus === "waiting") {
            textClass = "text-kit-on-warning";
          }

          hiddenList.push(
            <button
              key={hidden.id}
              type="button"
              className={
                "mb-1 block w-full truncate rounded border px-2 py-1.5 text-left text-2xs last:mb-0 hover:opacity-90 " +
                hiddenCardClass
              }
              title={hiddenName + " · " + statusLabel}
              onClick={(event: { stopPropagation(): void }) => {
                event.stopPropagation();
                setHiddenMenuNonce(hiddenMenuNonce + 1);
                onBookingClick(hidden);
              }}
            >
              <span className={textClass}>
                {hidden.startTime} ~ {hidden.endTime}{" "}
                <span className="font-bold">{hiddenName}</span>
              </span>
            </button>,
          );
        }

        moreButton = (
          <div
            className="relative mt-0.5"
            onClick={(event: { stopPropagation(): void }) => {
              event.stopPropagation();
            }}
          >
            <Popover
              key={"month-more-" + cellKey + "-" + hiddenMenuNonce}
              placement="bottom"
              align="start"
              title="Lịch ẩn"
              contentClassName="max-h-64 overflow-y-auto p-1.5"
              trigger={
                <span className="rounded bg-kit-primary px-1.5 py-0.5 text-2xs font-bold text-kit-white shadow hover:bg-blue-700">
                  +{hiddenBookings.length}
                </span>
              }
              content={hiddenList}
            />
          </div>
        );
      }

      cells.push(
        <div
          key={cellKey}
          className={cellClass}
          onClick={() => {
            openDayView(day);
          }}
        >
          <div
            className={
              isToday
                ? "mb-1 shrink-0 text-sm font-bold text-kit-primary"
                : "mb-1 shrink-0 text-sm font-semibold text-kit-heading"
            }
          >
            {day.getDate()}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden hover:bg-kit-primary/5">
            {cards}
          </div>
          {moreButton}
        </div>,
      );
    }

    const weekdayHeads = [];
    for (let index = 0; index < WEEKDAY_LABELS.length; index++) {
      weekdayHeads.push(
        <div
          key={WEEKDAY_LABELS[index]}
          className="min-w-0 px-1 py-1 text-center text-xs font-bold text-kit-muted"
        >
          {WEEKDAY_LABELS[index]}
        </div>,
      );
    }

    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto p-2">
        <div className="grid w-full shrink-0 grid-cols-7">
          {weekdayHeads}
        </div>
        <div className="grid min-h-120 w-full min-w-0 flex-1 grid-cols-7 grid-rows-6">
          {cells}
        </div>
      </div>
    );
  }

  function renderDayView() {
    if (columns.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-kit-muted">
          Không có nhân viên trong ngày này.
        </div>
      );
    }

    const tableMinWidth = Math.max(640, 64 + columns.length * 160);

    return (
      <div className="relative z-0 isolate min-h-0 w-full flex-1 overflow-auto">
        <Table
          bordered
          size="sm"
          className="w-full table-fixed overflow-visible [&_th]:p-0! [&_td]:p-0!"
          style={{ minWidth: tableMinWidth + "px" }}
        >
          <TableHead>
            <TableRow>
              <TableHeaderCell className="sticky left-0 top-0 z-50 w-16 soft-kit-primary pt-2 text-center text-xs font-bold text-kit-primary shadow-[1px_0_0_0_var(--kit-border)]">
                Giờ
              </TableHeaderCell>
              {renderStaffHeaders()}
            </TableRow>
          </TableHead>
          <TableBody>{renderSlotRows()}</TableBody>
        </Table>
      </div>
    );
  }

  function renderMainBody() {
    if (isError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm font-semibold text-kit-danger">
            {errorMessage || "Không tải được lịch hẹn"}
          </p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              className="mb-0"
              onClick={onRetry}
            >
              Thử lại
            </Button>
          ) : null}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-kit-primary" />
        </div>
      );
    }

    if (viewMode === "week") {
      if (weekLayout === "staff") {
        return renderWeekStaffView();
      }
      return renderWeekView();
    }
    if (viewMode === "month") {
      return renderMonthView();
    }
    return renderDayView();
  }

  function renderStatusFilters() {
    const list = [];
    for (let index = 0; index < statusFilters.length; index++) {
      const item = statusFilters[index];
      list.push(
        <label
          key={item.id}
          className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-kit-page"
        >
          <Checkbox
            checked={item.active}
            onChange={(checked) => handleStatusToggle(item.id, checked)}
            className="mb-0"
          />
          <span
            className={"h-2.5 w-2.5 shrink-0 rounded-full " + item.colorClass}
          />
          <span className="truncate text-xs text-kit-heading">
            {item.label}
          </span>
        </label>,
      );
    }
    return list;
  }

  return (
    <div
      className={
        sidebarOpen
          ? "grid h-full min-h-0 w-full min-w-0 flex-1 grid-cols-[16rem_minmax(0,1fr)] grid-rows-[2.75rem_minmax(0,1fr)] overflow-hidden rounded border border-kit bg-kit-white font-sans text-sm text-kit-body"
          : "grid h-full min-h-0 w-full min-w-0 flex-1 grid-cols-1 grid-rows-[2.75rem_minmax(0,1fr)] overflow-hidden rounded border border-kit bg-kit-white font-sans text-sm text-kit-body"
      }
    >
      {sidebarOpen ? (
        <div className="flex items-center gap-1 border-b border-r border-kit px-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mb-0 mr-0"
            title="Đóng sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-0 mr-0"
            onClick={goToday}
          >
            Hôm nay
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mb-0 mr-0"
            onClick={goPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mb-0 mr-0"
            onClick={goNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="relative z-50 flex items-center gap-2 border-b border-kit bg-kit-white px-3">
        {!sidebarOpen ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mb-0 mr-0"
            title="Mở sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        ) : null}
        <Dropdown
          label={getViewLabel(viewMode)}
          variant="outline-primary"
          size="sm"
          className="mb-0 mr-0"
          items={viewItems}
        />
        {viewMode === "week" ? (
          <Dropdown
            label={weekLayoutLabel}
            variant="outline"
            size="sm"
            className="mb-0 mr-0"
            items={weekLayoutItems}
          />
        ) : null}
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-kit-heading">
          {formatCalendarTitle(date, viewMode)}
        </h2>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="mb-0 mr-0"
            onClick={onOpenStaffAvailability}
          >
            Tra cứu nhân viên
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="mb-0 mr-0"
            onClick={onOpenPositionAvailability}
          >
            Tra cứu vị trí
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            className="mb-0 mr-0"
            onClick={onAddBooking}
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm lịch
          </Button>
        </div>
      </div>

      {sidebarOpen ? (
        <aside className="relative z-40 flex min-h-0 flex-col overflow-hidden border-r border-kit bg-kit-white">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <MiniMonthCalendar date={date} onSelect={onDateChange} />

            <div className="border-t border-kit px-3 py-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-kit-muted">
                Trạng thái
              </p>
              <div className="space-y-1">{renderStatusFilters()}</div>
            </div>
          </div>
        </aside>
      ) : null}

      <div className="relative z-0 flex min-h-0 min-w-0 flex-col overflow-hidden">
        {renderMainBody()}
      </div>
    </div>
  );
}
