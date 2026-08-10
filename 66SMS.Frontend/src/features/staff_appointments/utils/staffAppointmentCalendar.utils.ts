import { BookingStatus, BOOKING_STATUS_LABELS } from "../types";
export const STATUS_EVENT_COLORS: Record<number, string> = {
  [BookingStatus.Pending]: "#7a828c",
  [BookingStatus.Confirmed]: "#2563eb",
  [BookingStatus.Waiting]: "#b45309",
  [BookingStatus.InService]: "#0ea5e9",
  [BookingStatus.Completed]: "#2f6b4f",
  [BookingStatus.Cancelled]: "#b23a3a",
  [BookingStatus.NoShow]: "#9b2c2c",
};

export const STATUS_CALENDAR_ITEMS = [
  BookingStatus.Pending,
  BookingStatus.Confirmed,
  BookingStatus.Waiting,
  BookingStatus.InService,
  BookingStatus.Completed,
  BookingStatus.Cancelled,
  BookingStatus.NoShow,
].map((status: number) => ({
  id: String(status),
  label: BOOKING_STATUS_LABELS[status] ?? `Trạng thái #${status}`,
  color: STATUS_EVENT_COLORS[status],
  active: true,
}));

export function combineDateAndTime(
  dateKey: string,
  timeValue: string | null | undefined,
): Date {
  const timeText = (timeValue ?? "00:00").trim();
  const timeParts = timeText.split(":");
  const hour = Number(timeParts[0] ?? 0);
  const minute = Number(timeParts[1] ?? 0);
  const date = new Date(`${dateKey}T00:00:00`);
  date.setHours(
    Number.isNaN(hour) ? 0 : hour,
    Number.isNaN(minute) ? 0 : minute,
    0,
    0,
  );
  return date;
}

export function getIsoWeekStart(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

export function getMonthWeekStarts(anchorDate: Date): Date[] {
  const firstOfMonth = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    1,
  );
  let weekStart = getIsoWeekStart(firstOfMonth);
  const weeks: Date[] = [];

  for (let index = 0; index < 6; index += 1) {
    weeks.push(new Date(weekStart));
    weekStart = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() + 7);
  }

  return weeks;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
