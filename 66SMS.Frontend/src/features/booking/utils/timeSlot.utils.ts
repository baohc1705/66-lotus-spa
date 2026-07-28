import type { TimeSlotDTO } from "../types/booking.types";

/** Parse "HH:mm" hoặc "HH:mm:ss" → phút từ 00:00 */
function timeToMinutes(time: string): number | null {
  const parts = time.trim().split(":").map(Number);
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
  const [h, m] = parts;
  return h * 60 + m;
}

function toYmdLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Chỉ giữ khung giờ sau thời điểm hiện tại khi chọn ngày hôm nay.
 * Ngày tương lai: giữ tất cả. Ngày quá khứ: ẩn hết.
 */
export function filterSlotsAfterNow(
  slots: TimeSlotDTO[],
  appointmentDate: string | null | undefined,
  now: Date = new Date(),
): TimeSlotDTO[] {
  if (!appointmentDate || slots.length === 0) return slots;

  const today = toYmdLocal(now);
  if (appointmentDate > today) return slots;
  if (appointmentDate < today) return [];

  const nowMins = now.getHours() * 60 + now.getMinutes();
  return slots.filter((slot: TimeSlotDTO) => {
    const slotMins = timeToMinutes(slot.time);
    if (slotMins == null) return false;
    return slotMins > nowMins;
  });
}
