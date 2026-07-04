namespace _66SMS.Domain.Constants
{
    public class AttendanceConst
    {
        #region Database
        public const string TABLE_NAME = "attendances";
        public const string FIELD_ID = "id";
        public const string FIELD_STAFF_ID = "staff_id";
        public const string FIELD_SALON_ID = "salon_id";
        public const string FIELD_WORK_SCHEDULE_ID = "work_schedule_id";
        public const string FIELD_WORK_DATE = "work_date";
        public const string FIELD_CHECK_IN_AT = "check_in_at";
        public const string FIELD_CHECK_OUT_AT = "check_out_at";
        public const string FIELD_WORKED_HOURS = "worked_hours";
        public const string FIELD_STATUS = "status";
        public const string FIELD_NOTE = "note";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_UPDATED_AT = "updated_at";
        #endregion

        #region Constraint
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_CHECKED_IN = 1;
        public const int STATUS_CHECKED_OUT = 2;
        public const int STATUS_ABSENT = 3;           // Vắng / nghỉ không lương = 0 công
        public const int STATUS_PAID_LEAVE = 4;       // Nghỉ phép hưởng lương = 1 công
        public const int STATUS_HOLIDAY = 5;          // Nghỉ lễ = 1 công
        public const int STATUS_UNPAID_LEAVE = 6;     // Nghỉ không lương = 0 công
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Bản ghi chấm công không tồn tại.";
        public const string MSG_ID_NOT_FOUND = $"{nameof(Entities.Attendance)} with id not found";
        public const string MSG_DUPLICATE = "Nhân viên đã chấm công ca này.";
        public const string MSG_NOT_CHECKED_IN = "Chưa có bản ghi check-in cho ca này để check-out.";
        public const string MSG_WORK_SCHEDULE_REQUIRED = "Vui lòng chọn ca làm việc khi chấm công.";
        public const string MSG_CHECK_IN_SUCCESS = "Check-in thành công.";
        public const string MSG_CHECK_OUT_SUCCESS = "Check-out thành công.";
        public const string MSG_UPDATE_SUCCESS = "Cập nhật chấm công thành công.";
        public const string MSG_CREATE_MANUAL_SUCCESS = "Tạo bản ghi chấm công thành công.";
        public const string MSG_INVALID_STATUS = "Trạng thái chấm công không hợp lệ.";
        #endregion
    }
}
