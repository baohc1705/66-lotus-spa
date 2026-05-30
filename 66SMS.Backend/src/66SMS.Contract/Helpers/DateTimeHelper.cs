namespace _66SMS.Contracts.Helpers
{
    public static class DateTimeHelper
    {
        private const string DefaultFormat = "dd/MM/yyyy HH:mm";
        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById(OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh");
        public static DateTime ToVietnamTime(this DateTime utcTime) => TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcTime, DateTimeKind.Utc), VietnamTimeZone);
        public static DateTime? ToVietnamTime(this DateTime? utcTime) => utcTime.HasValue ? utcTime.Value.ToVietnamTime() : null;
        public static DateTime ToUtc(this DateTime vietnamTime) => TimeZoneInfo.ConvertTimeToUtc(vietnamTime, VietnamTimeZone);
        public static string ToVietnamTimeString(this DateTime utcTime, string format = DefaultFormat) => utcTime.ToVietnamTime().ToString(format);
        public static string? ToVietnamTimeString(this DateTime? utcTime, string format = DefaultFormat) => utcTime.HasValue ? utcTime.Value.ToVietnamTimeString(format) : null;
        public static DateTime UtcNow() => DateTime.UtcNow;
        public static DateTime VietnamNow() => DateTime.UtcNow.ToVietnamTime();
        public static string VietnamNowString(string format = DefaultFormat) => VietnamNow().ToString(format);

        // Kiểm tra có phải hôm nay không (VN)
        public static bool IsToday(this DateTime utcTime) => utcTime.ToVietnamTime().Date == VietnamNow().Date;

        // Kiểm tra đã quá hạn chưa
        public static bool IsExpired(this DateTime utcTime) => utcTime < DateTime.UtcNow;

        public static bool IsExpired(this DateTime? utcTime) => utcTime.HasValue && utcTime.Value.IsExpired();

        // Khoảng cách đến hiện tại — dùng cho "x phút trước", "x giờ trước"
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
    }
}
