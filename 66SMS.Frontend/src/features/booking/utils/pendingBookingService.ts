const STORAGE_KEY = "pending-booking-service";

export function setPendingServiceId(id: number): void {
  sessionStorage.setItem(STORAGE_KEY, String(id));
}

export function getPendingServiceId(): number | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function clearPendingServiceId(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
