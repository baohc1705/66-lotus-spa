import type { PayrollStatsViewMode } from "../types/payroll.types";

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getIsoWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getRangeForView(
  viewMode: PayrollStatsViewMode,
  anchorDate: Date,
): { from: string; to: string } {
  if (viewMode === "day") {
    const key = toDateKey(anchorDate);
    return { from: key, to: key };
  }

  if (viewMode === "week") {
    const start = getIsoWeekStart(anchorDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { from: toDateKey(start), to: toDateKey(end) };
  }

  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  return { from: toDateKey(start), to: toDateKey(end) };
}

export function formatSlotTime(value: string | null | undefined): string {
  if (!value) return "--:--";
  return value.slice(0, 5);
}

export function resolveServiceEndTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  durationMins: number | null | undefined,
): string {
  const start = formatSlotTime(startTime);
  if (start === "--:--") return formatSlotTime(endTime);

  const mins = durationMins && durationMins > 0 ? durationMins : 0;
  if (mins > 0) {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + mins;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;
    return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
  }

  return formatSlotTime(endTime);
}

export function appointmentKey(
  appointmentId: number | null | undefined,
  invoiceId: number | null | undefined,
): string {
  if (appointmentId) return `ap-${appointmentId}`;
  return `inv-${invoiceId ?? 0}`;
}
