namespace _66SMS.Contract.Settings
{
    public class OtpSettings
    {
        public const string SectionName = "OtpSettings";
        public int ExpiryMinutes { get; set; } = 5;
    }
}
