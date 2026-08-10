namespace _66SMS.Domain.Constants
{
    public class ConfigAppointmentConst
    {
        #region Database
        public const string TABLE_NAME = "config_appointments";
        public const string FIELD_ID = "id";
        public const string FIELD_DEPOSIT_PERCENT = "deposit_percent";
        public const string FIELD_START_TIME = "start_time";
        public const string FIELD_END_TIME = "end_time";
        public const string FIELD_SLOT_MINUTES = "slot_minutes";
        public const string FIELD_SALON_ID = "salon_id";
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Không tìm thấy cấu hình lịch hẹn.";
        public const string MSG_SALON_EXISTED = "Chi nhánh này đã có cấu hình lịch hẹn.";
        public const string MSG_SALON_REQUIRED = "Vui lòng chọn chi nhánh.";
        public const string MSG_DEPOSIT_PERCENT_NOT_CONFIGURED = "Chưa cấu hình phần trăm cọc cho chi nhánh.";
        public const string MSG_DEPOSIT_PERCENT_INVALID = "Phần trăm cọc phải từ 0 đến 100.";
        public const string MSG_SLOT_MINUTES_INVALID = "Số phút mỗi khung giờ phải lớn hơn 0.";
        public const string MSG_TIME_RANGE_INVALID = "Giờ kết thúc phải lớn hơn giờ bắt đầu.";
        #endregion
    }
}
