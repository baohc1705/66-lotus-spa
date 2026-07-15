namespace _66SMS.Contract.Settings
{
    /// <summary>
    /// Lịch chạy cho một background job.
    /// Ưu tiên IntervalMinutes nếu &gt; 0; không thì dùng Cron.
    /// </summary>
    public class JobScheduleSettings
    {
        /// <summary>
        /// Khoảng lặp lại (phút), ví dụ 10 hoặc 30. &lt;= 0 = không dùng interval.
        /// </summary>
        public int IntervalMinutes { get; set; }

        /// <summary>
        /// Cron Quartz (dùng khi IntervalMinutes &lt;= 0).
        /// Ví dụ: "0 0 3 * * ?" = mỗi ngày 03:00 UTC.
        /// </summary>
        public string? Cron { get; set; }
    }

    /// <summary>
    /// Cấu hình background jobs (Quartz). Mỗi job một JobScheduleSettings.
    /// </summary>
    public class BackgroundJobSettings
    {
        public const string SectionName = "BackgroundJobSettings";

        /// <summary>
        /// Dọn refresh token đã revoke. Mặc định: mỗi 30 phút.
        /// </summary>
        public JobScheduleSettings CleanupRevokedRefreshTokens { get; set; } = new()
        {
            IntervalMinutes = 30,
        };

        /// <summary>
        /// Đánh dấu soft lock ACTIVE hết hạn thành EXPIRED (nhả filtered unique). Mặc định: mỗi 5 phút.
        /// </summary>
        public JobScheduleSettings CleanupExpiredSlotLocks { get; set; } = new()
        {
            IntervalMinutes = 5,
        };
    }
}
