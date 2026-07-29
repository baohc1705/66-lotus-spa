export const APPOINTMENT_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  WAITING: 3,
  IN_SERVICE: 4,
  COMPLETED: 5,
  CANCELLED: 6,
  NO_SHOW: 9,
} as const;
  
export const APPOINTMENT_STATUS_LABELS: Record<number, string> = {
  [APPOINTMENT_STATUS.PENDING]: "Chờ xác nhận",
  [APPOINTMENT_STATUS.CONFIRMED]: "Chờ cọc",
  [APPOINTMENT_STATUS.WAITING]: "Chờ phục vụ",
  [APPOINTMENT_STATUS.IN_SERVICE]: "Đang phục vụ",
  [APPOINTMENT_STATUS.COMPLETED]: "Đã hoàn thành",
  [APPOINTMENT_STATUS.CANCELLED]: "Đã hủy",
  [APPOINTMENT_STATUS.NO_SHOW]: "Không đến",
};

export const APPOINTMENT_STATUS_DOT_CLASS: Record<number, string> = {
  [APPOINTMENT_STATUS.PENDING]: "bg-status-pending",
  [APPOINTMENT_STATUS.CONFIRMED]: "bg-status-confirmed",
  [APPOINTMENT_STATUS.WAITING]: "bg-status-waiting",
  [APPOINTMENT_STATUS.IN_SERVICE]: "bg-status-in-progress",
  [APPOINTMENT_STATUS.COMPLETED]: "bg-status-completed",
  [APPOINTMENT_STATUS.CANCELLED]: "bg-status-cancelled",
  [APPOINTMENT_STATUS.NO_SHOW]: "bg-status-cancelled",
};
