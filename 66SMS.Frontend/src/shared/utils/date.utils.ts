// ============================================================================
// date.utils — quy ước timezone
// ============================================================================
//   BE UTC  →  FE LOCAL   : toLocalDateOnly / toLocalTimeOnly / formatDateTimeDisplay
//   FE LOCAL →  BE UTC    : localDateTimeToUtc
//   DateOnly (yyyy-MM-dd) : ngày lịch, KHÔNG đổi timezone
// ============================================================================

const LOCALE = "vi-VN";
const EMPTY = "—";

/** Chuỗi chỉ có ngày lịch (DateOnly) */
function isDateOnlyString(val: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(val.trim());
}

/** Parse yyyy-MM-dd → Date local (tránh lệch ngày vì UTC) */
function parseDateOnlyLocal(val: string): Date | null {
  const [y, m, d] = val.trim().split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parse từ API → Date (local khi đọc getHours/getDate).
 * - DateOnly "yyyy-MM-dd" → ngày local
 * - ISO có Z / offset → JS đổi sang local
 * - ISO không timezone → coi là UTC (thêm Z)
 */
function parseFromApi(val?: string | null): Date | null {
  if (!val) return null;
  let s = val.trim();

  if (isDateOnlyString(s)) {
    return parseDateOnlyLocal(s);
  }

  // ISO datetime không có timezone → UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) {
    s = `${s}Z`;
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d;

  // DD/MM/YYYY
  if (s.includes("/") && s.length === 10) {
    const [day, month, year] = s.split("/");
    return parseDateOnlyLocal(`${year}-${month}-${day}`);
  }

  return null;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toHm(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ============================================================================
// BE UTC → FE LOCAL
// ============================================================================

/** UTC DateTimeOffset → ngày local `yyyy-MM-dd` (DateOnly phía client) */
export function toLocalDateOnly(val?: string | null): string {
  const d = parseFromApi(val);
  return d ? toYmd(d) : "";
}

/** UTC DateTimeOffset → giờ local `HH:mm` (TimeOnly phía client) */
export function toLocalTimeOnly(val?: string | null): string {
  const d = parseFromApi(val);
  return d ? toHm(d) : "";
}

/** UTC DateTimeOffset → hiển thị `DD/MM/YYYY, HH:mm` (local) */
export function formatDateTimeDisplay(
  val?: string | null,
  fallback = EMPTY,
): string {
  const d = parseFromApi(val);
  if (!d) return val || fallback;
  return d.toLocaleString(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * UTC DateTimeOffset → value cho input `datetime-local`.
 * Ví dụ: "2026-07-05T08:00:00Z" → "2026-07-05T15:00" (VN UTC+7)
 */
export function toDatetimeLocalInput(val?: string | null): string {
  const d = parseFromApi(val);
  return d ? `${toYmd(d)}T${toHm(d)}` : "";
}

/**
 * DateOnly / ngày → hiển thị `DD/MM/YYYY` (không đổi timezone).
 * Nếu truyền DateTimeOffset thì lấy phần ngày local.
 */
export function formatDisplayDate(val?: string | null): string {
  const d = parseFromApi(val);
  if (!d) return val ? val : "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Alias: gán vào input type="date" (= toLocalDateOnly) */
export function parseToDateInput(val?: string | null): string {
  return toLocalDateOnly(val);
}

// ============================================================================
// FE LOCAL → BE UTC
// ============================================================================

/**
 * Giá trị local từ form → ISO UTC gửi backend.
 *
 *   localDateTimeToUtc("2026-07-05T15:00")           → "...Z"
 *   localDateTimeToUtc("2026-07-05", "15:00")        → "...Z"
 *   localDateTimeToUtc("2026-07-05")                 → nửa đêm local → UTC
 */
export function localDateTimeToUtc(
  localDateTime?: string | null,
  localTime?: string | null,
): string {
  if (!localDateTime) return "";

  let local = localDateTime.trim();

  if (localTime && isDateOnlyString(local)) {
    local = `${local}T${localTime.trim()}`;
  }

  if (isDateOnlyString(local)) {
    local = `${local}T00:00`;
  }

  const parsed = new Date(local);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

// ============================================================================
// Calendar helpers (lịch / ca làm — KHÔNG phải convert timezone)
// Dùng bởi schedules, attendance, shifts...
// ============================================================================

type DateInput = Date | string | number | DateUtil;

export class DateUtil {
  private date: Date;

  constructor(input?: DateInput) {
    if (input instanceof DateUtil) {
      this.date = new Date(input.toDate());
    } else if (input) {
      // DateOnly / ISO từ API: dùng parseFromApi để không lệch ngày
      if (typeof input === "string") {
        this.date = parseFromApi(input) ?? new Date(input);
      } else {
        this.date = new Date(input);
      }
    } else {
      this.date = new Date();
    }
  }

  format(fmt: string) {
    const yyyy = this.date.getFullYear().toString();
    const mm = pad(this.date.getMonth() + 1);
    const dd = pad(this.date.getDate());
    const hh = pad(this.date.getHours());
    const min = pad(this.date.getMinutes());
    return fmt
      .replace("YYYY", yyyy)
      .replace("MM", mm)
      .replace("DD", dd)
      .replace("HH", hh)
      .replace("mm", min);
  }

  startOf(unit: "day" | "isoWeek") {
    const d = new Date(this.date);
    if (unit === "day") {
      d.setHours(0, 0, 0, 0);
    } else {
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
    }
    return new DateUtil(d);
  }

  endOf(unit: "isoWeek") {
    const d = this.startOf(unit).toDate();
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return new DateUtil(d);
  }

  add(amount: number, unit: "day" | "week") {
    const d = new Date(this.date);
    if (unit === "day") d.setDate(d.getDate() + amount);
    else d.setDate(d.getDate() + amount * 7);
    return new DateUtil(d);
  }

  subtract(amount: number, unit: "day" | "week") {
    return this.add(-amount, unit);
  }

  day() {
    return this.date.getDay();
  }

  isBefore(other: DateUtil) {
    return this.date.getTime() < other.toDate().getTime();
  }

  isoWeek() {
    const target = new Date(this.date.valueOf());
    const dayNr = (this.date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  toDate() {
    return this.date;
  }
}

/** Tạo DateUtil — tính toán tuần/ngày (lịch, ca), không dùng để convert timezone */
export function formatDate(input?: DateInput) {
  return new DateUtil(input);
}
