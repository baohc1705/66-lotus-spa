import { APPOINTMENT_STATUS } from "@/features/booking/constants/appointment.constants";
import type { CashierBooking } from "../types";

export type CashierCalendarStatus =
  | "pending"
  | "confirmed"
  | "waiting"
  | "in-progress"
  | "completed"
  | "cancelled";

export const CASHIER_STATUS_CARD_CLASS: Record<CashierCalendarStatus, string> =
  {
    pending: "bg-kit-secondary text-kit-white border-kit-secondary",
    confirmed: "bg-kit-info text-kit-white border-kit-info",
    waiting: "bg-kit-warning text-kit-on-warning border-kit-warning",
    "in-progress": "bg-kit-alt text-kit-white border-kit-alt",
    completed: "bg-kit-success text-kit-white border-kit-success",
    cancelled: "bg-kit-danger text-kit-white border-kit-danger",
  };

export const CASHIER_STATUS_DOT_CLASS: Record<CashierCalendarStatus, string> = {
  pending: "bg-kit-secondary",
  confirmed: "bg-kit-info",
  waiting: "bg-kit-warning",
  "in-progress": "bg-kit-alt",
  completed: "bg-kit-success",
  cancelled: "bg-kit-danger",
};

export const CASHIER_STATUS_LABELS: Record<CashierCalendarStatus, string> = {
  pending: "Chưa xác nhận",
  confirmed: "Đã xác nhận",
  waiting: "Chờ phục vụ",
  "in-progress": "Đang phục vụ",
  completed: "Đã phục vụ",
  cancelled: "Đã hủy",
};

const STATUS_FILTER_ORDER: CashierCalendarStatus[] = [
  "pending",
  "confirmed",
  "waiting",
  "in-progress",
  "completed",
  "cancelled",
];

export function toCalendarStatus(status: number): CashierCalendarStatus {
  if (status === APPOINTMENT_STATUS.CONFIRMED) return "confirmed";
  if (status === APPOINTMENT_STATUS.WAITING || status === APPOINTMENT_STATUS.NO_SHOW) {
    return "waiting";
  }
  if (status === APPOINTMENT_STATUS.IN_SERVICE) return "in-progress";
  if (status === APPOINTMENT_STATUS.COMPLETED) return "completed";
  if (status === APPOINTMENT_STATUS.CANCELLED) return "cancelled";
  return "pending";
}

export function getStatusFilterItems() {
  const items = [];
  for (let index = 0; index < STATUS_FILTER_ORDER.length; index++) {
    const status = STATUS_FILTER_ORDER[index];
    items.push({
      id: status,
      label: CASHIER_STATUS_LABELS[status],
      colorClass: CASHIER_STATUS_DOT_CLASS[status],
      active: true,
    });
  }
  return items;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

export type CashierCalendarView = "day" | "week" | "month";

export function getViewLabel(view: CashierCalendarView): string {
  if (view === "week") {
    return "Tuần";
  }
  if (view === "month") {
    return "Tháng";
  }
  return "Ngày";
}

export function getIsoWeekStart(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  let diff = 1 - day;
  if (day === 0) {
    diff = -6;
  }
  next.setDate(next.getDate() + diff);
  return next;
}

export function getWeekDays(date: Date): Date[] {
  const start = getIsoWeekStart(date);
  const days: Date[] = [];
  for (let index = 0; index < 7; index++) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    days.push(day);
  }
  return days;
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: start, end: end };
}

export function shiftCalendarDate(
  date: Date,
  view: CashierCalendarView,
  direction: -1 | 1,
): Date {
  const next = new Date(date);
  if (view === "week") {
    next.setDate(next.getDate() + direction * 7);
    return next;
  }
  if (view === "month") {
    next.setMonth(next.getMonth() + direction);
    return next;
  }
  next.setDate(next.getDate() + direction);
  return next;
}

export function timeToMins(timeValue: string): number {
  const parts = timeValue.trim().split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return 0;
  }
  return hour * 60 + minute;
}

export function minsToTime(totalMins: number): string {
  const hour = Math.floor(totalMins / 60);
  const minute = totalMins % 60;
  const hourText = String(hour).padStart(2, "0");
  const minuteText = String(minute).padStart(2, "0");
  return hourText + ":" + minuteText;
}

export const DEFAULT_SLOT_START_MINS = 8 * 60;
export const DEFAULT_SLOT_END_MINS = 22 * 60;
export const DEFAULT_SLOT_STEP_MINS = 30;
export const SLOT_ROW_HEIGHT_PX = 56;

