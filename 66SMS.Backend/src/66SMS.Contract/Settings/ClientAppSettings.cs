namespace _66SMS.Contracts.Settings
{
    /// <summary>
    /// Cấu hình app phía client (frontend) dùng để dựng các link gửi qua email.
    /// </summary>
    public class ClientAppSettings
    {
        public const string SectionName = "ClientAppSettings";

        /// <summary>URL gốc của frontend, ví dụ https://localhost:5173</summary>
        public string BaseUrl { get; set; } = string.Empty;

        /// <summary>Đường dẫn trang đặt lại mật khẩu, ví dụ /reset-password</summary>
        public string ResetPasswordPath { get; set; } = "/reset-password";
    }
}
