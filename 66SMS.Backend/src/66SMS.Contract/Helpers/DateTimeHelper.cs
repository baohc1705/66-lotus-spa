namespace _66SMS.Contract.Helpers
{
    public static class DateTimeHelper
    {
        private const string DefaultDateOnly = "dd/MM/yyyy";

        public static DateTimeOffset UtcNow() => DateTimeOffset.UtcNow;
        public static string UtcNowString(string format = "yyyyMMddHHmmss") => UtcNow().ToString(format);
        public static bool IsExpired(this DateTimeOffset utcTime) => utcTime < UtcNow();
        public static DateOnly ToDateOnly(this DateTimeOffset utcTime) => DateOnly.FromDateTime(utcTime.UtcDateTime);
        public static DateOnly UtcToday() => DateOnly.FromDateTime(UtcNow().UtcDateTime);
        public static DateOnly? ParseDateOnly(this string? value, string? format = DefaultDateOnly)
        {
            if (string.IsNullOrEmpty(value)) return null;
            return DateOnly.TryParseExact(value, format, out var result) ? result : null;
        }
    }
}