export const SLOT_START_HOUR = 8;
export const SLOT_END_HOUR = 22;
export const SLOT_STEP_MINS = DEFAULT_SLOT_STEP_MINS;

export type CashierSlotConfig = {
  startMins: number;
  endMins: number;
  stepMins: number;
};

export function resolveCashierSlotConfig(input?: {
  startTime?: string | null;
  endTime?: string | null;
  slotMinutes?: number | null;
} | null): CashierSlotConfig {
  let startMins = DEFAULT_SLOT_START_MINS;
  let endMins = DEFAULT_SLOT_END_MINS;
  let stepMins = DEFAULT_SLOT_STEP_MINS;

  if (input?.startTime) {
    const parsedStart = timeToMins(input.startTime);
    if (!Number.isNaN(parsedStart)) {
      startMins = parsedStart;
    }
  }

  if (input?.endTime) {
    const parsedEnd = timeToMins(input.endTime);
    if (!Number.isNaN(parsedEnd)) {
      endMins = parsedEnd;
    }
  }

  if (typeof input?.slotMinutes === "number" && input.slotMinutes > 0) {
    stepMins = input.slotMinutes;
  }

  if (endMins <= startMins) {
    startMins = DEFAULT_SLOT_START_MINS;
    endMins = DEFAULT_SLOT_END_MINS;
  }

  return {
    startMins: startMins,
    endMins: endMins,
    stepMins: stepMins,
  };
}

export function buildDayTimeSlots(config?: CashierSlotConfig | null): string[] {
  const resolved = config ?? {
    startMins: DEFAULT_SLOT_START_MINS,
    endMins: DEFAULT_SLOT_END_MINS,
    stepMins: DEFAULT_SLOT_STEP_MINS,
  };
  const slots: string[] = [];
  for (
    let mins = resolved.startMins;
    mins < resolved.endMins;
    mins = mins + resolved.stepMins
  ) {
    slots.push(minsToTime(mins));
  }
  return slots;
}

export function floorToSlot(
  timeValue: string,
  stepMins: number = DEFAULT_SLOT_STEP_MINS,
): string {
  const mins = timeToMins(timeValue);
  const floored = Math.floor(mins / stepMins) * stepMins;
  return minsToTime(floored);
}

export function getBookingDurationMins(
  booking: CashierBooking,
  stepMins: number = DEFAULT_SLOT_STEP_MINS,
): number {
  const startMins = timeToMins(booking.startTime);
  const endMins = timeToMins(booking.endTime);
  const duration = endMins - startMins;
  if (duration <= 0) {
    return stepMins;
  }
  return duration;
}

export function getBookingSlotCount(
  booking: CashierBooking,
  stepMins: number = DEFAULT_SLOT_STEP_MINS,
): number {
  const duration = getBookingDurationMins(booking, stepMins);
  const slotCount = duration / stepMins;
  if (slotCount < 1) {
    return 1;
  }
  return slotCount;
}

export function getBookingContentLines(durationMins: number): 1 | 2 | 3 {
  if (durationMins < 30) {
    return 1;
  }
  if (durationMins < 60) {
    return 2;
  }
  return 3;
}

export type DaySlotBookingLayout = {
  primary: CashierBooking;
  hidden: CashierBooking[];
};

function isCancelledCalendarBooking(booking: CashierBooking): boolean {
  return toCalendarStatus(booking.status) === "cancelled";
}

function getBookingEndMins(booking: CashierBooking): number {
  const startMins = timeToMins(booking.startTime);
  const endMins = timeToMins(booking.endTime);
  if (endMins <= startMins) {
    return startMins + DEFAULT_SLOT_STEP_MINS;
  }
  return endMins;
}

export function splitPrimaryAndHiddenBookings(
  bookings: CashierBooking[],
): { primary: CashierBooking | null; hidden: CashierBooking[] } {
  if (bookings.length === 0) {
    return { primary: null, hidden: [] };
  }

  let primary = bookings[0];
  for (let index = 1; index < bookings.length; index++) {
    const booking = bookings[index];
    const primaryCancelled = isCancelledCalendarBooking(primary);
    const bookingCancelled = isCancelledCalendarBooking(booking);
    if (primaryCancelled && !bookingCancelled) {
      primary = booking;
      continue;
    }
    if (!primaryCancelled && bookingCancelled) {
      continue;
    }
    if (timeToMins(booking.startTime) < timeToMins(primary.startTime)) {
      primary = booking;
    }
  }

  const hidden: CashierBooking[] = [];
  for (let index = 0; index < bookings.length; index++) {
    if (bookings[index].id === primary.id) {
      continue;
    }
    hidden.push(bookings[index]);
  }

  return { primary: primary, hidden: hidden };
}

