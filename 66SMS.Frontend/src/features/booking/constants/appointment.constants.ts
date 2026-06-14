export const APPOINTMENT_STATUS = {
  PENDING: 1,      // Chờ xác nhận
  CONFIRMED: 2,    // Đã xác nhận (Chờ khách đặt cọc)
  WAITING: 3,      // Chờ phục vụ (Đã cọc xong)
  IN_SERVICE: 4,   // Đang phục vụ
  COMPLETED: 5,    // Hoàn thành
  CANCELLED: 6,    // Đã hủy/Hoãn
  NO_SHOW: 9       // Không đến
} as const;
