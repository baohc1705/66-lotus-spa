namespace _66SMS.Contract.Settings
{
    /// <summary>
    /// Cấu hình RabbitMQ.
    /// </summary>
    public class RabbitMqSettings
    {
        /// <summary>
        /// Tên section trong appsettings.json.
        /// </summary>
        public const string SectionName = "RabbitMqSettings";
        /// <summary>
        /// URL của RabbitMQ.
        /// </summary>
        public string Host { get; set; } = "localhost";
        /// <summary>
        /// Tên người dùng của RabbitMQ.
        /// </summary>
        public string Username { get; set; } = "guest";
        /// <summary>
        /// Mật khẩu của RabbitMQ.
        /// </summary>
        public string Password { get; set; } = "guest";
    }
}

