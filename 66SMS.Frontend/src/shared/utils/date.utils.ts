// Tiện ích xử lý ngày giờ — dùng thay vì dayjs hay moment.
//
// Ví dụ:
//   DateUtil.format(new Date(), 'DD/MM/YYYY')   → "18/06/2026"
//   DateUtil.startOf(new Date(), 'week')         → thứ Hai đầu tuần
//   DateUtil.add(new Date(), 1, 'day')           → ngày mai
export class DateUtil {
  private date: Date;

  constructor(date?: Date | string | number | DateUtil) {
    if (date instanceof DateUtil) {
      this.date = new Date(date.toDate());
    } else if (date) {
      this.date = new Date(date);
    } else {
      this.date = new Date();
    }
  }

  format(fmt: string) {
    const yyyy = this.date.getFullYear().toString();
    const mm = (this.date.getMonth() + 1).toString().padStart(2, "0");
    const dd = this.date.getDate().toString().padStart(2, "0");

    return fmt.replace("YYYY", yyyy).replace("MM", mm).replace("DD", dd);
  }

  startOf(unit: "day" | "isoWeek") {
    const d = new Date(this.date);
    if (unit === "day") {
      d.setHours(0, 0, 0, 0);
    } else if (unit === "isoWeek") {
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
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
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  toDate() {
    return this.date;
  }
}

export function formatDate(date?: Date | string | number | DateUtil) {
  return new DateUtil(date);
}
