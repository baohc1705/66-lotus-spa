namespace _66SMS.Contracts.Settings
{
    public class JobScheduleSettings
    {
        public int IntervalMinutes { get; set; }
        public string? Cron { get; set; }
    }
    public class BackgroundJobSettings
    {
        public const string SectionName = "BackgroundJobSettings";
        public JobScheduleSettings CleanupRevokedRefreshTokens { get; set; } = new()
        {
            IntervalMinutes = 30,
        };
        public JobScheduleSettings CleanupExpiredSlotLocks { get; set; } = new()
        {
            IntervalMinutes = 5,
        };
    }
}
