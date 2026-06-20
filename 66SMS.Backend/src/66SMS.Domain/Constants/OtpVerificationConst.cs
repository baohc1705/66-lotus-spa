namespace _66SMS.Domain.Constants
{
    public static class OtpVerificationConst
    {
        public const string TABLE_NAME = "otp_verifications";
        public const string FIELD_ID = "id";
        public const string FIELD_USER_ID = "user_id";
        public const string FIELD_OTP_CODE = "otp_code";
        public const string FIELD_EXPIRES_AT = "expires_at";
        public const string FIELD_IS_USED = "is_used";
        public const string FIELD_CREATED_AT = "created_at";
        public const int OTP_CODE_MAX_LENGTH = 6;

        #region Message
        public const string MSG_OTP_EMAIL_NOT_FOUND = "Không tìm thấy tài khoản với email này.";
        public const string MSG_OTP_EMAIL_ALREADY_VERIFIED = "Email đã được xác minh trước đó.";
        public const string MSG_OTP_NOT_SENT = "Chưa gửi OTP. Vui lòng yêu cầu gửi lại.";
        public const string MSG_OTP_INVALID_OR_EXPIRED = "OTP không hợp lệ hoặc đã hết hạn.";
        public const string MSG_OTP_WRONG_CODE = "Mã OTP không đúng.";
        #endregion
    }
}
