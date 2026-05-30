namespace _66SMS.Contracts.Constants
{
    public static class MailConst
    {
        public static class Subject
        {
            public const string PasswordReset = "Đặt lại mật khẩu - 66SMS";
            public const string EmailConfirmation = "Xác nhận địa chỉ email - 66SMS";
            public const string WelcomeEmail = "Chào mừng bạn đến với 66SMS";
            public const string AppointmentReminder = "Nhắc nhở lịch hẹn - 66SMS";
        }

        public static class Template
        {
            public const string AppName = "66SMS";
            public const string PrimaryColor = "#6366f1";
            public const string DangerColor = "#ef4444";
            public const string FooterTextColor = "#888888";
            public const string FooterFontSize = "12px";
            public const string ButtonTextColor = "white";
            public const string ButtonPadding = "12px 24px";
            public const string ButtonBorderRadius = "6px";
        }

        public static class Expiry
        {
            public const int PasswordResetTokenHours = 1;
            public const int EmailConfirmationTokenHours = 24;
        }
    }
}
