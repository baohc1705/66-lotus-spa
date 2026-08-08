namespace _66SMS.Contract.Helpers
{
    /// <summary>
    /// Chuẩn thời gian hệ thống: UTC (DateTimeOffset).
    /// Frontend đổi sang local khi hiển thị.
    /// </summary>
    public static class DateTimeHelper
    {
        private const string DefaultDateOnly = "dd/MM/yyyy";

       
        public static DateTimeOffset UtcNow() => DateTimeOffset.UtcNow;

        public static string UtcNowString(string format = "yyyyMMddHHmmss") => UtcNow().ToString(format);

        /// <summary>DateTimeOffset → ISO 8601 UTC (ví dụ 2026-07-15T08:30:00.0000000Z) cho API/FE.</summary>
        public static string ToUtcIsoString(this DateTimeOffset utcTime) =>
            utcTime.ToUniversalTime().UtcDateTime.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'");

        public static string? ToUtcIsoString(this DateTimeOffset? utcTime) =>
            utcTime.HasValue ? utcTime.Value.ToUtcIsoString() : null;

        public static bool IsExpired(this DateTimeOffset utcTime) => utcTime < UtcNow();
        public static bool IsExpired(this DateTimeOffset? utcTime) => utcTime.HasValue && utcTime.Value.IsExpired();

        public static bool IsToday(this DateTimeOffset utcTime) => utcTime.ToDateOnly() == UtcToday();

        /// <summary>Lấy DateOnly theo ngày UTC (không đổi timezone).</summary>
        public static DateOnly ToDateOnly(this DateTimeOffset utcTime) => DateOnly.FromDateTime(utcTime.UtcDateTime);
        public static DateOnly? ToDateOnly(this DateTimeOffset? utcTime) => utcTime.HasValue ? utcTime.Value.ToDateOnly() : null;

        /// <summary>Lấy TimeOnly theo giờ UTC (không đổi timezone).</summary>
        public static TimeOnly ToTimeOnly(this DateTimeOffset utcTime) => TimeOnly.FromDateTime(utcTime.UtcDateTime);
        public static TimeOnly? ToTimeOnly(this DateTimeOffset? utcTime) => utcTime.HasValue ? utcTime.Value.ToTimeOnly() : null;

        public static string TimeAgo(this DateTimeOffset utcTime)
        {
            var diff = UtcNow() - utcTime;
            return diff.TotalSeconds switch
            {
                < 60 => "Vừa xong",
                < 3600 => $"{(int)diff.TotalMinutes} phút trước",
                < 86400 => $"{(int)diff.TotalHours} giờ trước",
                < 2592000 => $"{(int)diff.TotalDays} ngày trước",
                _ => utcTime.ToString("dd/MM/yyyy HH:mm")
            };
        }

    
        public static DateOnly UtcToday() => DateOnly.FromDateTime(UtcNow().UtcDateTime);

        public static string ToDateOnlyString(this DateOnly date, string? format = DefaultDateOnly) => date.ToString(format);
        public static string? ToDateOnlyString(this DateOnly? date, string? format = DefaultDateOnly) => date.HasValue ? date.Value.ToDateOnlyString(format) : null;
        public static string ToDateOnlyString(this DateOnly date) => date.ToString(DefaultDateOnly);
        public static string? ToDateOnlyString(this DateOnly? date) => date.HasValue ? date.Value.ToDateOnlyString() : null;

        public static bool IsToday(this DateOnly date) => date == UtcToday();
        public static bool IsPast(this DateOnly date) => date < UtcToday();
        public static bool IsFuture(this DateOnly date) => date > UtcToday();

        public static int Age(this DateOnly dob)
        {
            var today = UtcToday();
            var age = today.Year - dob.Year;
            return dob > today.AddYears(-age) ? age - 1 : age;
        }

        public static DateOnly? ParseDateOnly(this string? value, string? format = DefaultDateOnly)
        {
            if (string.IsNullOrEmpty(value)) return null;
            return DateOnly.TryParseExact(value, format, out var result) ? result : null;
        }
    }
}