export function groupOverlappingBookings(
  bookings: CashierBooking[],
): CashierBooking[][] {
  if (bookings.length === 0) {
    return [];
  }

  const sorted: CashierBooking[] = [];
  for (let index = 0; index < bookings.length; index++) {
    sorted.push(bookings[index]);
  }
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (timeToMins(sorted[j].startTime) < timeToMins(sorted[i].startTime)) {
        const temp = sorted[i];
        sorted[i] = sorted[j];
        sorted[j] = temp;
      }
    }
  }

  const groups: CashierBooking[][] = [];
  let current: CashierBooking[] = [sorted[0]];
  let currentEnd = getBookingEndMins(sorted[0]);

  for (let index = 1; index < sorted.length; index++) {
    const booking = sorted[index];
    const startMins = timeToMins(booking.startTime);
    const endMins = getBookingEndMins(booking);
    if (startMins < currentEnd) {
      current.push(booking);
      if (endMins > currentEnd) {
        currentEnd = endMins;
      }
    } else {
      groups.push(current);
      current = [booking];
      currentEnd = endMins;
    }
  }
  groups.push(current);
  return groups;
}

export function buildDayStaffSlotLayout(
  dayBookings: CashierBooking[],
  staffId: string,
  activeStatusIds: string[],
  stepMins: number = DEFAULT_SLOT_STEP_MINS,
): Record<string, DaySlotBookingLayout> {
  const staffBookings: CashierBooking[] = [];
  for (let index = 0; index < dayBookings.length; index++) {
    const booking = dayBookings[index];
    if (String(booking.staffId) !== staffId) {
      continue;
    }
    const calendarStatus = toCalendarStatus(booking.status);
    if (activeStatusIds.indexOf(calendarStatus) < 0) {
      continue;
    }
    staffBookings.push(booking);
  }

  const groups = groupOverlappingBookings(staffBookings);
  const layout: Record<string, DaySlotBookingLayout> = {};

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const split = splitPrimaryAndHiddenBookings(groups[groupIndex]);
    if (!split.primary) {
      continue;
    }
    const slotTime = floorToSlot(split.primary.startTime, stepMins);
    const existing = layout[slotTime];
    if (!existing) {
      layout[slotTime] = {
        primary: split.primary,
        hidden: split.hidden,
      };
      continue;
    }

    const merged: CashierBooking[] = [existing.primary];
    for (let h = 0; h < existing.hidden.length; h++) {
      merged.push(existing.hidden[h]);
    }
    merged.push(split.primary);
    for (let h = 0; h < split.hidden.length; h++) {
      merged.push(split.hidden[h]);
    }
    const mergedSplit = splitPrimaryAndHiddenBookings(merged);
    if (!mergedSplit.primary) {
      continue;
    }
    layout[slotTime] = {
      primary: mergedSplit.primary,
      hidden: mergedSplit.hidden,
    };
  }

  return layout;
}

export function getBookingsForSlot(
  bookings: CashierBooking[],
  staffId: string,
  slotTime: string,
  activeStatusIds: string[],
  stepMins: number = DEFAULT_SLOT_STEP_MINS,
): CashierBooking[] {
  const result: CashierBooking[] = [];
  for (let index = 0; index < bookings.length; index++) {
    const booking = bookings[index];
    if (String(booking.staffId) !== staffId) {
      continue;
    }
    const calendarStatus = toCalendarStatus(booking.status);
    if (activeStatusIds.indexOf(calendarStatus) < 0) {
      continue;
    }
    if (floorToSlot(booking.startTime, stepMins) !== slotTime) {
      continue;
    }
    result.push(booking);
  }
  return result;
}

export function getBookingsForDaySlot(
  bookings: CashierBooking[],
  date: Date,
  slotTime: string,
  activeStatusIds: string[],
  stepMins: number = DEFAULT_SLOT_STEP_MINS,
): CashierBooking[] {
  const result: CashierBooking[] = [];
  const dateKey = toDateKey(date);
  for (let index = 0; index < bookings.length; index++) {
    const booking = bookings[index];
    if (booking.bookingDate !== dateKey) {
      continue;
    }
    const calendarStatus = toCalendarStatus(booking.status);
    if (activeStatusIds.indexOf(calendarStatus) < 0) {
      continue;
    }
    if (floorToSlot(booking.startTime, stepMins) !== slotTime) {
      continue;
    }
    result.push(booking);
  }
  return result;
}

