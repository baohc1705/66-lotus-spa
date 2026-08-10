namespace _66SMS.Contract.Helpers
{
    public static class DateTimeHelper
    {
        private const string DefaultDateOnly = "dd/MM/yyyy";
        private static readonly string[] TimeOnlyFormats =
        {
            "HH:mm:ss",
            "HH:mm",
            "H:mm:ss",
            "H:mm",
        };

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

        // FE gui "HH:mm" hoac "HH:mm:ss"
        public static TimeOnly? ParseTimeOnly(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            var text = value.Trim();
            if (TimeOnly.TryParseExact(
                    text,
                    TimeOnlyFormats,
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None,
                    out var result))
            {
                return result;
            }
            if (TimeOnly.TryParse(
                    text,
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None,
                    out result))
            {
                return result;
            }
            return null;
        }
    }
}
