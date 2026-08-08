namespace _66SMS.Domain.Constants
{
    public class AppointmentConst
    {
        #region Database
        public const string TABLE_NAME = "appointments";
        public const string FIELD_ID = "id";
        public const string FIELD_APPOINTMENT_CODE = "appointment_code";
        //public const string FIELD_CUSTOMER_ID = "customer_id";
        public const string FIELD_SALON_ID = "salon_id";
        public const string FIELD_CREATED_BY_USER_ID = "created_by_user_id";
        public const string FIELD_STAFF_ID = "staff_id";
        public const string FIELD_SLOT_ID = "slot_id";
        public const string FIELD_POSITION_ID = "position_id";
        public const string FIELD_LOCK_ID = "lock_id";
        public const string FIELD_SCHEDULE_ID = "schedule_id";
        public const string FIELD_APPOINTMENT_DATE = "appointment_date";
        public const string FIELD_TIME_APPT_START = "time_appt_start";
        public const string FIELD_TIME_APPT_END = "time_appt_end";
        public const string FIELD_SOURCE = "source";
        public const string FIELD_STATUS = "status";
        public const string FIELD_NOTE = "note";
        public const string FIELD_TOTAL_AMOUNT = "total_amount";
        public const string FIELD_PAID_AMOUNT = "paid_amount";
        public const string FIELD_DEPOSIT_PERCENT = "deposit_percent";
        public const string FIELD_DEPOSIT_DEADLINE_AT = "deposit_deadline_at";
        public const string FIELD_DEPOSIT_REQUESTED_AT = "deposit_requested_at";
        public const string FIELD_CONFIRMED_AT = "confirmed_at";
        public const string FIELD_COMPLETED_AT = "completed_at";
        public const string FIELD_TIME_START_SERVICE = "time_start_service";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";

        public const string SP_GET_STAFF_AVAILABILITY = "dbo.usp_GetStaffAvailability";
        public const string SP_GET_BOOKING_TECHNICIANS = "dbo.usp_GetBookingTechnicians";
        public const string SP_GET_BOOKING_TIME_SLOTS = "dbo.usp_GetBookingTimeSlots";
        public const string SP_RESOLVE_BOOKING_STAFF = "dbo.usp_ResolveBookingStaff";
        public const string SP_GET_CASHIER_STAFF_COLUMNS = "dbo.usp_GetCashierStaffColumns";
        public const string SP_GET_CASHIER_DAILY_BOOKINGS = "dbo.usp_GetCashierDailyBookings";
        #endregion

        #region Constraint
        public const int APPOINTMENT_CODE_MAX_LENGTH = 50;
        public const int NOTE_MAX_LENGTH = 1000;
        #endregion

        #region Status
        public const int STATUS_PENDING = 1;
        public const int STATUS_CONFIRMED = 2;
        public const int STATUS_WAITING = 3;
        public const int STATUS_IN_SERVICE = 4;
        public const int STATUS_COMPLETED = 5;
        public const int STATUS_CANCELLED = 6;
        public const int STATUS_NO_SHOW = 9;
        #endregion

        #region Message
        public const string MSG_APPOINTMENT_ID_NOT_FOUND = $"{nameof(Entities.Appointment)} with id not found";
        public const string MSG_APPOINTMENT_NOT_FOUND = "Lịch hẹn không tồn tại.";
        public const string MSG_APPOINTMENT_ALREADY_THIS_STATUS = "Lịch hẹn đã ở trạng thái này.";
        public const string MSG_APPOINTMENT_ALREADY_CONFIRMED_WAITING_DEPOSIT = "Lịch hẹn đã được xác nhận và đang chờ khách đặt cọc.";
        public const string MSG_APPOINTMENT_ALREADY_PAID = "Lịch hẹn đã được thanh toán.";
        public const string MSG_APPOINTMENT_CANCELLED = "Lịch hẹn này đã bị hủy.";
        public const string MSG_APPOINTMENT_CANNOT_POSTPONE_COMPLETED = "Không thể hoãn/hủy lịch hẹn đã hoàn thành hoặc quá hạn.";
        public const string MSG_APPOINTMENT_POSTPONE_ONLY_PAID_PENDING = "Chỉ cho phép hoãn/hủy nhận lại cọc với lịch hẹn đã thanh toán cọc và đang chờ phục vụ.";
        public const string MSG_APPOINTMENT_SLOT_LOCK_INVALID = "Khóa giữ chỗ không hợp lệ hoặc đã hết thời gian (10 phút). Vui lòng tải lại trang.";
        public const string MSG_APPOINTMENT_SLOT_FULL = "Khung giờ này đã kín lịch hoặc nhân viên bạn chọn không còn trống lịch.";
        public const string MSG_APPOINTMENT_STAFF_NOT_IN_SALON = "Staff không thuộc chi nhánh này.";
        public const string MSG_APPOINTMENT_MIN_ONE_SERVICE = "Phải chọn ít nhất 1 dịch vụ cho mỗi khách.";
        public const string MSG_APPOINTMENT_NOT_WAITING_DEPOSIT = "Lịch hẹn không ở trạng thái chờ đặt cọc.";
        public const string MSG_APPOINTMENT_DEPOSIT_INVALID_AMOUNT = "Số tiền cọc không hợp lệ.";
        public const string MSG_APPOINTMENT_DEPOSIT_ALREADY_PAID = "Lịch hẹn đã được thanh toán cọc.";
        public const string MSG_APPOINTMENT_NOT_DEPOSITED_YET = "Khách chưa đặt cọc. Vui lòng thu cọc trước.";
        public const string MSG_APPOINTMENT_NO_REMAINING_AMOUNT = "Không còn số tiền cần thanh toán.";
        public const string MSG_APPOINTMENT_INVALID_PAYMENT_METHOD = "Phương thức thanh toán không hợp lệ.";
        public const string MSG_APPOINTMENT_UPDATE_STATUS_SUCCESS = "Cập nhật trạng thái thành công.";
        public const string MSG_APPOINTMENT_POSTPONE_REFUND_SUCCESS = "Hoãn lịch và hoàn tiền cọc vào ví thành công.";
        public const string MSG_APPOINTMENT_PAY_DEPOSIT_SUCCESS = "Thanh toán tiền cọc thành công.";
        public const string MSG_APPOINTMENT_PAY_SUCCESS = "Thanh toán thành công.";
        
        public const string MSG_STAFF_AVAILABILITY_SLOT_REQUIRED = "Vui lòng chọn khung giờ.";
        public const string MSG_STAFF_AVAILABILITY_SERVICE_REQUIRED = "Vui lòng chọn dịch vụ.";

        public const string BOOKING_ANY_TECHNICIAN_NAME = "Bất kỳ kỹ thuật viên";
        public const string BOOKING_ANY_TECHNICIAN_ROLE = "Hệ thống tự động chọn người rảnh nhất";
        public const string BOOKING_TECHNICIAN_ROLE = "Kỹ thuật viên";
        public const string BOOKING_ACCOUNT_ROLE_STAFF = "STAFF";
        public const string BOOKING_STATUS_NO_SLOT = "Nghỉ hôm nay";
        public const string BOOKING_STATUS_ONE_SLOT = "Còn 1 slot";
        public const string BOOKING_STATUS_SLOTS_LEFT = "Còn {0} slot";

        public const string MSG_ASSIGN_STAFF_ONLY_WAITING = "Chỉ đổi nhân viên khi lịch hẹn đang chờ phục vụ.";
        public const string MSG_ASSIGN_STAFF_UNCHANGED = "Nhân viên không thay đổi.";
        public const string MSG_ASSIGN_STAFF_UNAVAILABLE = "Nhân viên không khả dụng cho khung giờ này (trùng lịch, không có ca, hoặc không làm dịch vụ).";
        public const string MSG_ASSIGN_STAFF_SUCCESS = "Đã cập nhật nhân viên thành công.";
        #endregion
    }
}
