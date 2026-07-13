// Tiện ích ngày giờ thống nhất cho toàn hệ thống.
//
// Hiển thị (từ API / string):
//   formatDisplayDate("2026-07-05")     → "05/07/2026"
//   formatDateTimeDisplay("2026-07-05") → "05/07/2026, 15:07"
//   parseToDateInput("05/07/2026")      → "2026-07-05"  (cho input type="date")
//
// Tính toán (lịch, ca làm...):
//   formatDate().format("DD/MM/YYYY")
//   formatDate().startOf("isoWeek").add(1, "week")

const LOCALE = "vi-VN";
const EMPTY_DATE = "—";

type DateInput = Date | string | number | DateUtil;

export class DateUtil {
  private date: Date;

  constructor(input?: DateInput) {
    if (input instanceof DateUtil) {
      this.date = new Date(input.toDate());
    } else if (input) {
      this.date = new Date(input);
    } else {
      this.date = new Date();
    }
  }

  /** Parse string từ API → DateUtil. Không parse được → null */
  static fromApi(val?: string | null): DateUtil | null {
    if (!val) return null;

    let normalized = val.trim();
    const isIsoUtcNoTz =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(normalized);
    if (isIsoUtcNoTz) {
      normalized = `${normalized}Z`;
    }

    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return new DateUtil(parsed);
    }

    // DD/MM/YYYY
    if (val.includes("/") && val.length === 10) {
      const [day, month, year] = val.split("/");
      const d = new Date(`${year}-${month}-${day}`);
      return Number.isNaN(d.getTime()) ? null : new DateUtil(d);
    }

    // yyyy-MM-dd hoặc yyyy-MM-ddTHH:mm:ss
    if (val.length >= 10 && val[4] === "-") {
      const d = new Date(val.substring(0, 10));
      return Number.isNaN(d.getTime()) ? null : new DateUtil(d);
    }

    return null;
  }

  format(fmt: string) {
    const yyyy = this.date.getFullYear().toString();
    const mm = (this.date.getMonth() + 1).toString().padStart(2, "0");
    const dd = this.date.getDate().toString().padStart(2, "0");
    const hh = this.date.getHours().toString().padStart(2, "0");
    const min = this.date.getMinutes().toString().padStart(2, "0");

    return fmt
      .replace("YYYY", yyyy)
      .replace("MM", mm)
      .replace("DD", dd)
      .replace("HH", hh)
      .replace("mm", min);
  }

  /** DD/MM/YYYY */
  toDisplayDate(): string {
    if (Number.isNaN(this.date.getTime())) return "";
    return this.format("DD/MM/YYYY");
  }

  /** DD/MM/YYYY, HH:mm */
  toDisplayDateTime(): string {
    if (Number.isNaN(this.date.getTime())) return EMPTY_DATE;
    return this.date.toLocaleString(LOCALE, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  startOf(unit: "day" | "isoWeek") {
    const d = new Date(this.date);
    if (unit === "day") {
      d.setHours(0, 0, 0, 0);
    } else if (unit === "isoWeek") {
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
    if (unit === "day") {
      d.setDate(d.getDate() + amount);
    } else if (unit === "week") {
      d.setDate(d.getDate() + amount * 7);
    }
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

/** Tạo DateUtil — dùng cho tính toán ngày (lịch, ca...) */
export function formatDate(input?: DateInput) {
  return new DateUtil(input);
}

/** Hiển thị ngày: DD/MM/YYYY. Rỗng → "" */
export function formatDisplayDate(val?: string | null): string {
  if (!val) return "";
  const d = DateUtil.fromApi(val);
  if (d) return d.toDisplayDate();
  return val;
}

/** Hiển thị ngày giờ từ API. Rỗng → "—" */
export function formatDateTimeDisplay(
  val?: string | null,
  fallback = EMPTY_DATE,
): string {
  if (!val) return fallback;
  const d = DateUtil.fromApi(val);
  const out = d ? d.toDisplayDateTime() : val || fallback;
  return out;
}

/** Chuyển sang yyyy-MM-dd cho input type="date" */
export function parseToDateInput(val?: string | null): string {
  if (!val) return "";
  const d = DateUtil.fromApi(val);
  if (d) return d.format("YYYY-MM-DD");
  return val.substring(0, 10);
}
