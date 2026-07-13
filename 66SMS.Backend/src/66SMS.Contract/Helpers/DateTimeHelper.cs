namespace _66SMS.Contracts.Helpers
{

    public static class DateTimeHelper
    {
        private const string DefaultFormat = "dd/MM/yyyy HH:mm";
        private const string DefaultDateOnly = "dd/MM/yyyy";
        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById(OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh");

        // DateTimeOffset (primary — khớp DATETIMEOFFSET trong DB)
        public static DateTimeOffset UtcNow() => DateTimeOffset.UtcNow;
        public static DateTimeOffset VietnamNow() => TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, VietnamTimeZone);
        public static string VietnamNowString(string format = DefaultFormat) => VietnamNow().ToString(format);

        public static DateTimeOffset ToVietnamTime(this DateTimeOffset utcTime) => TimeZoneInfo.ConvertTime(utcTime, VietnamTimeZone);
        public static DateTimeOffset? ToVietnamTime(this DateTimeOffset? utcTime) => utcTime.HasValue ? utcTime.Value.ToVietnamTime() : null;
        public static string ToVietnamTimeString(this DateTimeOffset utcTime, string format = DefaultFormat) => utcTime.ToVietnamTime().ToString(format);
        public static string? ToVietnamTimeString(this DateTimeOffset? utcTime, string format = DefaultFormat) => utcTime.HasValue ? utcTime.Value.ToVietnamTimeString(format) : null;
        public static bool IsToday(this DateTimeOffset utcTime) => utcTime.ToVietnamTime().Date == VietnamNow().Date;
        public static bool IsExpired(this DateTimeOffset utcTime) => utcTime < DateTimeOffset.UtcNow;
        public static bool IsExpired(this DateTimeOffset? utcTime) => utcTime.HasValue && utcTime.Value.IsExpired();
        public static DateOnly ToDateOnly(this DateTimeOffset utcTime) => DateOnly.FromDateTime(utcTime.ToVietnamTime().DateTime);
        public static DateOnly? ToDateOnly(this DateTimeOffset? utcTime) => utcTime.HasValue ? utcTime.Value.ToDateOnly() : null;
        public static string TimeAgo(this DateTimeOffset utcTime)
        {
            var diff = DateTimeOffset.UtcNow - utcTime;
            return diff.TotalSeconds switch
            {
                < 60 => "Vừa xong",
                < 3600 => $"{(int)diff.TotalMinutes} phút trước",
                < 86400 => $"{(int)diff.TotalHours} giờ trước",
                < 2592000 => $"{(int)diff.TotalDays} ngày trước",
                _ => utcTime.ToVietnamTimeString()
            };
        }

        // DateTime (giữ cho chỗ còn dùng DateTime, ví dụ OtpVerification)
        public static DateTime ToVietnamTime(this DateTime utcTime) => TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcTime, DateTimeKind.Utc), VietnamTimeZone);
        public static DateTime? ToVietnamTime(this DateTime? utcTime) => utcTime.HasValue ? utcTime.Value.ToVietnamTime() : null;
        public static DateTime ToUtc(this DateTime vietnamTime) => TimeZoneInfo.ConvertTimeToUtc(vietnamTime, VietnamTimeZone);
        public static string ToVietnamTimeString(this DateTime utcTime, string format = DefaultFormat) => utcTime.ToVietnamTime().ToString(format);
        public static string? ToVietnamTimeString(this DateTime? utcTime, string format = DefaultFormat) => utcTime.HasValue ? utcTime.Value.ToVietnamTimeString(format) : null;
        public static bool IsToday(this DateTime utcTime) => utcTime.ToVietnamTime().Date == VietnamNow().DateTime.Date;
        public static bool IsExpired(this DateTime utcTime) => utcTime < DateTime.UtcNow;
        public static bool IsExpired(this DateTime? utcTime) => utcTime.HasValue && utcTime.Value.IsExpired();
        public static string TimeAgo(this DateTime utcTime)
        {
            var diff = DateTime.UtcNow - utcTime;
            return diff.TotalSeconds switch
            {
                < 60 => "Vừa xong",
                < 3600 => $"{(int)diff.TotalMinutes} phút trước",
                < 86400 => $"{(int)diff.TotalHours} giờ trước",
                < 2592000 => $"{(int)diff.TotalDays} ngày trước",
                _ => utcTime.ToVietnamTimeString()
            };
        }

        // DateOnly
        public static string ToDateOnlyString(this DateOnly date, string? format = DefaultDateOnly) => date.ToString(format);
        public static string? ToDateOnlyString(this DateOnly? date, string? format = DefaultDateOnly) => date.HasValue ? date.Value.ToDateOnlyString(format) : null;
        public static string ToDateOnlyString(this DateOnly date) => date.ToString(DefaultDateOnly);
        public static string? ToDateOnlyString(this DateOnly? date) => date.HasValue ? date.Value.ToDateOnlyString() : null;

        public static DateOnly ToDateOnly(this DateTime utcTime) => DateOnly.FromDateTime(utcTime.ToVietnamTime());
        public static DateOnly? ToDateOnly(this DateTime? utcTime) => utcTime.HasValue ? utcTime.Value.ToDateOnly() : null;
        public static DateOnly VietnamToday() => DateOnly.FromDateTime(VietnamNow().DateTime);
        public static bool IsToday(this DateOnly date) => date == VietnamToday();
        public static bool IsPast(this DateOnly date) => date < VietnamToday();
        public static bool IsFuture(this DateOnly date) => date > VietnamToday();
        public static int Age(this DateOnly dob) 
        { 
            var today = VietnamToday(); 
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
