// Dùng khi user bấm Đặt lịch từ trang dịch vụ (landing).
// Ghi serviceId vào sessionStorage, sang /booking thì ServiceStep tự tick.
// Dùng sessionStorage vì chỉ cần giữ trong tab hiện tại, đóng tab là hết.
// Nếu đổi STORAGE_KEY, nhớ sửa cả chỗ set lẫn get/clear.

const STORAGE_KEY = "pending-booking-service";

export function setPendingServiceId(id: number): void {
  sessionStorage.setItem(STORAGE_KEY, String(id));
}

export function getPendingServiceId(): number | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

export function clearPendingServiceId(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
