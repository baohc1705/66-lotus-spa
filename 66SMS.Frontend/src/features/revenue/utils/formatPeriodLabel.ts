import { formatDisplayDate } from "@/shared/utils/date.utils";

/** Format PeriodKey từ API sang chữ dễ đọc (VD: 2026-07-30 → 30/07/2026). */
export function formatPeriodLabel(periodKey: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(periodKey)) {
    return formatDisplayDate(periodKey);
  }

  if (/^\d{4}-\d{2}$/.test(periodKey)) {
    const [year, month] = periodKey.split("-");
    return `${month}/${year}`;
  }

  if (/^\d{4}-W\d{1,2}$/i.test(periodKey)) {
    const [year, week] = periodKey.split(/-W/i);
    return `Tuần ${week}/${year}`;
  }

  if (/^\d{4}-Q\d$/i.test(periodKey)) {
    const [year, quarter] = periodKey.split(/-Q/i);
    return `Quý ${quarter}/${year}`;
  }

  return periodKey;
}
