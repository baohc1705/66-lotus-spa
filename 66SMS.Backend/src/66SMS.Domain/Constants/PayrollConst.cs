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
        // Quy đổi công: >= 8h = 1 công, >= 4h = 0.5 công, < 4h = 0 công.
        public const decimal STANDARD_HOURS_PER_DAY = 8;
        public const decimal HALF_DAY_THRESHOLD = 4;
        // Đi muộn quá số giờ này so với giờ vào ca → tối đa 0.5 công.
        public const decimal LATE_THRESHOLD_HOURS = 1;
        // Giờ vào ca mặc định khi không có lịch làm việc (08:00).
        public static readonly TimeOnly DEFAULT_SHIFT_START = new(8, 0);
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
        #endregion
    }
}
