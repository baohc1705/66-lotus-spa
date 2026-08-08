namespace _66SMS.Contract.Settings
{
    /// <summary>
    /// Cấu hình Redis (cache + rate limit) — section "RedisSettings".
    /// </summary>
    public class RedisSettings
    {
        public static string SectionName => "RedisSettings";

        public string ConnectionString { get; set; } = "localhost:6379";

        public string InstanceName { get; set; } = "66sms:";

        public int DefaultTtlMinutes { get; set; } = 30;

        public int LoginLimitPerMinute { get; set; } = 10;

        public int OtpLimitPerMinute { get; set; } = 5;

        public int ForgotPasswordLimitPerMinute { get; set; } = 5;

        public int RegisterLimitPerMinute { get; set; } = 5;
    }
}
