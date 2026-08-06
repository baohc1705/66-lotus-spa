namespace _66SMS.Domain.Constants
{
    public class PayrollConst
    {
        #region Database
        public const string TABLE_NAME = "payrolls";
        public const string FIELD_ID = "id";
        public const string FIELD_STAFF_ID = "staff_id";
        public const string FIELD_SALON_ID = "salon_id";
        public const string FIELD_PERIOD_MONTH = "period_month";
        public const string FIELD_PERIOD_YEAR = "period_year";
        public const string FIELD_SALARY_TYPE = "salary_type";
        public const string FIELD_RATE = "rate";
        public const string FIELD_TOTAL_HOURS = "total_hours";
        public const string FIELD_TOTAL_WORK_DAYS = "total_work_days";
        public const string FIELD_BASE_AMOUNT = "base_amount";
        public const string FIELD_COMMISSION_AMOUNT = "commission_amount";
        public const string FIELD_TOTAL_AMOUNT = "total_amount";
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
        public const int STATUS_DRAFT = 1;
        public const int STATUS_CONFIRMED = 2;
        #endregion

        #region Salary Type
        public const int SALARY_TYPE_HOURLY = 1;
        public const int SALARY_TYPE_DAILY = 2;
        #endregion

        #region Business
        // Quy đổi công theo số giờ làm (check-in → check-out): >= 8h = 1, >= 4h = 0.5, < 4h = 0.
        public const decimal STANDARD_HOURS_PER_DAY = 8;
        public const decimal HALF_DAY_THRESHOLD = 4;
        // Mặc định trừ cả Thứ 7 khi tính ngày công chuẩn tháng.
        public const bool DEFAULT_EXCLUDE_SATURDAY = true;
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Bảng lương không tồn tại.";
        public const string MSG_ID_NOT_FOUND = $"{nameof(Entities.Payroll)} with id not found";
        public const string MSG_ALREADY_CONFIRMED = "Bảng lương đã được chốt, không thể tính lại.";
        public const string MSG_NO_ATTENDANCE = "Không có dữ liệu chấm công nào trong kỳ để tính lương.";
        public const string MSG_INVALID_STANDARD_DAYS = "Không xác định được ngày công chuẩn của tháng.";
        public const string MSG_GENERATE_SUCCESS = "Tính lương thành công.";
        public const string MSG_CONFIRM_SUCCESS = "Chốt bảng lương thành công.";
        public const string MSG_UPDATE_SUCCESS = "Cập nhật bảng lương thành công.";
        public const string MSG_STAFF_REQUIRED = "Vui lòng chọn nhân viên.";
        public const string MSG_STAFF_PROFILE_REQUIRED = "Tài khoản chưa gắn hồ sơ nhân viên.";
        public const string MSG_INVALID_DATE_RANGE = "Khoảng ngày không hợp lệ.";
        public const string MSG_DATE_RANGE_TOO_LARGE = "Khoảng ngày không được vượt quá 62 ngày.";
        #endregion

        #region Stats
        public const int STATS_MAX_RANGE_DAYS = 62;
        #endregion
    }
}
