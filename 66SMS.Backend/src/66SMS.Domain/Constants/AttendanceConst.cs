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
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_CHECKED_IN = 1;
        public const int STATUS_CHECKED_OUT = 2;
        public const int STATUS_ABSENT = 3;
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Bản ghi chấm công không tồn tại.";
        public const string MSG_ID_NOT_FOUND = $"{nameof(Entities.Attendance)} with id not found";
        public const string MSG_DUPLICATE = "Nhân viên đã chấm công trong ngày hôm nay.";
        public const string MSG_NOT_CHECKED_IN = "Chưa có bản ghi check-in trong ngày để check-out.";
        public const string MSG_CHECK_IN_SUCCESS = "Check-in thành công.";
        public const string MSG_CHECK_OUT_SUCCESS = "Check-out thành công.";
        public const string MSG_UPDATE_SUCCESS = "Cập nhật chấm công thành công.";
        #endregion
    }
}
