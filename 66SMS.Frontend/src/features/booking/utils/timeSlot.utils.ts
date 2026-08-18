import type { TimeSlotDTO } from "../types/booking.types";

// "09:30" -> 570 phút tính từ 00:00. Sai format thì trả null.
function timeToMinutes(time: string): number | null {
  const parts = time.trim().split(":").map(Number);
  if (parts.length < 2) return null;
  if (Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
}

// Date local -> "YYYY-MM-DD". Không dùng toISOString vì lệch timezone.
function toYmdLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Ẩn khung giờ đã qua nếu đang chọn hôm nay.
// Ngày tương lai: giữ hết. Ngày quá khứ: trả [].
// Nếu bỏ hàm này, user có thể chọn giờ trong quá khứ rồi fail lúc lock.
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
  const result: TimeSlotDTO[] = [];

  for (let index = 0; index < slots.length; index++) {
    const slot = slots[index];
    const slotMins = timeToMinutes(slot.time);
    if (slotMins == null) continue;
    if (slotMins <= nowMins) continue;
    result.push(slot);
  }

  return result;
}
