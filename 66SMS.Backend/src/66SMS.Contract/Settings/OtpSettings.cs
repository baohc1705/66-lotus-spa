namespace _66SMS.Contracts.Settings
{
    public class OtpSettings
    {
        public const string SectionName = "OtpSettings";
        public int ExpiryMinutes { get; set; } = 5;
    }
}