export function getBookingsCountOnDay(
  bookings: CashierBooking[],
  date: Date,
  activeStatusIds: string[],
): number {
  let count = 0;
  const dateKey = toDateKey(date);
  for (let index = 0; index < bookings.length; index++) {
    const booking = bookings[index];
    if (booking.bookingDate !== dateKey) {
      continue;
    }
    const calendarStatus = toCalendarStatus(booking.status);
    if (activeStatusIds.indexOf(calendarStatus) < 0) {
      continue;
    }
    count = count + 1;
  }
  return count;
}

export function getFilteredBookingsForDay(
  bookings: CashierBooking[],
  date: Date,
  activeStatusIds: string[],
): CashierBooking[] {
  const result: CashierBooking[] = [];
  const dateKey = toDateKey(date);
  for (let index = 0; index < bookings.length; index++) {
    const booking = bookings[index];
    if (booking.bookingDate !== dateKey) {
      continue;
    }
    const calendarStatus = toCalendarStatus(booking.status);
    if (activeStatusIds.indexOf(calendarStatus) < 0) {
      continue;
    }
    result.push(booking);
  }

  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      if (timeToMins(result[j].startTime) < timeToMins(result[i].startTime)) {
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
      }
    }
  }
  return result;
}

export function getBookingsForStaffDay(
  bookings: CashierBooking[],
  staffId: string,
  date: Date,
  activeStatusIds: string[],
): CashierBooking[] {
  const dayBookings = getFilteredBookingsForDay(bookings, date, activeStatusIds);
  const result: CashierBooking[] = [];
  for (let index = 0; index < dayBookings.length; index++) {
    if (String(dayBookings[index].staffId) !== staffId) {
      continue;
    }
    result.push(dayBookings[index]);
  }
  return result;
}

export function isSameDateKey(date: Date, dateKey?: string | null): boolean {
  if (!dateKey) {
    return true;
  }
  return dateKey === toDateKey(date);
}

export function formatDayTitle(date: Date): string {
  const weekday = date.toLocaleDateString("vi-VN", { weekday: "long" });
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const weekdayLabel = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return weekdayLabel + ", " + day + "/" + month + "/" + year;
}

export function formatWeekTitle(date: Date): string {
  const days = getWeekDays(date);
  const start = days[0];
  const end = days[6];
  const startText =
    String(start.getDate()).padStart(2, "0") +
    "/" +
    String(start.getMonth() + 1).padStart(2, "0");
  const endText =
    String(end.getDate()).padStart(2, "0") +
    "/" +
    String(end.getMonth() + 1).padStart(2, "0") +
    "/" +
    end.getFullYear();
  return "Tuần " + startText + " – " + endText;
}

export function formatMonthTitle(date: Date): string {
  return "Tháng " + (date.getMonth() + 1) + " năm " + date.getFullYear();
}

export function formatCalendarTitle(
  date: Date,
  view: CashierCalendarView,
): string {
  if (view === "week") {
    return formatWeekTitle(date);
  }
  if (view === "month") {
    return formatMonthTitle(date);
  }
  return formatDayTitle(date);
}

export function getMonthGridDays(anchorDate: Date): Date[] {
  const firstOfMonth = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    1,
  );
  const start = getIsoWeekStart(firstOfMonth);
  const days: Date[] = [];
  const cursor = new Date(start);

  for (let index = 0; index < 42; index++) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function isSameDay(a: Date, b: Date): boolean {
  if (a.getFullYear() !== b.getFullYear()) {
    return false;
  }
  if (a.getMonth() !== b.getMonth()) {
    return false;
  }
  if (a.getDate() !== b.getDate()) {
    return false;
  }
  return true;
}

export function getActiveStatusIds(
  filters: { id: string; active: boolean }[],
): string[] {
  const ids: string[] = [];
  for (let index = 0; index < filters.length; index++) {
    if (filters[index].active) {
      ids.push(filters[index].id);
    }
  }
  return ids;
}

export function getDayBookings(
  bookings: CashierBooking[],
  date: Date,
): CashierBooking[] {
  const result: CashierBooking[] = [];
  for (let index = 0; index < bookings.length; index++) {
    const booking = bookings[index];
    if (isSameDateKey(date, booking.bookingDate)) {
      result.push(booking);
    }
  }
  return result;
}
