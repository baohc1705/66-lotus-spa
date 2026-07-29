export const BookingStatus = {
  Pending: 1,
  Confirmed: 2,
  Waiting: 3,
  InService: 4,
  Completed: 5,
  Cancelled: 6,
  NoShow: 9,
} as const;

export type BookingStatusValue = (typeof BookingStatus)[keyof typeof BookingStatus];
export const BOOKING_STATUS_LABELS: Record<number, string> = {
  [BookingStatus.Pending]: "Chờ xác nhận",
  [BookingStatus.Confirmed]: "Chờ cọc",
  [BookingStatus.Waiting]: "Chờ phục vụ",
  [BookingStatus.InService]: "Đang phục vụ",
  [BookingStatus.Completed]: "Đã hoàn thành",
  [BookingStatus.Cancelled]: "Đã hủy",
  [BookingStatus.NoShow]: "Không đến",
};

export interface StaffScheduleBooking {
  id: string;
  appointmentCode?: string | null;
  customerName: string;
  customerPhone?: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: number;
  paidAmount?: number;
  totalAmount: number;
  note?: string;
  positionName?: string | null;
  completedAt?: string | null;
}

export interface StaffScheduleDailyDto {
  date: string;
  staffName?: string;
  bookings: StaffScheduleBooking[];
}

export interface StaffScheduleDayDto {
  date: string;
  bookings: StaffScheduleBooking[];
}

export interface StaffScheduleWeeklyDto {
  weekStart: string;
  weekEnd: string;
  days: StaffScheduleDayDto[];
}

export type ScheduleViewMode = "day" | "week";
