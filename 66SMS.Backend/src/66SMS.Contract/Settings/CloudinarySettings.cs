namespace _66SMS.Contract.Settings
{
    public class CloudinarySettings
    {
        public static string SectionName => "CloudinarySettings";
        public string CloudName { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string ApiSecret { get; set; } = string.Empty;
        public string RootFolder { get; set; } = "66sms";
        public string CommonFolder { get;} = $"66sms/commons";
        public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;
        public string[] AllowedExtensions { get; set; } = new[] { ".jpg", ".jpeg", ".png", ".webp" };
    }
}
